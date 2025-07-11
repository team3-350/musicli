import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  Layout,
  Text,
  Input,
  Button,
  Card,
  Spinner
} from '@ui-kitten/components';
import pb from '../../src/services/pocketbase/client';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onNavigateToSignup?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onNavigateToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('users').authWithPassword(email, password);
      console.log('Login successful:', pb.authStore.record);
      Alert.alert('Success', 'Logged in successfully!');
      onLoginSuccess?.();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text category="h1" style={styles.title}>
            Welcome Back
          </Text>
          <Text appearance="hint" style={styles.subtitle}>
            Sign in to your account to continue
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.formContent}>
            <Text category="label" style={styles.label}>
              Email
            </Text>
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            <Text category="label" style={styles.label}>
              Password
            </Text>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />

            <Button
              onPress={handleLogin}
              disabled={loading}
              style={styles.button}
              accessoryLeft={loading ? () => <Spinner size="small" /> : undefined}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </View>
        </Card>

        <View style={styles.signupContainer}>
          <Text appearance="hint">Don't have an account? </Text>
          <Text
            status="primary"
            onPress={onNavigateToSignup}
            style={styles.signupLink}
          >
            Sign up
          </Text>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    marginBottom: 24,
  },
  formContent: {
    paddingVertical: 24,
  },
  label: {
    marginBottom: 4,
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLink: {
    textDecorationLine: 'underline',
  },
});

