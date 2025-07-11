import * as WebBrowser from 'expo-web-browser';
import pb from '../pocketbase/client';

export interface SpotifyUserInfo {
  id: string;
  email: string;
  display_name: string;
  images?: Array<{ url: string }>;
}

// In-memory storage for OAuth tokens since we can't modify PocketBase user collection
interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiry: string;
  userId: string;
}

class SpotifyAuthService {
  private tokens: SpotifyTokens | null = null;
  
  // Required scopes for Spotify API access
  private scopes = [
    'user-read-private',
    'user-read-email', 
    'user-top-read',
    'user-read-recently-played',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ');
  async signInWithSpotify(): Promise<any | null> {
    try {
      console.log('Starting Spotify OAuth with PocketBase and custom scopes...');
      
      // Check if Spotify provider is available
      const authMethods = await pb.collection('users').listAuthMethods();
      console.log('Available auth methods:', JSON.stringify(authMethods, null, 2));
      
      const providers = authMethods.oauth2?.providers || [];
      const spotifyProvider = providers.find(p => p.name === 'spotify');
      
      if (!spotifyProvider) {
        throw new Error('Spotify provider not configured in PocketBase');
      }
      
      console.log('Spotify provider found:', spotifyProvider);
      
      // Use PocketBase's built-in OAuth2 authentication with custom scopes
      const authData = await pb.collection('users').authWithOAuth2({ 
        provider: 'spotify',
        urlCallback: async (url) => {
          console.log('Original OAuth URL from PocketBase:', url);
          
          // Parse the URL and add custom scopes
          const authUrl = new URL(url);
          authUrl.searchParams.set('scope', this.scopes);
          
          const modifiedUrl = authUrl.toString();
          console.log('Modified OAuth URL with scopes:', modifiedUrl);
          console.log('Added scopes:', this.scopes);
          
          // Open the modified OAuth URL in a web browser
          const result = await WebBrowser.openBrowserAsync(modifiedUrl, {
            showTitle: false,
            showInRecents: false,
          });
          
          console.log('Spotify browser result:', result);
          return result;
        }
      });
      
      console.log('Spotify OAuth successful:', authData);
      console.log('Spotify access token available:', authData.meta?.accessToken ? 'Yes' : 'No');
      
      // Store tokens in memory for later use
      if (authData.meta && authData.record) {
        this.tokens = {
          accessToken: authData.meta.accessToken,
          refreshToken: authData.meta.refreshToken,
          expiry: authData.meta.expiry,
          userId: authData.record.id
        };
        console.log('Spotify tokens stored in memory');
      }
      
      return authData;
    } catch (error) {
      console.error('Spotify OAuth error details:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.data);
      throw error;
    }
  }

  async getSpotifyAccessToken(): Promise<string | null> {
    try {
      // Check if user is authenticated and has OAuth2 data
      if (!pb.authStore?.isValid || !pb.authStore?.record) return null;

      // In PocketBase OAuth2, the access token is typically stored in the auth record
      const user = pb.authStore.record;
      
      // The OAuth2 tokens are usually available in the authStore after OAuth2 authentication
      return user.accessToken || null;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      // Clear in-memory tokens
      this.tokens = null;
      // PocketBase handles OAuth2 sign out by clearing the auth store
      pb.authStore.clear();
    } catch (error) {
      console.error('Spotify sign out error:', error);
    }
  }

  async isSpotifyConnected(): Promise<boolean> {
    try {
      if (!pb.authStore?.isValid || !pb.authStore?.record) return false;
      
      // Check if we have tokens stored in memory for the current user
      return !!(this.tokens && this.tokens.userId === pb.authStore.record.id && this.tokens.accessToken);
    } catch {
      return false;
    }
  }

  async getUserInfo(): Promise<SpotifyUserInfo | null> {
    try {
      if (!pb.authStore?.isValid || !pb.authStore?.record) return null;
      
      const user = pb.authStore.record;
      return {
        id: user.id,
        email: user.email,
        display_name: user.name || user.email,
        images: user.avatar ? [{ url: user.avatar }] : [],
      };
    } catch (error) {
      console.error('Error getting Spotify user info:', error);
      return null;
    }
  }

  async refreshSession(): Promise<boolean> {
    try {
      if (!pb.authStore?.isValid) return false;
      
      // PocketBase automatically handles token refresh
      await pb.collection('users').authRefresh();
      return true;
    } catch (error) {
      console.error('Spotify session refresh error:', error);
      return false;
    }
  }

  async getSpotifyUserId(): Promise<string | null> {
    try {
      if (!pb.authStore?.isValid || !pb.authStore?.record) return null;
      const authRecord = pb.authStore.record;
      return authRecord.spotify_id || authRecord.meta?.id || authRecord.id || null;
    } catch {
      return null;
    }
  }

  async getStoredAccessToken(): Promise<string | null> {
    try {
      if (!pb.authStore?.isValid || !pb.authStore?.record) return null;
      
      // Check if we have tokens stored in memory for the current user
      if (this.tokens && this.tokens.userId === pb.authStore.record.id) {
        console.log('Found Spotify tokens in memory for current user');
        
        // Check if token is expired
        const expiry = new Date(this.tokens.expiry);
        const now = new Date();
        
        if (expiry <= now) {
          console.log('Spotify token expired, need to refresh');
          // Try to refresh token
          const refreshed = await this.refreshSpotifyToken();
          return refreshed;
        }
        
        console.log('Valid Spotify token found in memory');
        return this.tokens.accessToken;
      }
      
      console.log('No Spotify access token found in memory for current user');
      return null;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      return null;
    }
  }

  async refreshSpotifyToken(): Promise<string | null> {
    try {
      if (!pb.authStore?.isValid || !pb.authStore?.record) return null;
      
      const userId = pb.authStore.record.id;
      const user = await pb.collection('users').getOne(userId);
      const refreshToken = user.spotify_refresh_token;
      
      if (!refreshToken) {
        console.log('No refresh token available, need to re-authenticate');
        return null;
      }
      
      console.log('Attempting to refresh Spotify token...');
      
      // Note: This would typically require your client secret, which should be on your backend
      // For now, return null to force re-authentication
      console.log('Token refresh requires backend implementation');
      return null;
    } catch (error) {
      console.error('Error refreshing Spotify token:', error);
      return null;
    }
  }
}

export default new SpotifyAuthService();