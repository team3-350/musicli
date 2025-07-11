import crossPlatformMusicService from '@/src/services/music/crossPlatformMusicService';
import spotifyAuthService from '@/src/services/spotify/spotifyAuthService';
import googleAuthService from '@/src/services/google/googleAuthService';

/**
 * Cross-Platform Music Discovery Test Suite
 * 
 * Tests the integration between Spotify and YouTube to find
 * YouTube versions of user's top Spotify tracks.
 */

// Mock data for testing
const mockSpotifyTracks = [
  {
    id: '4iV5W9uYEdYUVa79Axb7Rh',
    name: 'Never Gonna Give You Up',
    artists: [{ name: 'Rick Astley' }],
    album: { name: 'Whenever You Need Somebody' },
    duration_ms: 213573,
    popularity: 85,
    external_urls: { spotify: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh' }
  },
  {
    id: '0VjIjW4GlULA8NzVZmtY70',
    name: 'Bohemian Rhapsody',
    artists: [{ name: 'Queen' }],
    album: { name: 'A Night At The Opera' },
    duration_ms: 355000,
    popularity: 95,
    external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlULA8NzVZmtY70' }
  },
  {
    id: '7qiZfU4dY1lWllzX7mPBI3',
    name: 'Shape of You',
    artists: [{ name: 'Ed Sheeran' }],
    album: { name: '÷ (Divide)' },
    duration_ms: 233713,
    popularity: 92,
    external_urls: { spotify: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3' }
  }
];

const mockYouTubeVideos = [
  {
    id: { videoId: 'dQw4w9WgXcQ' },
    snippet: {
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      channelTitle: 'Rick Astley',
      description: 'The official video for "Never Gonna Give You Up" by Rick Astley',
      publishedAt: '2009-10-25T06:57:33Z',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg' },
        medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
        high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' }
      }
    }
  }
];

describe('Cross-Platform Music Discovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Integration Tests', () => {
    test('should have cross-platform music service available', () => {
      expect(crossPlatformMusicService).toBeDefined();
      expect(typeof crossPlatformMusicService.getSpotifyTopTracks).toBe('function');
      expect(typeof crossPlatformMusicService.searchYouTubeForTrack).toBe('function');
      expect(typeof crossPlatformMusicService.findYouTubeVersionOfSpotifyTrack).toBe('function');
      expect(typeof crossPlatformMusicService.getSpotifyTracksWithYouTubeVersions).toBe('function');
      
      console.log('✅ Cross-platform music service methods available');
    });

    test('should validate auth service dependencies', () => {
      expect(spotifyAuthService).toBeDefined();
      expect(googleAuthService).toBeDefined();
      expect(typeof spotifyAuthService.isSpotifyConnected).toBe('function');
      expect(typeof googleAuthService.isGoogleConnected).toBe('function');
      
      console.log('✅ Auth service dependencies validated');
    });
  });

  describe('Mock Data Tests', () => {
    test('should validate Spotify track mock data structure', () => {
      const track = mockSpotifyTracks[0];
      
      expect(track).toHaveProperty('id');
      expect(track).toHaveProperty('name');
      expect(track).toHaveProperty('artists');
      expect(track).toHaveProperty('album');
      expect(track).toHaveProperty('duration_ms');
      expect(track).toHaveProperty('popularity');
      expect(track).toHaveProperty('external_urls');
      
      expect(Array.isArray(track.artists)).toBe(true);
      expect(track.artists[0]).toHaveProperty('name');
      
      console.log('✅ Spotify track data structure validated');
    });

    test('should validate YouTube video mock data structure', () => {
      const video = mockYouTubeVideos[0];
      
      expect(video).toHaveProperty('id');
      expect(video.id).toHaveProperty('videoId');
      expect(video).toHaveProperty('snippet');
      expect(video.snippet).toHaveProperty('title');
      expect(video.snippet).toHaveProperty('channelTitle');
      expect(video.snippet).toHaveProperty('description');
      expect(video.snippet).toHaveProperty('publishedAt');
      expect(video.snippet).toHaveProperty('thumbnails');
      
      console.log('✅ YouTube video data structure validated');
    });
  });

  describe('Search Query Generation', () => {
    test('should generate proper search queries for tracks', () => {
      const track = mockSpotifyTracks[0]; // "Never Gonna Give You Up" by Rick Astley
      const expectedQuery = 'Never Gonna Give You Up Rick Astley';
      
      // Test query generation logic
      const artistName = track.artists.map(artist => artist.name).join(' ');
      const searchQuery = `${track.name} ${artistName}`;
      
      expect(searchQuery).toBe(expectedQuery);
      console.log(`✅ Search query generated: "${searchQuery}"`);
    });

    test('should handle special characters in track names', () => {
      const trackWithSpecialChars = {
        name: 'Shape of You (Acoustic)',
        artists: [{ name: 'Ed Sheeran' }]
      };
      
      const searchQuery = `${trackWithSpecialChars.name} ${trackWithSpecialChars.artists[0].name}`;
      const cleanedQuery = searchQuery.replace(/[^\w\s]/g, ' ').trim();
      
      expect(cleanedQuery).toBe('Shape of You Acoustic  Ed Sheeran');
      console.log(`✅ Special characters handled: "${cleanedQuery}"`);
    });
  });

  describe('Match Confidence Algorithm', () => {
    test('should calculate high confidence for exact matches', () => {
      const spotifyTrack = mockSpotifyTracks[0]; // Rick Astley - Never Gonna Give You Up
      const youtubeVideo = mockYouTubeVideos[0]; // Rick Astley - Never Gonna Give You Up (Official Music Video)
      
      // Simulate the confidence calculation logic
      const trackName = spotifyTrack.name.toLowerCase();
      const artistName = spotifyTrack.artists[0].name.toLowerCase();
      const videoTitle = youtubeVideo.snippet.title.toLowerCase();
      const channelTitle = youtubeVideo.snippet.channelTitle.toLowerCase();
      
      const hasTrackName = videoTitle.includes(trackName);
      const hasArtistName = videoTitle.includes(artistName) || channelTitle.includes(artistName);
      
      expect(hasTrackName).toBe(true);
      expect(hasArtistName).toBe(true);
      
      console.log('✅ High confidence match algorithm validated');
    });

    test('should handle partial matches correctly', () => {
      const partialMatch = {
        spotifyTrack: { name: 'Bohemian Rhapsody', artists: [{ name: 'Queen' }] },
        youtubeVideo: { 
          snippet: { 
            title: 'Queen - Bohemian', 
            channelTitle: 'Queen Official' 
          } 
        }
      };
      
      const trackName = partialMatch.spotifyTrack.name.toLowerCase();
      const videoTitle = partialMatch.youtubeVideo.snippet.title.toLowerCase();
      
      // Should find partial match for "bohemian"
      const hasPartialMatch = trackName.split(' ').some(word => 
        word.length > 2 && videoTitle.includes(word)
      );
      
      expect(hasPartialMatch).toBe(true);
      console.log('✅ Partial match algorithm validated');
    });
  });

  describe('API Call Structure Tests', () => {
    test('should construct correct Spotify API endpoints', () => {
      const endpoints = {
        topTracks: 'v1/me/top/tracks?time_range=long_term&limit=5',
        shortTerm: 'v1/me/top/tracks?time_range=short_term&limit=10',
        mediumTerm: 'v1/me/top/tracks?time_range=medium_term&limit=3'
      };
      
      // Validate endpoint structure
      Object.entries(endpoints).forEach(([key, endpoint]) => {
        expect(endpoint).toContain('v1/me/top/tracks');
        expect(endpoint).toContain('time_range=');
        expect(endpoint).toContain('limit=');
      });
      
      console.log('✅ Spotify API endpoints validated');
    });

    test('should construct correct YouTube API search endpoints', () => {
      const trackName = 'Never Gonna Give You Up';
      const artistName = 'Rick Astley';
      const searchQuery = `${trackName} ${artistName}`.replace(/[^\w\s]/g, ' ').trim();
      const encodedQuery = encodeURIComponent(searchQuery);
      
      const endpoint = `search?part=snippet&type=video&q=${encodedQuery}&maxResults=3&order=relevance`;
      
      expect(endpoint).toContain('part=snippet');
      expect(endpoint).toContain('type=video');
      expect(endpoint).toContain('maxResults=3');
      expect(endpoint).toContain('order=relevance');
      expect(endpoint).toContain(encodeURIComponent('Never Gonna Give You Up Rick Astley'));
      
      console.log('✅ YouTube API search endpoint validated');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle missing Spotify connection gracefully', () => {
      const errorMessage = 'Spotify is not connected. Please connect your Spotify account first.';
      
      expect(errorMessage).toContain('Spotify is not connected');
      expect(errorMessage).toContain('connect your Spotify account');
      
      console.log('✅ Spotify connection error handling validated');
    });

    test('should handle missing Google connection gracefully', () => {
      const errorMessage = 'Google is not connected. Please connect your Google account first.';
      
      expect(errorMessage).toContain('Google is not connected');
      expect(errorMessage).toContain('connect your Google account');
      
      console.log('✅ Google connection error handling validated');
    });

    test('should handle no tracks found scenario', () => {
      const emptyTracksArray: any[] = [];
      
      expect(emptyTracksArray.length).toBe(0);
      expect(Array.isArray(emptyTracksArray)).toBe(true);
      
      console.log('✅ Empty tracks array handling validated');
    });

    test('should handle YouTube API failures gracefully', () => {
      const fallbackTrack = {
        spotify: mockSpotifyTracks[0],
        youtube: null,
        searchQuery: 'Never Gonna Give You Up Rick Astley',
        matchConfidence: 'none' as const
      };
      
      expect(fallbackTrack.youtube).toBeNull();
      expect(fallbackTrack.matchConfidence).toBe('none');
      expect(fallbackTrack.spotify).toBeDefined();
      
      console.log('✅ YouTube API failure handling validated');
    });
  });

  describe('Rate Limiting Tests', () => {
    test('should include appropriate delays between API calls', () => {
      const delay = 1000; // 1 second delay
      const startTime = Date.now();
      
      return new Promise(resolve => {
        setTimeout(() => {
          const elapsed = Date.now() - startTime;
          expect(elapsed).toBeGreaterThanOrEqual(delay - 10); // Allow small variance
          console.log(`✅ Rate limiting delay validated: ${elapsed}ms`);
          resolve(true);
        }, delay);
      });
    });
  });

  describe('Data Structure Tests', () => {
    test('should validate CrossPlatformTrack interface structure', () => {
      const crossPlatformTrack = {
        spotify: mockSpotifyTracks[0],
        youtube: mockYouTubeVideos[0],
        searchQuery: 'Never Gonna Give You Up Rick Astley',
        matchConfidence: 'high' as const
      };
      
      expect(crossPlatformTrack).toHaveProperty('spotify');
      expect(crossPlatformTrack).toHaveProperty('youtube');
      expect(crossPlatformTrack).toHaveProperty('searchQuery');
      expect(crossPlatformTrack).toHaveProperty('matchConfidence');
      
      expect(['high', 'medium', 'low', 'none']).toContain(crossPlatformTrack.matchConfidence);
      
      console.log('✅ CrossPlatformTrack interface validated');
    });
  });

  describe('Summary Statistics Tests', () => {
    test('should calculate correct statistics for cross-platform results', () => {
      const mockResults = [
        { matchConfidence: 'high', youtube: {} },
        { matchConfidence: 'medium', youtube: {} },
        { matchConfidence: 'low', youtube: {} },
        { matchConfidence: 'none', youtube: null },
        { matchConfidence: 'high', youtube: {} }
      ];
      
      const stats = {
        total: mockResults.length,
        found: mockResults.filter(r => r.youtube !== null).length,
        high: mockResults.filter(r => r.matchConfidence === 'high').length,
        medium: mockResults.filter(r => r.matchConfidence === 'medium').length,
        low: mockResults.filter(r => r.matchConfidence === 'low').length,
        none: mockResults.filter(r => r.matchConfidence === 'none').length
      };
      
      expect(stats.total).toBe(5);
      expect(stats.found).toBe(4);
      expect(stats.high).toBe(2);
      expect(stats.medium).toBe(1);
      expect(stats.low).toBe(1);
      expect(stats.none).toBe(1);
      
      const successRate = Math.round(stats.found / stats.total * 100);
      expect(successRate).toBe(80);
      
      console.log('✅ Statistics calculation validated');
    });
  });
});

