import React from 'react';

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9fc7e58b-91ea-405c-841e-a7cd0c1803e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'clerkMock.tsx:10',message:'Clerk useAuth mock called',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B',runId:'post-fix'})}).catch(()=>{});
  // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9fc7e58b-91ea-405c-841e-a7cd0c1803e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'clerkMock.tsx:21',message:'Clerk useUser mock called',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B',runId:'post-fix'})}).catch(()=>{});
  // #endregion
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


