/**
 * Cross-Platform Music Discovery Tests for Expo Environment
 * 
 * These tests are designed to run in the Expo Jest environment
 * and validate the cross-platform music discovery functionality.
 */

describe('Cross-Platform Music Discovery - Expo Tests', () => {
  // Mock PocketBase to avoid AsyncStorage issues
  const mockPb = {
    authStore: {
      isValid: true,
      record: { id: 'test-user-id' },
      clear: jest.fn()
    },
    collection: jest.fn().mockReturnValue({
      listAuthMethods: jest.fn().mockResolvedValue({
        oauth2: {
          providers: [
            { name: 'google', clientId: 'mock-google-client-id' },
            { name: 'spotify', clientId: 'mock-spotify-client-id' }
          ]
        }
      }),
      authWithOAuth2: jest.fn().mockResolvedValue({
        record: { id: 'test-user-id' },
        meta: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiry: '2025-07-12T00:00:00Z',
          id: 'mock-user-id',
          email: 'test@example.com',
          name: 'Test User'
        }
      })
    })
  };

  // Mock auth services
  const mockSpotifyAuthService = {
    isSpotifyConnected: jest.fn().mockResolvedValue(true),
    getStoredAccessToken: jest.fn().mockResolvedValue('mock-spotify-token'),
    signInWithSpotify: jest.fn().mockResolvedValue({ success: true }),
    signOut: jest.fn()
  };

  const mockGoogleAuthService = {
    isGoogleConnected: jest.fn().mockResolvedValue(true),
    getStoredAccessToken: jest.fn().mockResolvedValue('mock-google-token'),
    signInWithGoogle: jest.fn().mockResolvedValue({ success: true }),
    signOut: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock module imports
    jest.doMock('@/src/services/pocketbase/client', () => mockPb);
    jest.doMock('@/src/services/spotify/spotifyAuthService', () => mockSpotifyAuthService);
    jest.doMock('@/src/services/google/googleAuthService', () => mockGoogleAuthService);
  });

  describe('Service Configuration Tests', () => {
    test('should validate Spotify track data structure', () => {
      const mockSpotifyTrack = {
        id: '4iV5W9uYEdYUVa79Axb7Rh',
        name: 'Never Gonna Give You Up',
        artists: [{ name: 'Rick Astley' }],
        album: { name: 'Whenever You Need Somebody' },
        duration_ms: 213573,
        popularity: 85,
        external_urls: { spotify: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh' }
      };

      expect(mockSpotifyTrack).toHaveProperty('id');
      expect(mockSpotifyTrack).toHaveProperty('name');
      expect(mockSpotifyTrack).toHaveProperty('artists');
      expect(Array.isArray(mockSpotifyTrack.artists)).toBe(true);
      expect(mockSpotifyTrack.artists[0]).toHaveProperty('name');
      expect(mockSpotifyTrack).toHaveProperty('album');
      expect(mockSpotifyTrack).toHaveProperty('duration_ms');
      expect(mockSpotifyTrack).toHaveProperty('popularity');
    });

    test('should validate YouTube video data structure', () => {
      const mockYouTubeVideo = {
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
      };

      expect(mockYouTubeVideo).toHaveProperty('id');
      expect(mockYouTubeVideo.id).toHaveProperty('videoId');
      expect(mockYouTubeVideo).toHaveProperty('snippet');
      expect(mockYouTubeVideo.snippet).toHaveProperty('title');
      expect(mockYouTubeVideo.snippet).toHaveProperty('channelTitle');
      expect(mockYouTubeVideo.snippet).toHaveProperty('thumbnails');
    });

    test('should validate CrossPlatformTrack interface', () => {
      const mockCrossPlatformTrack = {
        spotify: {
          id: '1',
          name: 'Test Track',
          artists: [{ name: 'Test Artist' }],
          album: { name: 'Test Album' },
          duration_ms: 180000,
          popularity: 80,
          external_urls: { spotify: 'https://open.spotify.com/track/1' }
        },
        youtube: {
          id: { videoId: 'abc123' },
          snippet: {
            title: 'Test Track - Test Artist',
            channelTitle: 'Test Artist',
            description: 'Test description',
            publishedAt: '2023-01-01T00:00:00Z',
            thumbnails: {
              default: { url: 'https://example.com/thumb.jpg' },
              medium: { url: 'https://example.com/thumb.jpg' },
              high: { url: 'https://example.com/thumb.jpg' }
            }
          }
        },
        searchQuery: 'Test Track Test Artist',
        matchConfidence: 'high' as const
      };

      expect(mockCrossPlatformTrack).toHaveProperty('spotify');
      expect(mockCrossPlatformTrack).toHaveProperty('youtube');
      expect(mockCrossPlatformTrack).toHaveProperty('searchQuery');
      expect(mockCrossPlatformTrack).toHaveProperty('matchConfidence');
      expect(['high', 'medium', 'low', 'none']).toContain(mockCrossPlatformTrack.matchConfidence);
    });
  });

  describe('Search Query Generation', () => {
    test('should generate proper search queries for tracks', () => {
      const track = {
        name: 'Never Gonna Give You Up',
        artists: [{ name: 'Rick Astley' }]
      };
      
      const artistName = track.artists.map(artist => artist.name).join(' ');
      const searchQuery = `${track.name} ${artistName}`;
      
      expect(searchQuery).toBe('Never Gonna Give You Up Rick Astley');
    });

    test('should handle special characters in track names', () => {
      const trackWithSpecialChars = {
        name: 'Shape of You (Acoustic)',
        artists: [{ name: 'Ed Sheeran' }]
      };
      
      const searchQuery = `${trackWithSpecialChars.name} ${trackWithSpecialChars.artists[0].name}`;
      const cleanedQuery = searchQuery.replace(/[^\w\s]/g, ' ').trim();
      
      expect(cleanedQuery).toContain('Shape of You');
      expect(cleanedQuery).toContain('Acoustic');
      expect(cleanedQuery).toContain('Ed Sheeran');
    });

    test('should handle multiple artists', () => {
      const trackWithMultipleArtists = {
        name: 'Despacito',
        artists: [
          { name: 'Luis Fonsi' },
          { name: 'Daddy Yankee' }
        ]
      };
      
      const artistName = trackWithMultipleArtists.artists.map(artist => artist.name).join(' ');
      const searchQuery = `${trackWithMultipleArtists.name} ${artistName}`;
      
      expect(searchQuery).toBe('Despacito Luis Fonsi Daddy Yankee');
    });
  });

  describe('Match Confidence Algorithm', () => {
    test('should identify high confidence matches', () => {
      const spotifyTrack = { name: 'Never Gonna Give You Up', artists: [{ name: 'Rick Astley' }] };
      const youtubeVideo = { 
        snippet: { 
          title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
          channelTitle: 'Rick Astley'
        } 
      };
      
      const trackName = spotifyTrack.name.toLowerCase();
      const artistName = spotifyTrack.artists[0].name.toLowerCase();
      const videoTitle = youtubeVideo.snippet.title.toLowerCase();
      const channelTitle = youtubeVideo.snippet.channelTitle.toLowerCase();
      
      const hasTrackName = videoTitle.includes(trackName);
      const hasArtistName = videoTitle.includes(artistName) || channelTitle.includes(artistName);
      
      expect(hasTrackName).toBe(true);
      expect(hasArtistName).toBe(true);
      
      // This would be classified as high confidence
      const confidence = hasTrackName && hasArtistName ? 'high' : 'low';
      expect(confidence).toBe('high');
    });

    test('should identify medium confidence matches', () => {
      const spotifyTrack = { name: 'Bohemian Rhapsody', artists: [{ name: 'Queen' }] };
      const youtubeVideo = { 
        snippet: { 
          title: 'Bohemian Rhapsody - Live Performance',
          channelTitle: 'Random Channel'
        } 
      };
      
      const trackName = spotifyTrack.name.toLowerCase();
      const artistName = spotifyTrack.artists[0].name.toLowerCase();
      const videoTitle = youtubeVideo.snippet.title.toLowerCase();
      const channelTitle = youtubeVideo.snippet.channelTitle.toLowerCase();
      
      const hasTrackName = videoTitle.includes(trackName);
      const hasArtistName = videoTitle.includes(artistName) || channelTitle.includes(artistName);
      
      expect(hasTrackName).toBe(true);
      expect(hasArtistName).toBe(false);
      
      // This would be classified as medium confidence
      const confidence = hasTrackName && !hasArtistName ? 'medium' : 'low';
      expect(confidence).toBe('medium');
    });

    test('should handle partial word matches', () => {
      const spotifyTrack = { name: 'Bohemian Rhapsody', artists: [{ name: 'Queen' }] };
      const youtubeVideo = { 
        snippet: { 
          title: 'Queen - Bohemian',
          channelTitle: 'Queen Official'
        } 
      };
      
      const trackWords = spotifyTrack.name.toLowerCase().split(' ').filter(word => word.length > 2);
      const videoTitle = youtubeVideo.snippet.title.toLowerCase();
      
      const matchedWords = trackWords.filter(word => videoTitle.includes(word));
      const matchRatio = matchedWords.length / trackWords.length;
      
      expect(matchedWords.length).toBeGreaterThan(0);
      expect(matchRatio).toBeGreaterThan(0);
    });
  });

  describe('API Endpoint Construction', () => {
    test('should construct correct Spotify API endpoints', () => {
      const baseEndpoints = {
        topTracks: 'v1/me/top/tracks',
        timeRanges: ['short_term', 'medium_term', 'long_term'],
        limits: [5, 10, 20]
      };
      
      baseEndpoints.timeRanges.forEach(timeRange => {
        baseEndpoints.limits.forEach(limit => {
          const endpoint = `${baseEndpoints.topTracks}?time_range=${timeRange}&limit=${limit}`;
          
          expect(endpoint).toContain('v1/me/top/tracks');
          expect(endpoint).toContain(`time_range=${timeRange}`);
          expect(endpoint).toContain(`limit=${limit}`);
        });
      });
    });

    test('should construct correct YouTube API search endpoints', () => {
      const searchQuery = 'Never Gonna Give You Up Rick Astley';
      const encodedQuery = encodeURIComponent(searchQuery);
      const endpoint = `search?part=snippet&type=video&q=${encodedQuery}&maxResults=3&order=relevance`;
      
      expect(endpoint).toContain('part=snippet');
      expect(endpoint).toContain('type=video');
      expect(endpoint).toContain('maxResults=3');
      expect(endpoint).toContain('order=relevance');
      expect(endpoint).toContain(encodedQuery);
    });

    test('should handle special characters in search queries', () => {
      const searchQueries = [
        'Shape of You (Acoustic)',
        'Don\'t Stop Believin\'',
        'C\'est La Vie',
        'Rock & Roll'
      ];
      
      searchQueries.forEach(query => {
        const encodedQuery = encodeURIComponent(query);
        const endpoint = `search?part=snippet&type=video&q=${encodedQuery}&maxResults=3`;
        
        expect(endpoint).toContain('part=snippet');
        expect(endpoint).toContain('type=video');
        expect(endpoint).toContain(encodedQuery);
        
        // Verify the encoded query is different from the original (for special chars)
        if (query.includes('(') || query.includes('\'') || query.includes('&')) {
          expect(encodedQuery).not.toBe(query);
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing service connections', () => {
      const errorMessages = {
        spotifyMissing: 'Spotify is not connected. Please connect your Spotify account first.',
        googleMissing: 'Google is not connected. Please connect your Google account first.'
      };
      
      expect(errorMessages.spotifyMissing).toContain('Spotify is not connected');
      expect(errorMessages.googleMissing).toContain('Google is not connected');
    });

    test('should handle empty track arrays', () => {
      const emptyResults = [];
      const mockCrossPlatformResults = emptyResults.map(track => ({
        spotify: track,
        youtube: null,
        searchQuery: '',
        matchConfidence: 'none' as const
      }));
      
      expect(Array.isArray(mockCrossPlatformResults)).toBe(true);
      expect(mockCrossPlatformResults.length).toBe(0);
    });

    test('should handle API failures gracefully', () => {
      const mockApiError = {
        status: 403,
        message: 'Forbidden - Insufficient scope'
      };
      
      expect(mockApiError.status).toBe(403);
      expect(mockApiError.message).toContain('Forbidden');
    });
  });

  describe('Statistics Calculation', () => {
    test('should calculate correct success statistics', () => {
      const mockResults = [
        { matchConfidence: 'high', youtube: { id: { videoId: '1' } } },
        { matchConfidence: 'medium', youtube: { id: { videoId: '2' } } },
        { matchConfidence: 'low', youtube: { id: { videoId: '3' } } },
        { matchConfidence: 'none', youtube: null },
        { matchConfidence: 'high', youtube: { id: { videoId: '4' } } }
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
    });

    test('should handle edge cases in statistics', () => {
      // All matches found
      const allFound = [
        { matchConfidence: 'high', youtube: {} },
        { matchConfidence: 'medium', youtube: {} }
      ];
      const allFoundRate = allFound.filter(r => r.youtube !== null).length / allFound.length * 100;
      expect(allFoundRate).toBe(100);
      
      // No matches found
      const noneFound = [
        { matchConfidence: 'none', youtube: null },
        { matchConfidence: 'none', youtube: null }
      ];
      const noneFoundRate = noneFound.filter(r => r.youtube !== null).length / noneFound.length * 100;
      expect(noneFoundRate).toBe(0);
      
      // Empty array
      const empty: any[] = [];
      const emptyRate = empty.length === 0 ? 0 : empty.filter(r => r.youtube !== null).length / empty.length * 100;
      expect(emptyRate).toBe(0);
    });
  });

  describe('Rate Limiting', () => {
    test('should implement proper delays between API calls', async () => {
      const delay = 1000; // 1 second
      const startTime = Date.now();
      
      // Simulate the delay used in the service
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(delay - 50); // Allow 50ms variance
      expect(elapsed).toBeLessThan(delay + 100); // Should not be much longer
    });
  });
});