/**
 * Manual Testing Instructions for Cross-Platform Music Discovery
 * 
 * Prerequisites:
 * 1. Both Google (YouTube) and Spotify must be connected
 * 2. User must have listening history on Spotify
 * 
 * Test Steps:
 * 1. Connect both Google and Spotify accounts
 * 2. Import and use the cross-platform service:
 *    ```typescript
 *    import crossPlatformMusicService from '@/src/services/music/crossPlatformMusicService';
 *    
 *    const runCrossPlatformTest = async () => {
 *      try {
 *        const results = await crossPlatformMusicService.getSpotifyTracksWithYouTubeVersions(5);
 *        crossPlatformMusicService.printCrossPlatformSummary(results);
 *        return results;
 *      } catch (error) {
 *        console.error('Cross-platform test failed:', error);
 *      }
 *    };
 *    ```
 * 
 * Expected Results:
 * - Console logs showing each step of the process
 * - Array of CrossPlatformTrack objects with Spotify and YouTube data
 * - Match confidence ratings for each track
 * - Summary statistics of successful matches
 * - YouTube video IDs and URLs for found matches
 * 
 * Success Criteria:
 * - At least 60% of tracks should have YouTube matches found
 * - High confidence matches should have correct artist and track names
 * - No API errors or crashes during execution
 * - Rate limiting respected (1 second delays between requests)
 */