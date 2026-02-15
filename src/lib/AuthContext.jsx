/**
 * Authentication Context
 * 
 * Simplified auth context for local development.
 * No actual authentication - just provides a mock user context.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
      // Set a mock user for local development
      setUser({
        id: 'local-user',
        email: 'local@dev.local',
        name: 'Local Developer',
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const navigateToLogin = () => {
    console.log('Navigate to login called (no-op in local mode)');
  };

  const value = {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    user,
    navigateToLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
