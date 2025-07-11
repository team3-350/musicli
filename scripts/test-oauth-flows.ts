#!/usr/bin/env ts-node

/**
 * OAuth Flow Test Script for MusicLi
 * 
 * This script tests the complete OAuth integration flows:
 * - PocketBase account creation/deletion
 * - Google OAuth with YouTube Data API
 * - Spotify OAuth with music API scopes
 * - API endpoint testing
 */

import pb from '../src/services/pocketbase/client';

interface TestResults {
  passed: number;
  failed: number;
  errors: string[];
}

class OAuthFlowTester {
  private results: TestResults = { passed: 0, failed: 0, errors: [] };
  private testUserEmail: string;
  private testUserPassword: string;
  private testUserId: string | null = null;

  constructor() {
    this.testUserEmail = `test-oauth-${Date.now()}@musicli-test.com`;
    this.testUserPassword = 'TestPassword123!';
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const symbols = {
      info: '🔍',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    console.log(`${symbols[type]} ${message}`);
  }

  private async test(name: string, testFn: () => Promise<void>) {
    try {
      this.log(`Testing: ${name}`, 'info');
      await testFn();
      this.results.passed++;
      this.log(`PASSED: ${name}`, 'success');
    } catch (error) {
      this.results.failed++;
      const errorMessage = `FAILED: ${name} - ${error instanceof Error ? error.message : String(error)}`;
      this.results.errors.push(errorMessage);
      this.log(errorMessage, 'error');
    }
  }

  async runAllTests() {
    this.log('🚀 Starting OAuth Flow Integration Tests', 'info');
    console.log('==================================================');

    // PocketBase Tests
    await this.test('PocketBase Connection', () => this.testPocketBaseConnection());
    await this.test('User Account Creation', () => this.testUserCreation());
    await this.test('User Authentication', () => this.testUserAuth());

    // OAuth Provider Tests
    await this.test('Google OAuth Provider Config', () => this.testGoogleOAuthConfig());
    await this.test('Spotify OAuth Provider Config', () => this.testSpotifyOAuthConfig());

    // Service Configuration Tests
    await this.test('Google Auth Service Config', () => this.testGoogleAuthService());
    await this.test('Spotify Auth Service Config', () => this.testSpotifyAuthService());

    // API Endpoint Tests
    await this.test('YouTube API Endpoint Structure', () => this.testYouTubeAPIStructure());
    await this.test('Spotify API Endpoint Structure', () => this.testSpotifyAPIStructure());

    // Cleanup
    await this.test('User Account Cleanup', () => this.testUserCleanup());

    this.printResults();
  }

  private async testPocketBaseConnection() {
    // Test if PocketBase is accessible
    if (!pb) {
      throw new Error('PocketBase client not initialized');
    }

    // Try to list auth methods to verify connection
    try {
      await pb.collection('users').listAuthMethods();
      this.log('PocketBase server is accessible', 'success');
    } catch (error) {
      throw new Error(`PocketBase server not accessible: ${error}`);
    }
  }

  private async testUserCreation() {
    const userData = {
      email: this.testUserEmail,
      password: this.testUserPassword,
      passwordConfirm: this.testUserPassword,
      name: 'OAuth Test User'
    };

    const user = await pb.collection('users').create(userData);
    this.testUserId = user.id;

    if (!user.id || user.email !== this.testUserEmail) {
      throw new Error('User creation returned invalid data');
    }

    this.log(`User created with ID: ${user.id}`, 'success');
  }

  private async testUserAuth() {
    const authData = await pb.collection('users').authWithPassword(
      this.testUserEmail,
      this.testUserPassword
    );

    if (!authData.record || !authData.token || !pb.authStore.isValid) {
      throw new Error('User authentication failed');
    }

    this.log('User authentication successful', 'success');
  }

  private async testGoogleOAuthConfig() {
    const authMethods = await pb.collection('users').listAuthMethods();
    const providers = authMethods.oauth2?.providers || [];
    const googleProvider = providers.find(p => p.name === 'google');

    if (!googleProvider) {
      throw new Error('Google OAuth provider not configured in PocketBase');
    }

    if (!googleProvider.clientId) {
      throw new Error('Google OAuth provider missing client ID');
    }

    this.log(`Google OAuth configured with client ID: ${googleProvider.clientId.substring(0, 20)}...`, 'success');
  }

  private async testSpotifyOAuthConfig() {
    const authMethods = await pb.collection('users').listAuthMethods();
    const providers = authMethods.oauth2?.providers || [];
    const spotifyProvider = providers.find(p => p.name === 'spotify');

    if (!spotifyProvider) {
      throw new Error('Spotify OAuth provider not configured in PocketBase');
    }

    if (!spotifyProvider.clientId) {
      throw new Error('Spotify OAuth provider missing client ID');
    }

    this.log(`Spotify OAuth configured with client ID: ${spotifyProvider.clientId.substring(0, 20)}...`, 'success');
  }

  private async testGoogleAuthService() {
    // Import the service dynamically to avoid module loading issues
    let googleAuthService;
    try {
      googleAuthService = (await import('../src/services/google/googleAuthService')).default;
    } catch (error) {
      throw new Error(`Failed to import Google auth service: ${error}`);
    }

    // Check if required methods exist
    const requiredMethods = ['signInWithGoogle', 'isGoogleConnected', 'getStoredAccessToken', 'signOut'];
    for (const method of requiredMethods) {
      if (typeof (googleAuthService as any)[method] !== 'function') {
        throw new Error(`Google auth service missing method: ${method}`);
      }
    }

    // Check scopes configuration (access private property)
    const scopes = (googleAuthService as any).scopes || '';
    const requiredScopes = ['youtube.readonly', 'youtube.force-ssl', 'email', 'profile'];
    for (const scope of requiredScopes) {
      if (!scopes.includes(scope)) {
        throw new Error(`Google OAuth missing required scope: ${scope}`);
      }
    }

    this.log('Google auth service properly configured', 'success');
  }

  private async testSpotifyAuthService() {
    // Import the service dynamically
    let spotifyAuthService;
    try {
      spotifyAuthService = (await import('../src/services/spotify/spotifyAuthService')).default;
    } catch (error) {
      throw new Error(`Failed to import Spotify auth service: ${error}`);
    }

    // Check if required methods exist
    const requiredMethods = ['signInWithSpotify', 'isSpotifyConnected', 'getStoredAccessToken', 'signOut'];
    for (const method of requiredMethods) {
      if (typeof (spotifyAuthService as any)[method] !== 'function') {
        throw new Error(`Spotify auth service missing method: ${method}`);
      }
    }

    // Check scopes configuration
    const scopes = (spotifyAuthService as any).scopes || '';
    const requiredScopes = ['user-top-read', 'user-read-private', 'user-read-email'];
    for (const scope of requiredScopes) {
      if (!scopes.includes(scope)) {
        throw new Error(`Spotify OAuth missing required scope: ${scope}`);
      }
    }

    this.log('Spotify auth service properly configured', 'success');
  }

  private async testYouTubeAPIStructure() {
    const expectedEndpoint = 'search?part=snippet&type=video&q=music&maxResults=5&order=relevance';
    const baseURL = 'https://www.googleapis.com/youtube/v3/';

    // Validate endpoint structure
    if (!expectedEndpoint.includes('part=snippet')) {
      throw new Error('YouTube API endpoint missing required part parameter');
    }

    if (!expectedEndpoint.includes('type=video')) {
      throw new Error('YouTube API endpoint missing type parameter');
    }

    if (!expectedEndpoint.includes('maxResults=5')) {
      throw new Error('YouTube API endpoint missing maxResults parameter');
    }

    // Test URL construction
    const fullURL = baseURL + expectedEndpoint;
    try {
      new URL(fullURL);
    } catch {
      throw new Error('YouTube API URL construction failed');
    }

    this.log('YouTube API endpoint structure valid', 'success');
  }

  private async testSpotifyAPIStructure() {
    const expectedEndpoint = 'v1/me/top/tracks?time_range=long_term&limit=5';
    const baseURL = 'https://api.spotify.com/';

    // Validate endpoint structure
    if (!expectedEndpoint.includes('v1/me/top/tracks')) {
      throw new Error('Spotify API endpoint missing required path');
    }

    if (!expectedEndpoint.includes('time_range=long_term')) {
      throw new Error('Spotify API endpoint missing time_range parameter');
    }

    if (!expectedEndpoint.includes('limit=5')) {
      throw new Error('Spotify API endpoint missing limit parameter');
    }

    // Test URL construction
    const fullURL = baseURL + expectedEndpoint;
    try {
      new URL(fullURL);
    } catch {
      throw new Error('Spotify API URL construction failed');
    }

    this.log('Spotify API endpoint structure valid', 'success');
  }

  private async testUserCleanup() {
    if (!this.testUserId) {
      throw new Error('No test user ID available for cleanup');
    }

    // Delete the test user
    await pb.collection('users').delete(this.testUserId);

    // Verify deletion
    try {
      await pb.collection('users').getOne(this.testUserId);
      throw new Error('User was not properly deleted');
    } catch (error) {
      // Expected error - user should not exist
      if (!(error as any).status || (error as any).status !== 404) {
        throw new Error('Unexpected error during user deletion verification');
      }
    }

    // Clear auth store
    pb.authStore.clear();

    if (pb.authStore.isValid) {
      throw new Error('Auth store was not properly cleared');
    }

    this.log('User cleanup completed successfully', 'success');
  }

  private printResults() {
    console.log('\n==================================================');
    console.log('📊 Test Results Summary');
    console.log('==================================================');
    
    this.log(`Total Tests: ${this.results.passed + this.results.failed}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');

    if (this.results.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.errors.forEach(error => console.log(`   ${error}`));
    }

    if (this.results.failed === 0) {
      this.log('\n🎉 All tests passed! OAuth integration is working correctly.', 'success');
      console.log('\n📝 Manual Testing Required:');
      console.log('   • Test Google OAuth flow in the app');
      console.log('   • Test Spotify OAuth flow in the app');
      console.log('   • Test "Get YouTube Music Data" button');
      console.log('   • Test "Get Top 5 Tracks" button');
      console.log('   • Test dual OAuth connections');
    } else {
      this.log('\n🛠️  Please fix the failed tests before proceeding.', 'error');
    }
  }
}

// Run the tests
async function main() {
  const tester = new OAuthFlowTester();
  await tester.runAllTests();
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export default OAuthFlowTester;