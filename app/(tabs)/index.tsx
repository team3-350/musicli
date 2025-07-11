import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Layout,
  Text,
  Button,
  Card,
  Divider
} from '@ui-kitten/components';

import EditScreenInfo from '@/components/EditScreenInfo';
import pb from '@/src/services/pocketbase/client';
import googleAuthService from '@/src/services/google/googleAuthService';
import spotifyAuthService from '@/src/services/spotify/spotifyAuthService';
import crossPlatformMusicService from '@/src/services/music/crossPlatformMusicService';
import testRunner from '@/src/utils/testRunner';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [crossPlatformResults, setCrossPlatformResults] = useState<any[]>([]);

  const checkGoogleConnectionStatus = async () => {
    try {
      // Debug: Log the current user object and auth store
      console.log('Current user object:', JSON.stringify(user, null, 2));
      console.log('Auth store record:', JSON.stringify(pb.authStore.record, null, 2));
      
      const connected = await googleAuthService.isGoogleConnected();
      setIsGoogleConnected(connected);
    } catch (error) {
      console.error('Error checking Google connection:', error);
    }
  };

  const checkSpotifyConnectionStatus = async () => {
    try {
      const connected = await spotifyAuthService.isSpotifyConnected();
      setIsSpotifyConnected(connected);
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
    }
  };

  useEffect(() => {
    try {
      // Initialize user state
      setUser(pb.authStore?.record || null);
      
      // Check if user is authenticated, redirect to auth if not
      if (!pb.authStore?.isValid) {
        router.replace('/auth');
        return;
      }

      // Check connection status
      checkGoogleConnectionStatus();
      checkSpotifyConnectionStatus();

      // Listen for auth changes
      const unsubscribe = pb.authStore.onChange(() => {
        try {
          setUser(pb.authStore?.record || null);
          if (!pb.authStore?.isValid) {
            router.replace('/auth');
          } else {
            checkGoogleConnectionStatus();
            checkSpotifyConnectionStatus();
          }
        } catch (error) {
          console.log('Error in auth change handler:', error);
          setUser(null);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error in useEffect:', error);
      router.replace('/auth');
    }
  }, []);

  const handleConnectGoogle = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      const result = await googleAuthService.signInWithGoogle();
      if (result) {
        setIsGoogleConnected(true);
        setUser(pb.authStore?.record || null); // Update user state
        Alert.alert('Success', 'Google account connected successfully!');
      }
    } catch (error) {
      console.error('Google connection error:', error);
      Alert.alert('Error', 'Failed to connect Google account. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectSpotify = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      const result = await spotifyAuthService.signInWithSpotify();
      if (result) {
        setIsSpotifyConnected(true);
        setUser(pb.authStore?.record || null); // Update user state
        Alert.alert('Success', 'Spotify account connected successfully!');
      }
    } catch (error) {
      console.error('Spotify connection error:', error);
      Alert.alert('Error', 'Failed to connect Spotify account. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    Alert.alert(
      'Disconnect Google Account',
      'This will sign you out completely. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await googleAuthService.signOut();
              setIsGoogleConnected(false);
              // This will redirect to auth screen due to the useEffect
              router.replace('/auth');
            } catch (error) {
              console.error('Disconnect error:', error);
              Alert.alert('Error', 'Failed to sign out.');
            }
          },
        },
      ]
    );
  };

  const handleDisconnectSpotify = async () => {
    Alert.alert(
      'Disconnect Spotify Account',
      'This will sign you out completely. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await spotifyAuthService.signOut();
              setIsSpotifyConnected(false);
              setTopTracks([]); // Clear tracks when disconnecting
              // This will redirect to auth screen due to the useEffect
              router.replace('/auth');
            } catch (error) {
              console.error('Spotify disconnect error:', error);
              Alert.alert('Error', 'Failed to sign out.');
            }
          },
        },
      ]
    );
  };

  const fetchSpotifyWebApi = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const token = await spotifyAuthService.getStoredAccessToken();
      if (!token) {
        throw new Error('No Spotify access token available');
      }

      const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!res.ok) {
        throw new Error(`Spotify API error: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      console.error('Spotify API fetch error:', error);
      throw error;
    }
  };

  const fetchYouTubeAPI = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const token = await googleAuthService.getStoredAccessToken();
      if (!token) {
        throw new Error('No Google access token available');
      }

      const res = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!res.ok) {
        throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      console.error('YouTube API fetch error:', error);
      throw error;
    }
  };

  const getYouTubeMusicData = async () => {
    try {
      setIsConnecting(true);
      
      // Search for music videos with a simple query
      // Start with a basic search to test the API connection
      const response = await fetchYouTubeAPI('search?part=snippet&type=video&q=music&maxResults=5&order=relevance');
      const videos = response.items || [];
      
      console.log('YouTube Music Videos:');
      videos.forEach((video: any) => {
        console.log(`${video.snippet.title} - ${video.snippet.channelTitle}`);
      });

      Alert.alert(
        'YouTube Music Data Retrieved!', 
        `Found ${videos.length} music videos. Check console for details.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error getting YouTube music data:', error);
      Alert.alert('Error', 'Failed to get YouTube music data. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const getTopTracks = async () => {
    try {
      setIsConnecting(true);
      const response = await fetchSpotifyWebApi('v1/me/top/tracks?time_range=long_term&limit=5');
      const tracks = response.items || [];
      
      setTopTracks(tracks);
      
      console.log('Top Tracks:');
      tracks.forEach((track: any) => {
        const artists = track.artists.map((artist: any) => artist.name).join(', ');
        console.log(`${track.name} by ${artists}`);
      });

      Alert.alert(
        'Top Tracks Retrieved!', 
        `Found ${tracks.length} tracks. Check console for details.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error getting top tracks:', error);
      Alert.alert('Error', 'Failed to get top tracks. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const runCrossPlatformMusicDiscovery = async () => {
    try {
      setIsConnecting(true);
      
      console.log('🚀 Starting Cross-Platform Music Discovery Test...');
      
      // Check if both services are connected
      const spotifyConnected = await spotifyAuthService.isSpotifyConnected();
      const googleConnected = await googleAuthService.isGoogleConnected();
      
      if (!spotifyConnected || !googleConnected) {
        Alert.alert(
          'Services Required', 
          'Please connect both Google and Spotify accounts to run cross-platform discovery.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Run the cross-platform discovery
      const results = await crossPlatformMusicService.getSpotifyTracksWithYouTubeVersions(5);
      setCrossPlatformResults(results);
      
      // Print summary to console
      crossPlatformMusicService.printCrossPlatformSummary(results);
      
      // Calculate stats for alert
      const found = results.filter(r => r.youtube !== null).length;
      const total = results.length;
      const successRate = Math.round(found / total * 100);
      
      Alert.alert(
        'Cross-Platform Discovery Complete!', 
        `Found YouTube versions for ${found}/${total} tracks (${successRate}% success rate). Check console for details.`,
        [{ text: 'Awesome!' }]
      );
      
    } catch (error) {
      console.error('Error in cross-platform discovery:', error);
      Alert.alert('Error', 'Cross-platform discovery failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const runInAppTests = async () => {
    try {
      setIsConnecting(true);
      console.log('🧪 Running In-App Cross-Platform Tests...');
      
      Alert.alert(
        'Running Tests', 
        'Cross-platform tests are running. Check the console for detailed results.',
        [{ text: 'OK' }]
      );
      
      // Run the comprehensive test suite in the Expo environment
      await testRunner.runCrossPlatformTests();
      
      Alert.alert(
        'Tests Complete!', 
        'All tests have finished. Check the console for detailed results and statistics.',
        [{ text: 'Great!' }]
      );
      
    } catch (error) {
      console.error('Error running in-app tests:', error);
      Alert.alert('Error', 'Test execution failed. Please check the console for details.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            pb.authStore.clear();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  return (
    <Layout style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Text category="h3" style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            
            <View style={styles.welcomeContainer}>
              <Text category="h1" style={styles.welcomeTitle}>
                Welcome to MusicLi!
              </Text>
              {user && (
                <Text appearance="hint" style={styles.userInfo}>
                  Signed in as {user.email}
                </Text>
              )}
            </View>
          </View>
        </Card>


        {/* Music Services Card */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Text category="h5" style={styles.sectionTitle}>
              Music Services
            </Text>
            
            {/* Google Section */}
            <View style={styles.serviceSection}>
              <Text category="s1" style={styles.serviceTitle}>YouTube Music</Text>
              {!isGoogleConnected ? (
                <Button
                  style={styles.serviceButton}
                  status="info"
                  onPress={handleConnectGoogle}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Google'}
                </Button>
              ) : (
                <View>
                  <View style={styles.connectedContainer}>
                    <Text category="s2" style={styles.connectedText}>
                      ✓ Connected
                    </Text>
                    <Button
                      style={styles.disconnectButton}
                      status="basic"
                      size="small"
                      onPress={handleDisconnectGoogle}
                    >
                      Disconnect
                    </Button>
                  </View>
                  
                  {/* YouTube API Test Button */}
                  <Button
                    style={styles.apiTestButton}
                    status="info"
                    size="small"
                    onPress={getYouTubeMusicData}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Loading...' : 'Get YouTube Music Data'}
                  </Button>
                </View>
              )}
            </View>

            <Divider style={styles.serviceDivider} />

            {/* Spotify Section */}
            <View style={styles.serviceSection}>
              <Text category="s1" style={styles.serviceTitle}>Spotify</Text>
              {!isSpotifyConnected ? (
                <Button
                  style={styles.serviceButton}
                  status="success"
                  onPress={handleConnectSpotify}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Spotify'}
                </Button>
              ) : (
                <View>
                  <View style={styles.connectedContainer}>
                    <Text category="s2" style={styles.connectedText}>
                      ✓ Connected
                    </Text>
                    <Button
                      style={styles.disconnectButton}
                      status="basic"
                      size="small"
                      onPress={handleDisconnectSpotify}
                    >
                      Disconnect
                    </Button>
                  </View>
                  
                  {/* Spotify API Test Button */}
                  <Button
                    style={styles.apiTestButton}
                    status="warning"
                    size="small"
                    onPress={getTopTracks}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Loading...' : 'Get Top 5 Tracks'}
                  </Button>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Cross-Platform Discovery Card */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Text category="h5" style={styles.sectionTitle}>
              Cross-Platform Music Discovery
            </Text>
            <Text appearance="hint" style={{ marginBottom: 16 }}>
              Find YouTube versions of your Spotify top tracks
            </Text>
            
            <Button
              style={styles.actionButton}
              status="success"
              onPress={runCrossPlatformMusicDiscovery}
              disabled={isConnecting || !isGoogleConnected || !isSpotifyConnected}
            >
              {isConnecting ? 'Discovering...' : 'Find YouTube Versions of My Top Tracks'}
            </Button>
            
            <Button
              style={[styles.actionButton, { marginTop: 8 }]}
              status="warning"
              size="small"
              onPress={runInAppTests}
              disabled={isConnecting}
            >
              {isConnecting ? 'Running Tests...' : 'Run Cross-Platform Tests'}
            </Button>
            
            {(!isGoogleConnected || !isSpotifyConnected) && (
              <Text appearance="hint" style={{ marginTop: 8, fontSize: 12 }}>
                Connect both Google and Spotify to use this feature
              </Text>
            )}
            
            {crossPlatformResults.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text category="s1">Recent Results:</Text>
                {crossPlatformResults.map((result, index) => (
                  <View key={index} style={{ marginTop: 8 }}>
                    <Text category="s2">
                      {index + 1}. {result.spotify.name} by {result.spotify.artists[0]?.name}
                    </Text>
                    {result.youtube ? (
                      <Text appearance="hint" style={{ fontSize: 12 }}>
                        ✅ Found: {result.youtube.snippet.title} ({result.matchConfidence} confidence)
                      </Text>
                    ) : (
                      <Text appearance="hint" style={{ fontSize: 12 }}>
                        ❌ No YouTube version found
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </Card>

        {/* Settings Card */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Text category="h5" style={styles.sectionTitle}>
              Account
            </Text>
            
            <Button
              style={styles.logoutButton}
              status="danger"
              onPress={handleLogout}
            >
              Sign Out
            </Button>
          </View>
        </Card>

        <EditScreenInfo path="app/(tabs)/index.tsx" />
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3366FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  userInfo: {
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    paddingVertical: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  primaryButton: {},
  warningButton: {},
  successButton: {},
  divider: {
    marginVertical: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
  serviceSection: {
    marginVertical: 8,
  },
  serviceTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  serviceButton: {
    marginTop: 4,
  },
  serviceDivider: {
    marginVertical: 12,
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  connectedText: {
    color: '#00E096',
    fontWeight: '600',
  },
  disconnectButton: {
    paddingHorizontal: 12,
  },
  apiTestButton: {
    marginTop: 8,
  },
});

