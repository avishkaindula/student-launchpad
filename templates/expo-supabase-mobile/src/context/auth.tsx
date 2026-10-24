import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { showAlert } from '@/lib/alert';
import { supabase } from '@/lib/supabase';

/** Every auth action returns an error message (or null) so screens can show it. */
type AuthResult = { error: string | null };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** True until we know whether the user is signed in. */
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<AuthResult & { needsEmailConfirmation: boolean }>;
  sendMagicLink: (email: string) => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Use this in any screen to get the current user and the auth actions. */
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return value;
}

/**
 * Links in auth emails send the user back into the app. `Linking.createURL` builds the right
 * address for wherever the app is running:
 *   Expo Go            exp://192.168.1.5:8081/--/reset-password
 *   Development build  myapp://reset-password  (the `scheme` in app.json)
 *   Web                http://localhost:8081/reset-password
 * Each of these must be allowed under Authentication > URL Configuration in Supabase.
 */
function redirectUrl(path: '/' | '/reset-password') {
  return Linking.createURL(path);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isHandlingLink, setIsHandlingLink] = useState(false);

  // Load the saved session, then keep it up to date when the user signs in or out.
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setIsLoadingSession(false));

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // On iOS/Android, finish signing in when the app is opened from an email link
  // (sign-up confirmation, magic link or password reset).
  // On web, supabase-js does this by itself (`detectSessionInUrl` in src/lib/supabase.ts).
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleUrl = async (url: string | null) => {
      if (!url) return;
      const params = getUrlParams(url);

      const linkError = params.error_description ?? params.error;
      if (linkError) {
        showAlert('This link did not work', linkError);
        return;
      }

      // Only accept a PKCE `code`. Never sign in with raw tokens from a URL: anyone can
      // send a link, and tokens in it would log the user into the sender's account.
      const { code } = params;
      if (!code) return; // an ordinary deep link, nothing to do

      setIsHandlingLink(true);
      // Fails unless this app requested the email (it stored the matching code verifier).
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      setIsHandlingLink(false);
      if (error) {
        showAlert(
          'Could not sign you in',
          'Open the link on the same device and app where you requested it, or request a new one.'
        );
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isLoading: isLoadingSession || isHandlingLink,

    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },

    async signUp(email, password, displayName) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl('/'),
          // Read by the database trigger that creates the user's profile row.
          data: displayName ? { display_name: displayName } : undefined,
        },
      });
      // When "Confirm email" is on in Supabase, there is no session until the user
      // opens the link in their inbox.
      return { error: error?.message ?? null, needsEmailConfirmation: !error && !data.session };
    },

    async sendMagicLink(email) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl('/') },
      });
      return { error: error?.message ?? null };
    },

    async sendPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl('/reset-password'),
      });
      return { error: error?.message ?? null };
    },

    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error?.message ?? null };
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message ?? null };
    },
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

/**
 * With PKCE, Supabase email links come back with a one-time code, for example
 *   myapp://reset-password?code=...
 * If the link has expired, they carry `error_description` instead (sometimes after the "#").
 */
function getUrlParams(url: string): Record<string, string> {
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash.split('?')[1] ?? '';
  const params: Record<string, string> = {};
  for (const part of [query, hash]) {
    new URLSearchParams(part).forEach((value, key) => {
      params[key] = value;
    });
  }
  return params;
}
