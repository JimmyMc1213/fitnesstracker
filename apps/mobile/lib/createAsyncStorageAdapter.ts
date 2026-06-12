import type { PersistStorageAdapter } from "@newyouai/core";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** AsyncStorage-backed adapter for React Native persistence. */
export function createAsyncStorageAdapter(): PersistStorageAdapter {
  return {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
  };
}
