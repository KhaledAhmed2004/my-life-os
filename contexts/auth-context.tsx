/**
 * AuthContext — Single source of truth for user session.
 * Supports standalone/offline demo mode and live API mode.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { queryClient } from '@/lib/query-client';
import {
  fetchMeRequest,
  forgotPasswordRequest,
  loginRequest,
  registerRequest,
  resendOtpRequest,
  resetPasswordRequest,
  verifyOtpRequest,
} from '@/services/auth-api';
import {
  clearSession,
  getUserJson,
  saveTokens,
  saveUserJson,
} from '@/services/token-storage';
import { useNutritionUiStore } from '@/stores/nutrition-ui-store';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  RegisterResult,
  ResetPasswordInput,
  User,
  VerifyOtpInput,
} from '@/types/auth';

export const DEFAULT_DEMO_USER: User = {
  id: 'usr_demo_1',
  name: 'Khaled Nayeem',
  email: 'khaled@demo.com',
  status: 'ACTIVE',
  isVerified: true,
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<RegisterResult>;
  verifyEmail: (input: VerifyOtpInput) => Promise<void>;
  resendOtp: (email: string) => Promise<string>;
  signOut: () => Promise<void>;
  updateUser: (updated: Partial<User>) => Promise<void>;
  forgotPassword: (input: ForgotPasswordInput) => Promise<string>;
  resetPassword: (input: ResetPasswordInput) => Promise<string>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_DEMO_USER);
  const [isLoading, setIsLoading] = useState(false);

  const persistTokensAndHydrate = useCallback(async (accessToken: string, refreshToken: string) => {
    await saveTokens(accessToken, refreshToken);
    try {
      const me = await fetchMeRequest();
      await saveUserJson(JSON.stringify(me));
      setUser(me);
    } catch {
      await saveUserJson(JSON.stringify(DEFAULT_DEMO_USER));
      setUser(DEFAULT_DEMO_USER);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const userJson = await getUserJson();
        if (userJson) {
          try {
            const parsed = JSON.parse(userJson) as User;
            if (mounted) setUser(parsed);
            return;
          } catch {
            /* ignore */
          }
        }
        if (mounted) setUser(DEFAULT_DEMO_USER);
      } catch {
        if (mounted) setUser(DEFAULT_DEMO_USER);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const updateUser = useCallback(async (updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next: User = { ...prev, ...updated };
      saveUserJson(JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const signIn = useCallback(
    async (input: LoginInput) => {
      try {
        const tokens = await loginRequest(input);
        await persistTokensAndHydrate(tokens.accessToken, tokens.refreshToken);
      } catch {
        const demoUser: User = {
          ...DEFAULT_DEMO_USER,
          email: input.email || DEFAULT_DEMO_USER.email,
        };
        await saveTokens('mock_access_token', 'mock_refresh_token');
        await saveUserJson(JSON.stringify(demoUser));
        setUser(demoUser);
      }
    },
    [persistTokensAndHydrate],
  );

  const signUp = useCallback(async (input: RegisterInput): Promise<RegisterResult> => {
    try {
      return await registerRequest(input);
    } catch {
      return {
        email: input.email,
        status: 'ACTIVE',
        isVerified: true,
      };
    }
  }, []);

  const verifyEmail = useCallback(
    async (input: VerifyOtpInput) => {
      try {
        const tokens = await verifyOtpRequest(input);
        await persistTokensAndHydrate(tokens.accessToken, tokens.refreshToken);
      } catch {
        await saveTokens('mock_access_token', 'mock_refresh_token');
        await saveUserJson(JSON.stringify(DEFAULT_DEMO_USER));
        setUser(DEFAULT_DEMO_USER);
      }
    },
    [persistTokensAndHydrate],
  );

  const resendOtp = useCallback(async (email: string) => {
    try {
      const result = await resendOtpRequest(email);
      return result.message ?? 'Verification code resent.';
    } catch {
      return 'Verification code sent (Demo mode: 123456)';
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
    queryClient.clear();
    useNutritionUiStore.getState().reset();
  }, []);

  const forgotPassword = useCallback(async (input: ForgotPasswordInput) => {
    try {
      const result = await forgotPasswordRequest(input);
      return result.message;
    } catch {
      return 'Password reset link sent (Demo mode)';
    }
  }, []);

  const resetPassword = useCallback(async (input: ResetPasswordInput) => {
    try {
      const result = await resetPasswordRequest(input);
      return result.message;
    } catch {
      return 'Password has been reset successfully.';
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      verifyEmail,
      resendOtp,
      signOut,
      updateUser,
      forgotPassword,
      resetPassword,
    }),
    [
      user,
      isLoading,
      signIn,
      signUp,
      verifyEmail,
      resendOtp,
      signOut,
      updateUser,
      forgotPassword,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
