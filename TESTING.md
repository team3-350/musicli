# MusicLi OAuth Integration Testing Guide

This document provides comprehensive testing instructions for the OAuth integration features in MusicLi, including both automated and manual testing workflows.

## 🔄 **End-to-End Testing Workflow**

```mermaid
graph TD
    Start([Developer Makes Changes]) --> AutoTests{Run Automated Tests}
    
    %% Automated Testing Branch
    AutoTests -->|bun run test:crossplatform| UnitTests[🤖 Unit Tests]
    UnitTests --> DataValidation[Data Structure Validation]
    UnitTests --> AlgorithmTests[Algorithm Logic Tests]
    UnitTests --> APIConstruction[API Endpoint Tests]
    UnitTests --> ErrorHandling[Error Handling Tests]
    UnitTests --> Statistics[Statistics Calculation]
    
    %% Auto Test Results
    DataValidation --> AutoPass{All 18 Tests Pass?}
    AlgorithmTests --> AutoPass
    APIConstruction --> AutoPass
    ErrorHandling --> AutoPass
    Statistics --> AutoPass
    
    AutoPass -->|❌ No| FixCode[Fix Code Issues]
    FixCode --> AutoTests
    
    AutoPass -->|✅ Yes| ReadyForManual[Ready for Manual Testing]
    
    %% Manual Testing Branch
    ReadyForManual --> ManualPrep[📋 Manual Test Preparation]
    ManualPrep --> StartPocketBase[Start PocketBase Server]
    ManualPrep --> StartExpo[Start Expo App]
    
    StartPocketBase --> ManualTests{Manual Test Categories}
    StartExpo --> ManualTests
    
    %% Manual Test Categories
    ManualTests --> GoogleOAuth[👤 Google OAuth Flow]
    ManualTests --> SpotifyOAuth[👤 Spotify OAuth Flow] 
    ManualTests --> LiveAPI[👤 Live API Testing]
    ManualTests --> CrossPlatform[👤 Cross-Platform Discovery]
    
    %% Google OAuth Details
    GoogleOAuth --> GoogleBrowser[Open Browser]
    GoogleBrowser --> GoogleConsent[Navigate Consent Screen]
    GoogleConsent --> GoogleScopes{YouTube Scopes Visible?}
    GoogleScopes -->|❌ No| OAuthIssue[OAuth Configuration Issue]
    GoogleScopes -->|✅ Yes| GoogleApprove[User Approves Permissions]
    GoogleApprove --> GoogleToken[Token Stored in Memory]
    
    %% Spotify OAuth Details  
    SpotifyOAuth --> SpotifyBrowser[Open Browser]
    SpotifyBrowser --> SpotifyConsent[Navigate Consent Screen]
    SpotifyConsent --> SpotifyScopes{Music Scopes Visible?}
    SpotifyScopes -->|❌ No| OAuthIssue
    SpotifyScopes -->|✅ Yes| SpotifyApprove[User Approves Permissions]
    SpotifyApprove --> SpotifyToken[Token Stored in Memory]
    
    %% Live API Testing
    LiveAPI --> YouTubeAPI[Test YouTube API Call]
    LiveAPI --> SpotifyAPI[Test Spotify API Call]
    YouTubeAPI --> APISuccess{API Calls Successful?}
    SpotifyAPI --> APISuccess
    
    %% Cross-Platform Testing
    CrossPlatform --> BothConnected{Both Services Connected?}
    BothConnected -->|❌ No| ConnectServices[Connect Missing Services]
    ConnectServices --> BothConnected
    BothConnected -->|✅ Yes| RunDiscovery[Run Cross-Platform Discovery]
    RunDiscovery --> MatchAlgorithm[Test Match Confidence Algorithm]
    MatchAlgorithm --> DiscoveryResults[Verify Discovery Results]
    
    %% Results Convergence
    GoogleToken --> ManualPass{All Manual Tests Pass?}
    SpotifyToken --> ManualPass
    APISuccess --> ManualPass
    DiscoveryResults --> ManualPass
    
    OAuthIssue --> FixOAuth[Fix OAuth Configuration]
    FixOAuth --> ManualTests
    
    APISuccess -->|❌ No| APIIssue[API Integration Issue]
    APIIssue --> FixAPI[Fix API Implementation]
    FixAPI --> AutoTests
    
    ManualPass -->|❌ No| FixManualIssues[Fix Manual Test Issues]
    FixManualIssues --> AutoTests
    
    ManualPass -->|✅ Yes| E2EComplete[🎉 End-to-End Testing Complete]
    
    %% Final Steps
    E2EComplete --> ReadyForProd{Ready for Production?}
    ReadyForProd -->|✅ Yes| Deploy[🚀 Deploy to Production]
    ReadyForProd -->|❌ No| MoreTesting[Additional Testing Required]
    MoreTesting --> AutoTests
    
    Deploy --> Monitor[📊 Monitor in Production]
    Monitor --> Metrics[Track OAuth Success Rates]
    Monitor --> Performance[Track API Performance]
    Monitor --> UserFeedback[Collect User Feedback]
    
    %% Styling
    classDef automated fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef manual fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef decision fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class UnitTests,DataValidation,AlgorithmTests,APIConstruction,ErrorHandling,Statistics automated
    class GoogleOAuth,SpotifyOAuth,LiveAPI,CrossPlatform,GoogleBrowser,GoogleConsent,GoogleApprove,SpotifyBrowser,SpotifyConsent,SpotifyApprove,YouTubeAPI,SpotifyAPI,RunDiscovery,MatchAlgorithm manual
    class AutoPass,ManualPass,GoogleScopes,SpotifyScopes,APISuccess,BothConnected,ReadyForProd decision
    class E2EComplete,Deploy,GoogleToken,SpotifyToken,DiscoveryResults success
    class FixCode,OAuthIssue,APIIssue,FixOAuth,FixAPI,FixManualIssues error
```

