// Jest setup for Expo environment

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-sse
jest.mock('react-native-sse', () => ({
  __esModule: true,
  default: class MockEventSource {
    constructor() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve({ 
    type: 'success', 
    url: 'musicli://callback?code=mock_code&state=mock_state' 
  })),
}));

// Mock expo-crypto  
jest.mock('expo-crypto', () => ({
  getRandomBytes: jest.fn((size) => {
    const array = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  digestStringAsync: jest.fn(() => Promise.resolve('mock-hash-digest')),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA256'
  },
  CryptoEncoding: {
    BASE64: 'BASE64',
    HEX: 'HEX'
  }
}));

// Global fetch mock for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      items: [
        {
          id: 'mock-track-id',
          name: 'Mock Track',
          artists: [{ name: 'Mock Artist' }],
          album: { name: 'Mock Album' },
          duration_ms: 180000,
          popularity: 85
        }
      ]
    }),
  })
);

// Mock console to reduce noise but keep errors visible
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: originalConsole.error, // Keep errors visible for debugging
  info: jest.fn(),
};