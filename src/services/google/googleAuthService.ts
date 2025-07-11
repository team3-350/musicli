import * as WebBrowser from 'expo-web-browser';
import pb from '../pocketbase/client';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// In-memory storage for OAuth tokens since we can't modify PocketBase user collection
interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiry: string;
  userId: string;
}

class GoogleAuthService {
  private tokens: GoogleTokens | null = null;
  
  // Required scopes for Google profile and YouTube Data API access
  private scopes = [
    'openid',
    'email', 
    'profile',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ].join(' ');
  async signInWithGoogle(): Promise<any | null> {
    try {
      console.log('Starting Google OAuth with PocketBase and YouTube scopes...');
      
      // Use PocketBase's built-in OAuth2 authentication with custom scopes
      const authData = await pb.collection('users').authWithOAuth2({ 
        provider: 'google',
        urlCallback: async (url) => {
          console.log('Original OAuth URL from PocketBase:', url);
          
          // Parse the URL and add custom scopes for YouTube Data API
          const authUrl = new URL(url);
          authUrl.searchParams.set('scope', this.scopes);
          
          const modifiedUrl = authUrl.toString();
          console.log('Modified OAuth URL with YouTube scopes:', modifiedUrl);
          console.log('Added scopes:', this.scopes);
          
          // Open the modified OAuth URL in a web browser
          const result = await WebBrowser.openBrowserAsync(modifiedUrl, {
            showTitle: false,
            showInRecents: false,
          });
          
          console.log('Google browser result:', result);
          return result;
        }
      });
      
      console.log('Google OAuth successful:', authData);
      console.log('Google access token available:', authData.meta?.accessToken ? 'Yes' : 'No');
      
      // Store tokens in memory for later use
      if (authData.meta && authData.record) {
        this.tokens = {
          accessToken: authData.meta.accessToken,
          refreshToken: authData.meta.refreshToken,
          expiry: authData.meta.expiry,
          userId: authData.record.id
        };
        console.log('Google tokens stored in memory');
      }
      
      return authData;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  }

  async getGoogleAccessToken(): Promise<string | null> {
    try {
      // Check if user is authenticated and has OAuth2 data
      if (!pb.authStore?.isValid || !pb.authStore?.record) return null;

      // In PocketBase OAuth2, the access token is typically stored in the auth record
      // You may need to check the actual structure of your OAuth2 data
      const user = pb.authStore.record;
      
      // The OAuth2 tokens are usually available in the authStore after OAuth2 authentication
      // You might need to access them differently based on your PocketBase version
      return user.accessToken || null;
    } catch (error) {
      console.error('Error getting Google access token:', error);
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
      console.error('Sign out error:', error);
    }
  }

  async isGoogleConnected(): Promise<boolean> {
    try {
      if (!pb.authStore?.isValid || !pb.authStore?.record) return false;
      
      // Check if we have tokens stored in memory for the current user
      return !!(this.tokens && this.tokens.userId === pb.authStore.record.id && this.tokens.accessToken);
    } catch {
      return false;
    }
  }

  async getUserInfo(): Promise<GoogleUserInfo | null> {
    try {
      if (!pb.authStore?.isValid || !pb.authStore?.record) return null;
      
      const user = pb.authStore.record;
      return {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        picture: user.avatar || user.avatarUrl,
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  async refreshSession(): Promise<boolean> {
    try {
      if (!pb.authStore?.isValid) return false;
      
      // PocketBase automatically handles token refresh
      // You can manually refresh if needed
      await pb.collection('users').authRefresh();
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }

  async getGoogleUserId(): Promise<string | null> {
    try {
      if (!pb.authStore?.isValid || !pb.authStore?.record) return null;
      return pb.authStore.record.google_id || null;
    } catch {
      return null;
    }
  }

  async getStoredAccessToken(): Promise<string | null> {
    try {
      if (!pb.authStore?.isValid || !pb.authStore?.record) return null;
      
      // Check if we have tokens stored in memory for the current user
      if (this.tokens && this.tokens.userId === pb.authStore.record.id) {
        console.log('Found Google tokens in memory for current user');
        
        // Check if token is expired
        const expiry = new Date(this.tokens.expiry);
        const now = new Date();
        
        if (expiry <= now) {
          console.log('Google token expired, need to refresh');
          // For now, return null to force re-authentication
          // TODO: Implement token refresh
          return null;
        }
        
        console.log('Valid Google token found in memory');
        return this.tokens.accessToken;
      }
      
      console.log('No Google access token found in memory for current user');
      return null;
    } catch (error) {
      console.error('Error getting Google access token:', error);
      return null;
    }
  }
}

export default new GoogleAuthService();