import React, { useState } from 'react';
import { View } from 'react-native';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

interface AuthContainerProps {
  onAuthSuccess?: () => void;
}

export default function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
  const [isLogin, setIsLogin] = useState(true);

  const handleNavigateToSignup = () => {
    setIsLogin(false);
  };

  const handleNavigateToLogin = () => {
    setIsLogin(true);
  };

  return (
    <View style={{ flex: 1 }}>
      {isLogin ? (
        <LoginScreen
          onLoginSuccess={onAuthSuccess}
          onNavigateToSignup={handleNavigateToSignup}
        />
      ) : (
        <SignupScreen
          onSignupSuccess={onAuthSuccess}
          onNavigateToLogin={handleNavigateToLogin}
        />
      )}
    </View>
  );
}