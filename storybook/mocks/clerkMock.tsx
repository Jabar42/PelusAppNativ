import React from 'react';

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_mock_123',
    sessionId: 'sess_mock_123',
    signOut: async () => {
      console.log('Mock SignOut called');
    },
    getToken: async () => 'mock_token',
  };
};

export const useUser = () => {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'user_mock_123',
      firstName: 'Mock',
      lastName: 'User',
      primaryEmailAddress: {
        emailAddress: 'mock@example.com',
      },
      publicMetadata: {
        role: 'B2C',
        hasCompletedOnboarding: true,
      },
    },
  };
};

export const useSignIn = () => {
  return {
    isLoaded: true,
    signIn: {
      create: async () => {},
    },
    setActive: async () => {},
  };
};

export const useSignUp = () => {
  return {
    isLoaded: true,
    signUp: {
      create: async () => {},
    },
    setActive: async () => {},
  };
};

export const SignedIn = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SignedOut = ({ children }: { children: React.ReactNode }) => null;
export const ClerkLoaded = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Mocks para tipos si es necesario
export const TokenCache = {};