## 🤖 **Automated Tests**

### **Cross-Platform Music Discovery Tests** ✅
**Status:** ✅ **18/18 tests passing**  
**Execution Time:** ~1.4 seconds  

### Running All Tests
```bash
# Run the complete OAuth test suite
bun run test:oauth

# Run only cross-platform tests
bun run test:crossplatform

# Run Jest integration tests
bun run test:integration
```

### Prerequisites
- PocketBase server running on `http://127.0.0.1:8090`
- Google OAuth provider configured in PocketBase
- Spotify OAuth provider configured in PocketBase
- App dependencies installed (`bun install`)

### **Automated Test Coverage:**

1. **Service Configuration Tests (3 tests)**
   - ✅ Spotify track data structure validation
   - ✅ YouTube video data structure validation  
   - ✅ CrossPlatformTrack interface validation

2. **Search Query Generation (3 tests)**
   - ✅ Proper search query generation for tracks
   - ✅ Special character handling in track names
   - ✅ Multiple artist handling

3. **Match Confidence Algorithm (3 tests)**
   - ✅ High confidence match identification
   - ✅ Medium confidence match identification
   - ✅ Partial word match handling

4. **API Endpoint Construction (3 tests)**
   - ✅ Spotify API endpoint structure validation
   - ✅ YouTube API search endpoint structure validation
   - ✅ Special character encoding in search queries

5. **Error Handling (3 tests)**
   - ✅ Missing service connection handling
   - ✅ Empty track array handling
   - ✅ API failure graceful degradation

6. **Statistics Calculation (2 tests)**
   - ✅ Success rate calculation accuracy
   - ✅ Edge case handling (0%, 100%, empty arrays)

7. **Rate Limiting (1 test)**
   - ✅ Proper delay implementation between API calls

## 👤 **Manual Testing Procedures**

OAuth flows inherently require **human interaction** and cannot be fully automated because they involve browser-based consent screens, user authentication, and security measures.

### **Phase 1: Automated Testing** 🤖
**Time:** ~2 seconds  
**Coverage:** Business logic, algorithms, data structures

```mermaid
graph LR
    A[Code Change] --> B[Run Automated Tests]
    B --> C[18 Unit Tests Execute]
    C --> D{All Pass?}
    D -->|✅ Yes| E[Proceed to Manual]
    D -->|❌ No| F[Fix & Retry]
    F --> B
```

### **Phase 2: Manual OAuth Testing** 👤  
**Time:** ~5-10 minutes per service  
**Coverage:** User authentication flows

```mermaid
graph TD
    A[Start Manual Testing] --> B[Google OAuth]
    A --> C[Spotify OAuth]
    
    B --> B1[Browser Opens]
    B1 --> B2[User Logs In]
    B2 --> B3[Consent Screen]
    B3 --> B4[Approve Scopes]
    B4 --> B5[Token Stored]
    
    C --> C1[Browser Opens]
    C1 --> C2[User Logs In]
    C2 --> C3[Consent Screen]
    C3 --> C4[Approve Scopes]
    C4 --> C5[Token Stored]
    
    B5 --> D[Both Services Ready]
    C5 --> D
```

### 1. Google OAuth Flow Test

**Steps:**
1. Start the app: `expo start`
2. Navigate to the home screen
3. Click "Connect Google" button
4. Verify the OAuth consent screen includes YouTube scopes:
   - `https://www.googleapis.com/auth/youtube.readonly`
   - `https://www.googleapis.com/auth/youtube.force-ssl`
5. Complete the OAuth flow
6. Verify "✓ Connected" appears for Google
7. Click "Get YouTube Music Data" button
8. Check console for successful API response

