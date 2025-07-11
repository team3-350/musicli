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

interface SignupScreenProps {
  onSignupSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export default function SignupScreen({ onSignupSuccess, onNavigateToLogin }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        email,
        password,
        passwordConfirm: confirmPassword,
      };

      const record = await pb.collection('users').create(userData);
      console.log('Signup successful:', record);
      
      // Auto-login after successful signup
      await pb.collection('users').authWithPassword(email, password);
      console.log('Auto-login successful:', pb.authStore.record);
      
      Alert.alert('Success', 'Account created successfully!');
      onSignupSuccess?.();
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error?.response?.data?.email?.message || 
                          error?.response?.data?.password?.message ||
                          'Failed to create account. Please try again.';
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text category="h1" style={styles.title}>
            Create Account
          </Text>
          <Text appearance="hint" style={styles.subtitle}>
            Join us and start your musical journey
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
              placeholder="Create a password (min 8 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />

            <Text category="label" style={styles.label}>
              Confirm Password
            </Text>
            <Input
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />

            <Button
              onPress={handleSignup}
              disabled={loading}
              status="success"
              style={styles.button}
              accessoryLeft={loading ? () => <Spinner size="small" /> : undefined}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </View>
        </Card>

        <View style={styles.loginContainer}>
          <Text appearance="hint">Already have an account? </Text>
          <Text
            status="primary"
            onPress={onNavigateToLogin}
            style={styles.loginLink}
          >
            Sign in
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    textDecorationLine: 'underline',
  },
});

