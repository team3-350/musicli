import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AuthContainer from '../components/auth/AuthContainer';
import pb from '../src/services/pocketbase/client';

export default function AuthScreen() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        if (pb.authStore.isValid) {
          // User is already logged in, redirect to main app
          router.replace('/(tabs)');
          return;
        }
      } catch (error) {
        console.log('Auth check error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    // Navigate to the main app after successful authentication
    router.replace('/(tabs)');
  };

  if (isCheckingAuth) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <AuthContainer onAuthSuccess={handleAuthSuccess} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});