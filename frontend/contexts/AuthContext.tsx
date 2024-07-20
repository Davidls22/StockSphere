import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface UserContextType {
  token: string | null;
  user: { id: string } | null;
  signIn: (token: string, user: { id: string }) => void;
  signOut: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('User data loaded from storage:', JSON.parse(storedUser));  
      }
      setIsLoading(false);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token]);

  const signIn = async (newToken: string, newUser: { id: string }) => {
    setToken(newToken);
    setUser(newUser);
    await AsyncStorage.setItem('userToken', newToken);
    await AsyncStorage.setItem('userData', JSON.stringify(newUser));
    console.log('User signed in. Token:', newToken, 'User:', newUser); 
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    console.log('User signed out'); 
    router.replace('/login');
  };

  return (
    <UserContext.Provider value={{ token, user, signIn, signOut, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