**Expected Console Logs:**
```
LOG  Starting Google OAuth with PocketBase and YouTube scopes...
LOG  Modified OAuth URL with YouTube scopes: [URL with scopes]
LOG  Google OAuth successful: [OAuth data]
LOG  Google tokens stored in memory
LOG  Found Google tokens in memory for current user
LOG  Valid Google token found in memory
LOG  YouTube Music Videos: [list of videos]
```

### 2. Spotify OAuth Flow Test

**Steps:**
1. Click "Connect Spotify" button
2. Verify the OAuth consent screen includes music scopes:
   - `user-top-read`
   - `user-read-private`
   - `user-read-email`
   - `user-read-recently-played`
3. Complete the OAuth flow
4. Verify "✓ Connected" appears for Spotify
5. Click "Get Top 5 Tracks" button
6. Check console for successful API response

**Expected Console Logs:**
```
LOG  Starting Spotify OAuth with PocketBase and custom scopes...
LOG  Modified OAuth URL with scopes: [URL with scopes]
LOG  Spotify OAuth successful: [OAuth data]
LOG  Spotify tokens stored in memory
LOG  Found Spotify tokens in memory for current user
LOG  Valid Spotify token found in memory
LOG  Top Tracks: [list of tracks]
```

### **Phase 3: Live API Integration** 🔗
**Time:** ~2-3 minutes  
**Coverage:** Real API calls with valid tokens

```mermaid
graph LR
    A[Valid Tokens] --> B[YouTube API Test]
    A --> C[Spotify API Test]
    B --> D[API Response Valid?]
    C --> D
    D -->|✅ Yes| E[API Integration ✓]
    D -->|❌ No| F[Debug API Issues]
    F --> A
```

### **Phase 4: Cross-Platform Discovery** 🎵
**Time:** ~15-30 seconds for 5 tracks  
**Coverage:** End-to-end integration

```mermaid
graph TD
    A[Start Cross-Platform Test] --> B[Fetch Spotify Top Tracks]
    B --> C[Search YouTube for Each Track]
    C --> D[Calculate Match Confidence]
    D --> E[Generate Statistics]
    E --> F[Success Rate > 60%?]
    F -->|✅ Yes| G[Cross-Platform ✓]
    F -->|❌ No| H[Investigate Matching Algorithm]
    H --> C
```

### 3. Cross-Platform Discovery Test

**Steps:**
1. Ensure both Google and Spotify are connected
2. Click "Find YouTube Versions of My Top Tracks" button
3. Verify console shows cross-platform discovery progress
4. Check success statistics in alert and console

**Expected Console Output:**
```
🚀 Starting cross-platform music discovery...
✅ Both Spotify and YouTube are connected
🎵 Fetching top 5 Spotify tracks (long_term)...
✅ Retrieved 5 tracks from Spotify
🎯 Finding YouTube versions for 5 tracks...

📀 Processing track 1/5: "Never Gonna Give You Up" by Rick Astley
🔍 Searching YouTube for: "Never Gonna Give You Up Rick Astley"
📺 Found 3 YouTube videos for "Never Gonna Give You Up Rick Astley"
✅ Found YouTube match (high confidence): "Rick Astley - Never Gonna Give You Up (Official Music Video)"

📊 Cross-Platform Music Discovery Summary
==========================================
📈 Statistics:
   Total tracks: 5
   YouTube versions found: 4/5 (80%)
   High confidence matches: 3
   Medium confidence matches: 1
   Low confidence matches: 0
   No matches: 1
```

### 4. Dual OAuth Connection Test

**Steps:**
1. Connect to both Google and Spotify
2. Verify both services show "✓ Connected"
3. Test both API buttons work simultaneously
4. Verify tokens are stored independently
5. Disconnect one service and verify the other remains connected

### 5. Error Handling Tests

**Test Invalid/Expired Tokens:**
1. Wait for token expiration (check expiry times in logs)
2. Try to use API buttons
3. Verify graceful error handling

**Test Network Issues:**
1. Disconnect from internet
2. Try OAuth flows
3. Verify appropriate error messages

**Test PocketBase Disconnection:**
1. Stop PocketBase server
2. Try to connect OAuth
3. Verify connection error handling

### 6. Account Management Tests

**Sign Out Test:**
1. Connect both services
2. Click "Sign Out" button
3. Verify both connections are cleared
4. Verify redirect to auth screen

**Individual Disconnect Test:**
1. Connect both services
2. Click "Disconnect" on one service
3. Verify only that service is disconnected
4. Verify the other remains connected

## 📊 **Test Type Comparison**

