import { User } from '../types';

const USER_CACHE_KEY = 'cached_user_data';
const USER_CACHE_VERSION_KEY = 'user_cache_version';

export const getCachedUser = (): User | null => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export const setCachedUser = (user: User) => {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage errors
  }
};

export const invalidateUserCache = () => {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.setItem(USER_CACHE_VERSION_KEY, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
};

export const USER_CACHE_VERSION_KEY_EXPORT = USER_CACHE_VERSION_KEY;
