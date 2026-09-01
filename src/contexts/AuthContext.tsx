'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginFormData, RegisterFormData, AuthContextType } from '@/types';
import apiService from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Set initial loading to false to match server-side state
const initialState: AuthState = {
  user: null,
  isLoading: false, // Initial server state should match client
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    let mounted = true;

    const loadAuthState = async () => {
      // Set loading true only on client-side
      if (typeof window !== 'undefined') {
        dispatch({ type: 'LOGIN_START' });
      }
      
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser && mounted) {
          const user = JSON.parse(storedUser);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user },
          });
        } else if (mounted) {
          // Ensure we set loading to false even if no user found
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear invalid stored data
        localStorage.removeItem('user');
        if (mounted) {
          dispatch({ type: 'LOGIN_ERROR', payload: 'Failed to load auth state' });
        }
      }
    };

    loadAuthState();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for logout events from API service
  useEffect(() => {
    const handleLogout = () => {
      dispatch({ type: 'LOGOUT' });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleLogout);
      return () => window.removeEventListener('auth:logout', handleLogout);
    }
  }, []);

  const login = async (credentials: LoginFormData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await apiService.login(
        credentials.pseudonym,
        credentials.password,
        credentials.recovery_token
      );
      
      // Store user and tokens in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      
      // Update API service tokens
      apiService.setTokens(response.tokens.access, response.tokens.refresh);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage,
      });
    }
  };

  const register = async (data: RegisterFormData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await apiService.register(
        data.pseudonym, 
        data.password, 
        data.password_confirm,
        data.account_type
      );
      
      // Store user and tokens in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('access_token', response.tokens.access);
      localStorage.setItem('refresh_token', response.tokens.refresh);
      
      // Update API service tokens
      apiService.setTokens(response.tokens.access, response.tokens.refresh);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
        },
      });
      
      // Show recovery token if provided
      if (response.recovery_token) {
        alert(`Recovery Token: ${response.recovery_token}\n\nSave this securely - it won't be shown again!`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage,
      });
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Clear tokens from API service
      apiService.clearTokens();
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if server call fails
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Clear tokens from API service
      apiService.clearTokens();
      
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
