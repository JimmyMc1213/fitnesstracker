import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

type SecureStoreAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

let cachedAdapter: SecureStoreAdapter | undefined;

/** Session storage for Supabase auth — SecureStore on native, AsyncStorage on web. */
export function getSupabaseSecureStoreAdapter(): SecureStoreAdapter {
  if (cachedAdapter) return cachedAdapter;

  if (Platform.OS === "web") {
    cachedAdapter = {
      getItem(key: string) {
        return AsyncStorage.getItem(key);
      },
      setItem(key: string, value: string) {
        return AsyncStorage.setItem(key, value);
      },
      removeItem(key: string) {
        return AsyncStorage.removeItem(key);
      },
    };
    return cachedAdapter;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SecureStore = require("expo-secure-store") as typeof import("expo-secure-store");

  // Allow reads while the device is locked (after first unlock since boot) so Supabase
  // autoRefreshToken can access the session in the background.
  const keychainOptions = {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  };

  cachedAdapter = {
    getItem(key: string) {
      return SecureStore.getItemAsync(key, keychainOptions);
    },
    setItem(key: string, value: string) {
      return SecureStore.setItemAsync(key, value, keychainOptions);
    },
    removeItem(key: string) {
      return SecureStore.deleteItemAsync(key, keychainOptions);
    },
  };

  return cachedAdapter;
}
