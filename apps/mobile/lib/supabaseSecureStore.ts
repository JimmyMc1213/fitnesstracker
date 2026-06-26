import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

type SecureStoreAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

let cachedAdapter: SecureStoreAdapter | undefined;

function createAsyncStorageAdapter(): SecureStoreAdapter {
  return {
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
}

/**
 * SecureStore needs a signed build with keychain entitlements. Unsigned simulator
 * builds (common in local dev) throw "A required entitlement isn't present", which
 * breaks Supabase autoRefreshToken. Use AsyncStorage on web, in dev, or when the
 * env flag is set, so local development never depends on the keychain.
 */
function shouldUseAsyncStorageForAuth(): boolean {
  if (Platform.OS === "web") return true;
  if (process.env.EXPO_PUBLIC_SUPABASE_USE_ASYNC_STORAGE === "true") return true;
  if (__DEV__) return true;
  return false;
}

/**
 * Wraps SecureStore so a missing-entitlement failure can never crash auth: it falls
 * back to AsyncStorage for that operation instead of throwing.
 */
function createResilientSecureStoreAdapter(): SecureStoreAdapter {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SecureStore = require("expo-secure-store") as typeof import("expo-secure-store");
  const fallback = createAsyncStorageAdapter();

  // Allow reads while the device is locked (after first unlock since boot) so Supabase
  // autoRefreshToken can access the session in the background.
  const keychainOptions = {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  };

  return {
    async getItem(key: string) {
      try {
        return await SecureStore.getItemAsync(key, keychainOptions);
      } catch {
        return fallback.getItem(key);
      }
    },
    async setItem(key: string, value: string) {
      try {
        await SecureStore.setItemAsync(key, value, keychainOptions);
      } catch {
        await fallback.setItem(key, value);
      }
    },
    async removeItem(key: string) {
      try {
        await SecureStore.deleteItemAsync(key, keychainOptions);
      } catch {
        await fallback.removeItem(key);
      }
    },
  };
}

/** Session storage for Supabase auth, SecureStore on native, AsyncStorage on web/dev. */
export function getSupabaseSecureStoreAdapter(): SecureStoreAdapter {
  if (cachedAdapter) return cachedAdapter;

  cachedAdapter = shouldUseAsyncStorageForAuth()
    ? createAsyncStorageAdapter()
    : createResilientSecureStoreAdapter();

  return cachedAdapter;
}

/** Clears cached adapter, for tests only. */
export function resetSupabaseSecureStoreAdapterCache(): void {
  cachedAdapter = undefined;
}
