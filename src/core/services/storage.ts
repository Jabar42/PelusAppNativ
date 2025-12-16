import * as SecureStore from 'expo-secure-store';
import { TokenCache } from '@clerk/clerk-expo/dist/cache';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const tokenCache: TokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return localStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (err) {
      console.error('Error saving token:', err);
      // Manejar error según necesidad
    }
  },
  async clearToken(key: string): Promise<void> {
    try {
      if (isWeb) {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (err) {
      console.error('Error clearing token:', err);
      // Manejar error según necesidad
    }
  },
};