| Aspect | Automated Tests 🤖 | Manual Tests 👤 |
|--------|-------------------|------------------|
| **Speed** | ~2 seconds | ~15-20 minutes |
| **Consistency** | 100% repeatable | Variable (human factor) |
| **Coverage** | Business logic only | Full user experience |
| **Cost** | Low (once written) | High (requires human time) |
| **Feedback** | Immediate | Delayed |
| **Real-world** | Simulated | Actual conditions |
| **OAuth Flows** | ❌ Cannot test | ✅ Full coverage |
| **UI Validation** | ❌ Cannot test | ✅ Full coverage |
| **Regression Detection** | ✅ Excellent | ⚠️ Manual effort |
| **CI/CD Integration** | ✅ Perfect fit | ❌ Requires human |

## Test Coverage

### ✅ Automated Tests Cover:
- PocketBase connection and account management
- OAuth provider configuration validation
- Service method availability
- API endpoint structure validation
- Token storage and retrieval logic
- Error handling patterns
- Cross-platform discovery algorithms
- Match confidence calculations
- Statistics and performance metrics

### 🔍 Manual Tests Cover:
- Complete OAuth flows with user interaction
- Real API calls to YouTube and Spotify
- Token persistence across app usage
- UI state management
- Error handling with real network conditions
- Cross-platform discovery with real music libraries
- Live authentication with actual OAuth providers

## 🎯 **Quality Gates**

```mermaid
graph LR
    A[Code Complete] --> B{Automated Tests Pass?}
    B -->|❌ No| C[❌ Block Progress]
    B -->|✅ Yes| D{Manual OAuth Tests Pass?}
    D -->|❌ No| E[❌ Block Deployment]
    D -->|✅ Yes| F{Live API Tests Pass?}
    F -->|❌ No| G[❌ Block Release]
    F -->|✅ Yes| H{Cross-Platform Discovery Works?}
    H -->|❌ No| I[❌ Block Production]
    H -->|✅ Yes| J[✅ Ready for Production]
    
    classDef gate fill:#f3e5f5,stroke:#4a148c
    classDef pass fill:#e8f5e8,stroke:#2e7d32
    classDef fail fill:#ffebee,stroke:#c62828
    
    class B,D,F,H gate
    class J pass
    class C,E,G,I fail
```

## Troubleshooting

### Common Issues:

**"PocketBase server not accessible"**
- Ensure PocketBase is running: `cd pocketbase && ./pocketbase serve`
- Check the server URL in `src/services/pocketbase/client.ts`

**"OAuth provider not configured"**
- Configure Google OAuth in PocketBase admin
- Configure Spotify OAuth in PocketBase admin
- Verify client IDs are set correctly

**"403 Forbidden" API errors**
- Check OAuth scopes are being added correctly
- Verify consent screen shows required permissions
- Check token expiration and refresh logic

**"400 Bad Request" API errors**
- Verify API endpoint parameters
- Check request format and headers
- Validate token format

### Debug Mode:

Enable verbose logging by checking console for:
- OAuth URL modifications
- Token storage confirmations
- API request/response details
- Error messages with specific codes

## Performance Considerations

- **Token Caching**: Tokens are stored in memory only
- **API Rate Limits**: YouTube Data API has quota limits
- **Token Expiration**: Implement refresh logic for production
- **Memory Usage**: Clear tokens on sign out
- **Cross-Platform Discovery**: ~15-30 seconds for 5 tracks with rate limiting

## Security Notes

- Tokens are not persisted to disk
- OAuth flows use secure PKCE where applicable
- State parameters prevent CSRF attacks
- Scopes follow principle of least privilege
- In-memory token storage prevents unauthorized access

## 🔄 **Continuous Integration Workflow**

```mermaid
graph TD
    A[Git Commit] --> B{Run Automated Tests}
    B -->|✅ Pass| C[Mark as Ready for Manual Testing]
    B -->|❌ Fail| D[Block Merge]
    D --> E[Developer Fixes Issues]
    E --> A
    
    C --> F[Manual Testing Required]
    F --> G[Tester Runs OAuth Flows]
    G --> H{Manual Tests Pass?}
    H -->|✅ Yes| I[Approve for Production]
    H -->|❌ No| J[Create Bug Report]
    J --> E
    
    I --> K[Deploy to Production]
    K --> L[Monitor OAuth Success Rates]
    L --> M[Track API Performance]
    M --> N[Collect User Feedback]
    
    classDef automated fill:#e1f5fe
    classDef manual fill:#fff3e0
    classDef production fill:#e8f5e8
    
    class B,D automated
    class F,G,H,J manual
    class I,K,L,M,N production
```

## Future Enhancements

- Implement token refresh mechanisms
- Add persistent token storage (encrypted)
- Implement background token validation
- Add more granular scope management
- Implement offline capability detection
- Enhanced cross-platform matching algorithms
- Real-time OAuth success rate monitoring

---

This comprehensive testing approach ensures both **code quality** through automated testing and **real-world functionality** through manual verification, providing bulletproof OAuth integration while maintaining development velocity.