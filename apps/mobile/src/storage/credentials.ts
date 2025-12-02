import * as SecureStore from 'expo-secure-store';

export interface StoredCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
  savedAt: string;
}

const STORAGE_KEY = 'replayhub.credentials';

async function isStorageAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch (error) {
    console.warn('SecureStore unavailable', error);
    return false;
  }
}

export async function loadCredentials(): Promise<StoredCredentials | null> {
  if (!(await isStorageAvailable())) {
    return null;
  }

  const value = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredCredentials;
  } catch (error) {
    console.warn('Failed to parse stored credentials', error);
    return null;
  }
}

export async function saveCredentials(data: Omit<StoredCredentials, 'savedAt'>) {
  if (!(await isStorageAvailable())) {
    return;
  }

  const payload: StoredCredentials = {
    ...data,
    savedAt: new Date().toISOString(),
  };

  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(payload));
}

export async function clearCredentials() {
  if (!(await isStorageAvailable())) {
    return;
  }

  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

const QUICK_LOGIN_EMAIL_KEY = 'replayhub.quickLoginEmail';

export async function saveQuickLoginEmail(email: string) {
  if (!(await isStorageAvailable())) {
    return;
  }
  await SecureStore.setItemAsync(QUICK_LOGIN_EMAIL_KEY, email);
}

export async function loadQuickLoginEmail(): Promise<string | null> {
  if (!(await isStorageAvailable())) {
    return null;
  }
  return await SecureStore.getItemAsync(QUICK_LOGIN_EMAIL_KEY);
}

export async function clearQuickLoginEmail() {
  if (!(await isStorageAvailable())) {
    return;
  }
  await SecureStore.deleteItemAsync(QUICK_LOGIN_EMAIL_KEY);
}
