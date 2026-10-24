import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { showAlert } from '@/lib/alert';
import { supabase } from '@/lib/supabase';

/** Profile tab: shows the user's details from the `profiles` table and lets them sign out. */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const userId = user?.id;
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  // Load this user's row from the `profiles` table (created by a database trigger on sign-up).
  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) showAlert('Could not load profile', error.message);
        setDisplayName(data?.display_name ?? '');
      });
  }, [userId]);

  async function saveDisplayName() {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() || null })
      .eq('id', userId);
    setSaving(false);
    showAlert(error ? 'Could not save' : 'Saved', error?.message);
  }

  async function handleSignOut() {
    const { error } = await signOut();
    // On success the root layout switches back to the sign-in screen.
    if (error) showAlert('Could not sign out', error);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle">Profile</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Signed in as
            </ThemedText>
            <ThemedText>{user?.email}</ThemedText>
          </ThemedView>

          <View style={styles.section}>
            <TextField
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              autoComplete="name"
            />
            <Button title="Save" variant="secondary" onPress={saveDisplayName} loading={saving} />
          </View>

          <View style={styles.section}>
            <Button
              title="Change password"
              variant="secondary"
              onPress={() => router.push('/reset-password')}
            />
            <Button title="Sign out" variant="danger" onPress={handleSignOut} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingTop: TopTabInset,
  },
  content: {
    gap: Spacing.four,
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  card: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
});
