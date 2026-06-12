type SecureStoreAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

let cachedAdapter: SecureStoreAdapter | undefined;

/** Lazy-load SecureStore so unconfigured dev builds (no auth) skip the native module. */
export function getSupabaseSecureStoreAdapter(): SecureStoreAdapter {
  if (cachedAdapter) return cachedAdapter;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SecureStore = require("expo-secure-store") as typeof import("expo-secure-store");

  cachedAdapter = {
    getItem(key: string) {
      return SecureStore.getItemAsync(key);
    },
    setItem(key: string, value: string) {
      return SecureStore.setItemAsync(key, value);
    },
    removeItem(key: string) {
      return SecureStore.deleteItemAsync(key);
    },
  };

  return cachedAdapter;
}
