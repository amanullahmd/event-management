'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserRole } from '../types/user';
import { getUserByEmail, getUserById, getAllUsers } from '../dummy-data';

/**
 * Authentication context for managing user authentication state
 */

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
    const initializeAuth = () => {
      try {
        const storedUserId = localStorage.getItem('auth_user_id');
        if (storedUserId) {
          let foundUser = getUserById(storedUserId);
          
          // Handle organizer users that might not be in the users array
          if (!foundUser && storedUserId.startsWith('organizer-')) {
            const organizerNum = storedUserId.replace('organizer-', '');
            foundUser = {
              id: storedUserId,
              name: `Organizer ${organizerNum}`,
              email: `organizer${organizerNum}@example.com`,
              role: 'organizer' as const,
              status: 'active' as const,
              createdAt: new Date(),
            };
          }
          
          if (foundUser) {
            setUser(foundUser);
          } else {
            // Clear invalid stored user
            localStorage.removeItem('auth_user_id');
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Demo credentials validation
      const validCredentials: Record<string, { password: string; role: string }> = {
        'admin@example.com': { password: 'admin123', role: 'admin' },
        'organizer1@example.com': { password: 'organizer123', role: 'organizer' },
        'organizer2@example.com': { password: 'organizer123', role: 'organizer' },
        'organizer3@example.com': { password: 'organizer123', role: 'organizer' },
        'organizer4@example.com': { password: 'organizer123', role: 'organizer' },
        'organizer5@example.com': { password: 'organizer123', role: 'organizer' },
        'organizer6@example.com': { password: 'organizer123', role: 'organizer' },
        'organizer7@example.com': { password: 'organizer123', role: 'organizer' },
        'organizer8@example.com': { password: 'organizer123', role: 'organizer' },
        'customer1@example.com': { password: 'customer123', role: 'customer' },
        'customer2@example.com': { password: 'customer123', role: 'customer' },
        'customer3@example.com': { password: 'customer123', role: 'customer' },
        'customer4@example.com': { password: 'customer123', role: 'customer' },
        'customer5@example.com': { password: 'customer123', role: 'customer' },
      };

      // Check if email exists in valid credentials
      const credentials = validCredentials[email];
      if (!credentials) {
        throw new Error('Invalid email or password');
      }

      // Validate password
      if (credentials.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Find user by email
      let foundUser = getUserByEmail(email);

      // If not found in users, create a user object for organizers
      if (!foundUser && credentials.role === 'organizer') {
        const organizerNum = email.match(/organizer(\d+)/)?.[1] || '1';
        foundUser = {
          id: `organizer-${organizerNum}`,
          name: `Organizer ${organizerNum}`,
          email: email,
          role: 'organizer' as const,
          status: 'active' as const,
          createdAt: new Date(),
        };
      }

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Check if user is blocked
      if (foundUser.status === 'blocked') {
        throw new Error('Your account has been blocked');
      }

      // Store user ID in localStorage
      localStorage.setItem('auth_user_id', foundUser.id);
      setUser(foundUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user_id');
    setUser(null);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if email already exists
      const existingUser = getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // For dummy data, we would normally create a new user
      // For now, we'll just use an existing user with the provided email
      // In a real app, this would create a new user in the database
      const allUsers = getAllUsers();
      const newUser: User = {
        id: `customer-${allUsers.length + 1}`,
        name,
        email,
        role,
        status: 'active',
        createdAt: new Date(),
      };

      // Store user ID in localStorage
      localStorage.setItem('auth_user_id', newUser.id);
      setUser(newUser);
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
