'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole } from '../types/user';

/**
 * Authentication context for managing user authentication state
 */

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>;
  refreshToken: () => Promise<void>;
  isTokenExpiringSoon: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the application with authentication context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenExpiringSoon, setIsTokenExpiringSoon] = useState(false);
  const [tokenExpirationTimer, setTokenExpirationTimer] = useState<NodeJS.Timeout | null>(null);

  // Check if token is expiring soon (within 5 minutes)
  const checkTokenExpiration = () => {
    const token = localStorage.getItem('auth_token');
    const tokenExpiresAt = localStorage.getItem('auth_token_expires_at');
    
    if (token && tokenExpiresAt) {
      const expiresAt = new Date(tokenExpiresAt).getTime();
      const now = new Date().getTime();
      const timeUntilExpiration = expiresAt - now;
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      if (timeUntilExpiration > 0 && timeUntilExpiration < fiveMinutesInMs) {
        setIsTokenExpiringSoon(true);
        return true;
      }
    }
    
    setIsTokenExpiringSoon(false);
    return false;
  };

  // Set up token expiration check interval
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Fetch current user from backend using stored token
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
          console.log('Initializing auth with backend URL:', backendUrl);
          
          try {
            const response = await fetch(`${backendUrl}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              const user: User = {
                id: data.id,
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                role: data.role.toLowerCase() as UserRole,
                status: 'active' as const,
                createdAt: new Date(),
              };
              setUser(user);
              checkTokenExpiration();
            } else {
              // Token is invalid, clear it
              console.warn('Token validation failed with status:', response.status);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_refresh_token');
              localStorage.removeItem('auth_token_expires_at');
              localStorage.removeItem('auth_user_id');
              localStorage.removeItem('auth_user_role');
            }
          } catch (fetchError) {
            console.error('Failed to fetch user from backend:', fetchError);
            // Don't clear tokens on network error, just skip initialization
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call backend API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      console.log('Attempting login with backend URL:', backendUrl);
      console.log('Login request body:', { email, password: '***' });
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, try to get the response text for debugging
          const responseText = await response.text();
          console.error('Failed to parse error response as JSON. Response text:', responseText);
          errorData = { message: `Login failed with status ${response.status}` };
        }
        // Extract the error message from the response
        const errorMessage = errorData.message || `Login failed with status ${response.status}`;
        console.error('Login error response:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful, user:', { id: data.id, email: data.email, role: data.role });
      
      // Store JWT tokens and user info
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_refresh_token', data.refreshToken);
      localStorage.setItem('auth_user_id', data.id);
      localStorage.setItem('auth_user_role', data.role.toLowerCase());
      
      // Store token expiration time (15 minutes from now)
      const expiresAt = new Date(new Date().getTime() + data.expiresIn * 1000);
      localStorage.setItem('auth_token_expires_at', expiresAt.toISOString());
      
      // Create user object from response
      const user: User = {
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role.toLowerCase() as UserRole,
        status: 'active' as const,
        createdAt: new Date(),
      };
      
      setUser(user);
      checkTokenExpiration();
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error - backend may not be accessible at:', process.env.NEXT_PUBLIC_BACKEND_URL);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('auth_refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_token_expires_at');
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('auth_user_role');
        setUser(null);
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Update stored token
      localStorage.setItem('auth_token', data.accessToken);
      
      // Update token expiration time
      const expiresAt = new Date(new Date().getTime() + data.expiresIn * 1000);
      localStorage.setItem('auth_token_expires_at', expiresAt.toISOString());
      
      console.log('Token refreshed successfully');
      checkTokenExpiration();
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('auth_refresh_token');
      if (refreshTokenValue) {
        // Call backend logout endpoint
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        }).catch(() => {
          // Logout endpoint may fail, continue with client-side logout
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_token_expires_at');
      localStorage.removeItem('auth_user_id');
      localStorage.removeItem('auth_user_role');
      setUser(null);
      setIsTokenExpiringSoon(false);
      
      if (tokenExpirationTimer) {
        clearTimeout(tokenExpirationTimer);
        setTokenExpirationTimer(null);
      }
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    setIsLoading(true);
    try {
      // Call backend API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' ') || '',
          email, 
          password,
          role: role.toUpperCase(),
        }),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, try to get the response text for debugging
          const responseText = await response.text();
          console.error('Failed to parse error response as JSON. Response text:', responseText);
          errorData = { message: 'Registration failed' };
        }
        // Extract the error message from the response
        const errorMessage = errorData.message || 'Registration failed';
        console.error('Registration error response:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Store JWT tokens and user info
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_refresh_token', data.refreshToken);
      localStorage.setItem('auth_user_id', data.id);
      localStorage.setItem('auth_user_role', data.role.toLowerCase());
      
      // Store token expiration time
      const expiresAt = new Date(new Date().getTime() + data.expiresIn * 1000);
      localStorage.setItem('auth_token_expires_at', expiresAt.toISOString());
      
      // Create user object from response
      const user: User = {
        id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role.toLowerCase() as UserRole,
        status: 'active' as const,
        createdAt: new Date(),
      };
      
      setUser(user);
      checkTokenExpiration();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    register,
    refreshToken,
    isTokenExpiringSoon,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
