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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the application with authentication context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            } else {
              // Token is invalid, clear it
              console.warn('Token validation failed with status:', response.status);
              localStorage.removeItem('auth_token');
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
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Store JWT token and user info
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user_id', data.id);
      localStorage.setItem('auth_user_role', data.role.toLowerCase());
      
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
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Call backend logout endpoint if available
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Logout endpoint may not exist, continue with client-side logout
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user_id');
      localStorage.removeItem('auth_user_role');
      setUser(null);
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store JWT token and user info
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user_id', data.id);
      localStorage.setItem('auth_user_role', data.role.toLowerCase());
      
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
