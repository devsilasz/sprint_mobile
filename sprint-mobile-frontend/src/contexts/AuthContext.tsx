import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse, LoginCredentials } from '../types/auth';
import { api, loadApiUrl } from '../services/api';
import { isAxiosError } from 'axios';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        await loadApiUrl();
        const storedToken = await AsyncStorage.getItem('@app_token');
        const storedUser = await AsyncStorage.getItem('@app_user');

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      const { access_token, user: userData } = response.data;

      await AsyncStorage.setItem('@app_token', access_token);
      await AsyncStorage.setItem('@app_user', JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      console.error('Erro no login', error);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('@app_token');
      await AsyncStorage.removeItem('@app_user');
      setUser(null);
    } catch (error) {
      console.error('Erro no logout', error);
    }
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (isAxiosError(error)) {
          if (error.response && error.response.status === 401) {
            await logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
