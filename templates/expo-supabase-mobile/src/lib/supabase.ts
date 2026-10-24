import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from '@/lib/database.types';

// Values come from your .env file (see .env.example). Variables that start with
// EXPO_PUBLIC_ are bundled into the app, so only ever put the publishable/anon key
// here — never the service_role or secret key.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase settings. Copy .env.example to .env, fill in EXPO_PUBLIC_SUPABASE_URL ' +
      'and EXPO_PUBLIC_SUPABASE_KEY, then restart `npx expo start`.'
  );
}

const isWeb = Platform.OS === 'web';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    // Where the signed-in session is saved so users stay logged in between launches.
    // iOS/Android use AsyncStorage; on web supabase-js uses the browser's localStorage.
    storage: isWeb ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // On web, supabase-js reads tokens from the URL after an email link is opened.
    // On iOS/Android the app does this itself (see src/context/auth.tsx).
    detectSessionInUrl: isWeb,
  },
});

// On iOS/Android, only refresh the session token while the app is in the foreground.
if (!isWeb) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
