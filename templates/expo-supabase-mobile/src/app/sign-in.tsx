import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FormScreen } from '@/components/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { showAlert } from '@/lib/alert';

export default function SignInScreen() {
  const { signIn, sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'password' | 'magic-link' | null>(null);

  async function handleSignIn() {
    if (!email || !password) {
      showAlert('Missing details', 'Enter your email and password.');
      return;
    }
    setLoading('password');
    const { error } = await signIn(email.trim(), password);
    setLoading(null);
    // On success there is nothing to do: the root layout sees the new session
    // and switches to the signed-in tabs automatically.
    if (error) showAlert('Sign in failed', error);
  }

  async function handleMagicLink() {
    if (!email) {
      showAlert('Missing email', 'Enter your email first.');
      return;
    }
    setLoading('magic-link');
    const { error } = await sendMagicLink(email.trim());
    setLoading(null);
    if (error) {
      showAlert('Could not send link', error);
    } else {
      showAlert('Check your email', 'Open the link on this device to sign in.');
    }
  }

  return (
    <FormScreen title="Welcome back" subtitle="Sign in to continue.">
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleSignIn}
      />

      <Button title="Sign in" onPress={handleSignIn} loading={loading === 'password'} />
      <Button
        title="Email me a sign-in link"
        variant="secondary"
        onPress={handleMagicLink}
        loading={loading === 'magic-link'}
      />

      <View style={styles.links}>
        <Link href="/forgot-password">
          <ThemedText type="linkPrimary">Forgot password?</ThemedText>
        </Link>
        <Link href="/sign-up">
          <ThemedText type="linkPrimary">Create an account</ThemedText>
        </Link>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
});
