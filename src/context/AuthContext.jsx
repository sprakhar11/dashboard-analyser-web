import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth.js';
import { getToken, setToken, removeToken } from '../utils/tokenStorage.js';
import { getBrowserId } from '../utils/browserId.js';

const AuthContext = createContext(null);

function isUnauthorized(err) {
  return err && err.status === 401;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authService.getProfile(token)
      .then((profile) => setUser(profile))
      .catch((err) => {
        if (isUnauthorized(err)) {
          removeToken();
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const browserId = getBrowserId();
    const response = await authService.login(email, password, browserId);
    setToken(response.token);
    const profile = await authService.getProfile(response.token);
    setUser(profile);
  }, []);

  const register = useCallback(async (name, email, password) => {
    return authService.register(name, email, password);
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    try {
      await authService.logout(token);
    } catch (err) {
      if (isUnauthorized(err)) {
        removeToken();
        setUser(null);
        return;
      }
      throw err;
    }
    removeToken();
    setUser(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = getToken();
    try {
      const profile = await authService.getProfile(token);
      setUser(profile);
    } catch (err) {
      if (isUnauthorized(err)) {
        removeToken();
        setUser(null);
        return;
      }
      throw err;
    }
  }, []);

  const value = {
    user,
    isAuthenticated: user !== null,
    loading,
    login,
    register,
    logout,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
