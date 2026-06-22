import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_AUTH_USER_ID_KEY = "@newyouai/lastAuthUserId";

export async function readLastAuthUserId(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(LAST_AUTH_USER_ID_KEY);
    return stored?.trim() || null;
  } catch {
    return null;
  }
}

export async function writeLastAuthUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(LAST_AUTH_USER_ID_KEY, userId);
}

export async function clearLastAuthUserId(): Promise<void> {
  await AsyncStorage.removeItem(LAST_AUTH_USER_ID_KEY);
}
