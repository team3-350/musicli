import eventsource from 'react-native-sse';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase, { AsyncAuthStore } from 'pocketbase';

// Load the EventSource polyfill for realtime subscriptions
(global as any).EventSource = eventsource;

// Initialize the async store for auth persistence
const store = new AsyncAuthStore({
    save: async (serialized) => AsyncStorage.setItem('pb_auth', serialized),
    initial: AsyncStorage.getItem('pb_auth'),
});

// Initialize the PocketBase client
// Replace with your PocketBase server URL
const pb = new PocketBase('http://127.0.0.1:8090', store);

export default pb;