import googleAuthService from '../google/googleAuthService';
import spotifyAuthService from '../spotify/spotifyAuthService';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string };
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
}

export interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

export interface CrossPlatformTrack {
  spotify: SpotifyTrack;
  youtube: YouTubeVideo | null;
  searchQuery: string;
  matchConfidence: 'high' | 'medium' | 'low' | 'none';
}

class CrossPlatformMusicService {
  private async fetchSpotifyAPI(endpoint: string, method: string = 'GET'): Promise<any> {
    const token = await spotifyAuthService.getStoredAccessToken();
    if (!token) {
      throw new Error('No Spotify access token available');
    }

    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
    });

    if (!res.ok) {
      throw new Error(`Spotify API error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  }

  private async fetchYouTubeAPI(endpoint: string, method: string = 'GET'): Promise<any> {
    const token = await googleAuthService.getStoredAccessToken();
    if (!token) {
      throw new Error('No Google access token available');
    }

    const res = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
    });

    if (!res.ok) {
      throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Get user's top tracks from Spotify
   */
  async getSpotifyTopTracks(limit: number = 5, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'long_term'): Promise<SpotifyTrack[]> {
    try {
      console.log(`🎵 Fetching top ${limit} Spotify tracks (${timeRange})...`);
      
      const response = await this.fetchSpotifyAPI(`v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
      const tracks = response.items || [];

      console.log(`✅ Retrieved ${tracks.length} tracks from Spotify`);
      return tracks;
    } catch (error) {
      console.error('❌ Error fetching Spotify top tracks:', error);
      throw error;
    }
  }

  /**
   * Search for a track on YouTube
   */
  async searchYouTubeForTrack(trackName: string, artistName: string): Promise<YouTubeVideo[]> {
    try {
      // Create search query with track name and artist
      const searchQuery = `${trackName} ${artistName}`.replace(/[^\w\s]/g, ' ').trim();
      const encodedQuery = encodeURIComponent(searchQuery);
      
      console.log(`🔍 Searching YouTube for: "${searchQuery}"`);

      const response = await this.fetchYouTubeAPI(
        `search?part=snippet&type=video&q=${encodedQuery}&maxResults=3&order=relevance`
      );

      const videos = response.items || [];
      console.log(`📺 Found ${videos.length} YouTube videos for "${searchQuery}"`);
      
      return videos;
    } catch (error) {
      console.error(`❌ Error searching YouTube for "${trackName}" by ${artistName}:`, error);
      return [];
    }
  }

  /**
   * Calculate match confidence between Spotify track and YouTube video
   */
  private calculateMatchConfidence(spotifyTrack: SpotifyTrack, youtubeVideo: YouTubeVideo): 'high' | 'medium' | 'low' | 'none' {
    const trackName = spotifyTrack.name.toLowerCase();
    const artistName = spotifyTrack.artists[0]?.name.toLowerCase() || '';
    const videoTitle = youtubeVideo.snippet.title.toLowerCase();
    const channelTitle = youtubeVideo.snippet.channelTitle.toLowerCase();

    // High confidence: Track name and artist both in title or channel
    if (videoTitle.includes(trackName) && (videoTitle.includes(artistName) || channelTitle.includes(artistName))) {
      return 'high';
    }

    // Medium confidence: Track name in title
    if (videoTitle.includes(trackName)) {
      return 'medium';
    }

    // Low confidence: Partial matches
    const trackWords = trackName.split(' ').filter(word => word.length > 2);
    const artistWords = artistName.split(' ').filter(word => word.length > 2);
    
    let matches = 0;
    const totalWords = trackWords.length + artistWords.length;

    trackWords.forEach(word => {
      if (videoTitle.includes(word)) matches++;
    });

    artistWords.forEach(word => {
      if (videoTitle.includes(word) || channelTitle.includes(word)) matches++;
    });

    if (matches / totalWords > 0.5) {
      return 'low';
    }

    return 'none';
  }

  /**
   * Find the best YouTube match for a Spotify track
   */
  async findYouTubeVersionOfSpotifyTrack(spotifyTrack: SpotifyTrack): Promise<CrossPlatformTrack> {
    const artistName = spotifyTrack.artists.map(artist => artist.name).join(' ');
    const searchQuery = `${spotifyTrack.name} ${artistName}`;

    try {
      const youtubeVideos = await this.searchYouTubeForTrack(spotifyTrack.name, artistName);
      
      if (youtubeVideos.length === 0) {
        return {
          spotify: spotifyTrack,
          youtube: null,
          searchQuery,
          matchConfidence: 'none'
        };
      }

      // Find the best match based on confidence
      let bestMatch: YouTubeVideo | null = null;
      let bestConfidence: 'high' | 'medium' | 'low' | 'none' = 'none';

      for (const video of youtubeVideos) {
        const confidence = this.calculateMatchConfidence(spotifyTrack, video);
        
        if (confidence === 'high' || (confidence === 'medium' && bestConfidence !== 'high') || 
            (confidence === 'low' && bestConfidence === 'none')) {
          bestMatch = video;
          bestConfidence = confidence;
        }

        // If we found a high confidence match, stop searching
        if (confidence === 'high') break;
      }

      return {
        spotify: spotifyTrack,
        youtube: bestMatch,
        searchQuery,
        matchConfidence: bestConfidence
      };

    } catch (error) {
      console.error(`❌ Error finding YouTube version for "${spotifyTrack.name}":`, error);
      return {
        spotify: spotifyTrack,
        youtube: null,
        searchQuery,
        matchConfidence: 'none'
      };
    }
  }

  /**
   * Get user's top Spotify tracks and find their YouTube versions
   */
  async getSpotifyTracksWithYouTubeVersions(limit: number = 5): Promise<CrossPlatformTrack[]> {
    try {
      console.log('🚀 Starting cross-platform music discovery...');
      
      // Check if both services are connected
      const spotifyConnected = await spotifyAuthService.isSpotifyConnected();
      const googleConnected = await googleAuthService.isGoogleConnected();

      if (!spotifyConnected) {
        throw new Error('Spotify is not connected. Please connect your Spotify account first.');
      }

      if (!googleConnected) {
        throw new Error('Google is not connected. Please connect your Google account first.');
      }

      console.log('✅ Both Spotify and YouTube are connected');

      // Get top tracks from Spotify
      const spotifyTracks = await this.getSpotifyTopTracks(limit);
      
      if (spotifyTracks.length === 0) {
        console.log('⚠️ No Spotify tracks found');
        return [];
      }

      console.log(`🎯 Finding YouTube versions for ${spotifyTracks.length} tracks...`);

      // Find YouTube versions for each track
      const crossPlatformTracks: CrossPlatformTrack[] = [];
      
      for (let i = 0; i < spotifyTracks.length; i++) {
        const track = spotifyTracks[i];
        console.log(`\n📀 Processing track ${i + 1}/${spotifyTracks.length}: "${track.name}" by ${track.artists[0]?.name}`);
        
        try {
          const crossPlatformTrack = await this.findYouTubeVersionOfSpotifyTrack(track);
          crossPlatformTracks.push(crossPlatformTrack);

          if (crossPlatformTrack.youtube) {
            console.log(`✅ Found YouTube match (${crossPlatformTrack.matchConfidence} confidence): "${crossPlatformTrack.youtube.snippet.title}"`);
          } else {
            console.log(`❌ No YouTube match found for "${track.name}"`);
          }

          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Error processing track "${track.name}":`, error);
          crossPlatformTracks.push({
            spotify: track,
            youtube: null,
            searchQuery: `${track.name} ${track.artists[0]?.name}`,
            matchConfidence: 'none'
          });
        }
      }

      console.log('\n🎉 Cross-platform music discovery complete!');
      return crossPlatformTracks;

    } catch (error) {
      console.error('❌ Cross-platform music discovery failed:', error);
      throw error;
    }
  }

  /**
   * Print a summary of cross-platform results
   */
  printCrossPlatformSummary(tracks: CrossPlatformTrack[]): void {
    console.log('\n📊 Cross-Platform Music Discovery Summary');
    console.log('==========================================');
    
    const stats = {
      total: tracks.length,
      found: tracks.filter(t => t.youtube !== null).length,
      high: tracks.filter(t => t.matchConfidence === 'high').length,
      medium: tracks.filter(t => t.matchConfidence === 'medium').length,
      low: tracks.filter(t => t.matchConfidence === 'low').length,
      none: tracks.filter(t => t.matchConfidence === 'none').length
    };

    console.log(`📈 Statistics:`);
    console.log(`   Total tracks: ${stats.total}`);
    console.log(`   YouTube versions found: ${stats.found}/${stats.total} (${Math.round(stats.found/stats.total*100)}%)`);
    console.log(`   High confidence matches: ${stats.high}`);
    console.log(`   Medium confidence matches: ${stats.medium}`);
    console.log(`   Low confidence matches: ${stats.low}`);
    console.log(`   No matches: ${stats.none}`);

    console.log('\n🎵 Track Details:');
    tracks.forEach((track, index) => {
      const artistName = track.spotify.artists.map(a => a.name).join(', ');
      const confidence = track.matchConfidence;
      const status = track.youtube ? `✅ ${confidence}` : '❌ none';
      
      console.log(`${index + 1}. "${track.spotify.name}" by ${artistName} - ${status}`);
      
      if (track.youtube) {
        console.log(`   📺 YouTube: "${track.youtube.snippet.title}" by ${track.youtube.snippet.channelTitle}`);
        console.log(`   🔗 https://youtube.com/watch?v=${track.youtube.id.videoId}`);
      }
    });
  }
}

export default new CrossPlatformMusicService();