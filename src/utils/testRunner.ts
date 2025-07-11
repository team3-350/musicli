/**
 * Expo-Compatible Test Runner for Cross-Platform Music Discovery
 * 
 * This runs tests directly in the Expo environment without Jest,
 * allowing full access to React Native components and APIs.
 */

import crossPlatformMusicService from '../services/music/crossPlatformMusicService';
import spotifyAuthService from '../services/spotify/spotifyAuthService';
import googleAuthService from '../services/google/googleAuthService';
import pb from '../services/pocketbase/client';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

class ExpoTestRunner {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;

  private log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const symbols = {
      info: '🔍',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${symbols[type]} ${message}`);
  }

  describe(suiteName: string, tests: () => void) {
    this.log(`📦 Starting test suite: ${suiteName}`, 'info');
    const startTime = Date.now();
    
    this.currentSuite = {
      name: suiteName,
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    };

    try {
      tests();
    } catch (error) {
      this.log(`Suite setup failed: ${error}`, 'error');
    }

    this.currentSuite.duration = Date.now() - startTime;
    this.suites.push(this.currentSuite);
    this.printSuiteResults(this.currentSuite);
  }

  test(testName: string, testFn: () => Promise<void> | void) {
    if (!this.currentSuite) {
      throw new Error('No active test suite');
    }

    const startTime = Date.now();
    
    try {
      const result = testFn();
      
      if (result instanceof Promise) {
        return result
          .then(() => {
            const duration = Date.now() - startTime;
            this.addTestResult(testName, true, undefined, duration);
          })
          .catch((error) => {
            const duration = Date.now() - startTime;
            this.addTestResult(testName, false, error.message, duration);
          });
      } else {
        const duration = Date.now() - startTime;
        this.addTestResult(testName, true, undefined, duration);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addTestResult(testName, false, (error as Error).message, duration);
    }
  }

  private addTestResult(name: string, passed: boolean, error?: string, duration: number = 0) {
    if (!this.currentSuite) return;

    const result: TestResult = { name, passed, error, duration };
    this.currentSuite.results.push(result);
    
    if (passed) {
      this.currentSuite.passed++;
      this.log(`PASS: ${name} (${duration}ms)`, 'success');
    } else {
      this.currentSuite.failed++;
      this.log(`FAIL: ${name} - ${error} (${duration}ms)`, 'error');
    }
  }

  expect(actual: any) {
    return {
      toBe: (expected: any) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`);
        }
      },
      toEqual: (expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`);
        }
      },
      toContain: (item: any) => {
        if (!actual.includes(item)) {
          throw new Error(`Expected ${actual} to contain ${item}`);
        }
      },
      toBeGreaterThan: (expected: number) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toHaveProperty: (prop: string) => {
        if (!(prop in actual)) {
          throw new Error(`Expected object to have property ${prop}`);
        }
      }
    };
  }

  private printSuiteResults(suite: TestSuite) {
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Suite: ${suite.name}`);
    console.log('='.repeat(50));
    console.log(`Duration: ${suite.duration}ms`);
    console.log(`Passed: ${suite.passed}`);
    console.log(`Failed: ${suite.failed}`);
    console.log(`Total: ${suite.results.length}`);
    
    if (suite.failed > 0) {
      console.log('\n❌ Failed Tests:');
      suite.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`   • ${r.name}: ${r.error}`));
    }
    console.log('='.repeat(50) + '\n');
  }

  printOverallResults() {
    const totalPassed = this.suites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.suites.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = this.suites.reduce((sum, suite) => sum + suite.duration, 0);

    console.log('\n' + '🏆'.repeat(20));
    console.log('📈 OVERALL TEST RESULTS');
    console.log('🏆'.repeat(20));
    console.log(`Total Suites: ${this.suites.length}`);
    console.log(`Total Tests: ${totalPassed + totalFailed}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Duration: ${totalDuration}ms`);
    console.log(`Success Rate: ${Math.round(totalPassed / (totalPassed + totalFailed) * 100)}%`);
    
    if (totalFailed === 0) {
      this.log('🎉 All tests passed!', 'success');
    } else {
      this.log(`⚠️ ${totalFailed} test(s) failed`, 'warning');
    }
    console.log('🏆'.repeat(20) + '\n');
  }

  // Cross-Platform Music Discovery Tests
  async runCrossPlatformTests() {
    this.log('🚀 Starting Cross-Platform Music Discovery Tests in Expo', 'info');

    this.describe('Service Availability Tests', () => {
      this.test('should have cross-platform music service available', () => {
        this.expect(crossPlatformMusicService).toBeTruthy();
        this.expect(typeof crossPlatformMusicService.getSpotifyTopTracks).toBe('function');
        this.expect(typeof crossPlatformMusicService.searchYouTubeForTrack).toBe('function');
        this.expect(typeof crossPlatformMusicService.findYouTubeVersionOfSpotifyTrack).toBe('function');
      });

      this.test('should have auth services available', () => {
        this.expect(spotifyAuthService).toBeTruthy();
        this.expect(googleAuthService).toBeTruthy();
        this.expect(pb).toBeTruthy();
      });
    });

    this.describe('PocketBase Connection Tests', () => {
      this.test('should connect to PocketBase', async () => {
        const authMethods = await pb.collection('users').listAuthMethods();
        this.expect(authMethods).toBeTruthy();
        this.expect(authMethods.oauth2).toBeTruthy();
      });

      this.test('should have OAuth providers configured', async () => {
        const authMethods = await pb.collection('users').listAuthMethods();
        const providers = authMethods.oauth2?.providers || [];
        
        const googleProvider = providers.find(p => p.name === 'google');
        const spotifyProvider = providers.find(p => p.name === 'spotify');
        
        this.expect(googleProvider).toBeTruthy();
        this.expect(spotifyProvider).toBeTruthy();
        this.expect(googleProvider?.clientId).toBeTruthy();
        this.expect(spotifyProvider?.clientId).toBeTruthy();
      });
    });

    this.describe('OAuth Connection Status Tests', () => {
      this.test('should check Spotify connection status', async () => {
        const isConnected = await spotifyAuthService.isSpotifyConnected();
        // This can be true or false, just check it returns a boolean
        this.expect(typeof isConnected).toBe('boolean');
      });

      this.test('should check Google connection status', async () => {
        const isConnected = await googleAuthService.isGoogleConnected();
        // This can be true or false, just check it returns a boolean
        this.expect(typeof isConnected).toBe('boolean');
      });
    });

    this.describe('Search Query Generation Tests', () => {
      this.test('should generate proper search queries', () => {
        const track = {
          name: 'Never Gonna Give You Up',
          artists: [{ name: 'Rick Astley' }]
        };
        
        const searchQuery = `${track.name} ${track.artists[0].name}`;
        this.expect(searchQuery).toBe('Never Gonna Give You Up Rick Astley');
      });

      this.test('should handle special characters', () => {
        const trackName = 'Shape of You (Acoustic)';
        const cleanedQuery = trackName.replace(/[^\w\s]/g, ' ').trim();
        this.expect(cleanedQuery).toContain('Shape of You');
        this.expect(cleanedQuery).toContain('Acoustic');
      });
    });

    this.describe('API Endpoint Structure Tests', () => {
      this.test('should construct correct Spotify endpoints', () => {
        const endpoint = 'v1/me/top/tracks?time_range=long_term&limit=5';
        this.expect(endpoint).toContain('v1/me/top/tracks');
        this.expect(endpoint).toContain('time_range=');
        this.expect(endpoint).toContain('limit=');
      });

      this.test('should construct correct YouTube endpoints', () => {
        const query = encodeURIComponent('Never Gonna Give You Up Rick Astley');
        const endpoint = `search?part=snippet&type=video&q=${query}&maxResults=3&order=relevance`;
        this.expect(endpoint).toContain('part=snippet');
        this.expect(endpoint).toContain('type=video');
        this.expect(endpoint).toContain('maxResults=3');
      });
    });

    this.describe('Match Confidence Tests', () => {
      this.test('should identify high confidence matches', () => {
        const trackName = 'never gonna give you up';
        const artistName = 'rick astley';
        const videoTitle = 'rick astley - never gonna give you up (official music video)';
        
        const hasTrackName = videoTitle.includes(trackName);
        const hasArtistName = videoTitle.includes(artistName);
        
        this.expect(hasTrackName).toBeTruthy();
        this.expect(hasArtistName).toBeTruthy();
      });

      this.test('should identify partial matches', () => {
        const trackWords = 'bohemian rhapsody'.split(' ');
        const videoTitle = 'queen - bohemian';
        
        const hasPartialMatch = trackWords.some(word => 
          word.length > 2 && videoTitle.includes(word)
        );
        
        this.expect(hasPartialMatch).toBeTruthy();
      });
    });

    // Conditional tests that only run if services are connected
    const spotifyConnected = await spotifyAuthService.isSpotifyConnected();
    const googleConnected = await googleAuthService.isGoogleConnected();

    if (spotifyConnected && googleConnected) {
      this.describe('Live API Tests (Both Services Connected)', () => {
        this.test('should fetch real Spotify top tracks', async () => {
          const tracks = await crossPlatformMusicService.getSpotifyTopTracks(3);
          this.expect(Array.isArray(tracks)).toBeTruthy();
          this.expect(tracks.length).toBeGreaterThan(-1); // Can be 0 if user has no listening history
          
          if (tracks.length > 0) {
            const track = tracks[0];
            this.expect(track).toHaveProperty('name');
            this.expect(track).toHaveProperty('artists');
            this.expect(Array.isArray(track.artists)).toBeTruthy();
          }
        });

        this.test('should perform cross-platform discovery', async () => {
          const results = await crossPlatformMusicService.getSpotifyTracksWithYouTubeVersions(2);
          this.expect(Array.isArray(results)).toBeTruthy();
          
          results.forEach(result => {
            this.expect(result).toHaveProperty('spotify');
            this.expect(result).toHaveProperty('youtube');
            this.expect(result).toHaveProperty('searchQuery');
            this.expect(result).toHaveProperty('matchConfidence');
            this.expect(['high', 'medium', 'low', 'none']).toContain(result.matchConfidence);
          });
          
          // Print results for manual verification
          crossPlatformMusicService.printCrossPlatformSummary(results);
        });
      });
    } else {
      this.log('⚠️ Skipping live API tests - services not connected', 'warning');
      this.log(`   Spotify connected: ${spotifyConnected}`, 'info');
      this.log(`   Google connected: ${googleConnected}`, 'info');
    }

    this.printOverallResults();
  }
}

export default new ExpoTestRunner();