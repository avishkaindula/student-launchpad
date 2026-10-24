import { router } from 'expo-router';
import { useState } from 'react';

import { FormScreen } from '@/components/form-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/context/auth';
import { showAlert } from '@/lib/alert';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email || !password) {
      showAlert('Missing details', 'Enter an email and a password.');
      return;
    }
    if (password.length < 6) {
      showAlert('Password too short', 'Use at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error, needsEmailConfirmation } = await signUp(
      email.trim(),
      password,
      displayName.trim() || undefined
    );
    setLoading(false);

    if (error) {
      showAlert('Sign up failed', error);
    } else if (needsEmailConfirmation) {
      showAlert('Check your email', 'Open the confirmation link we sent you, then sign in here.');
      router.back();
    }
    // Otherwise the user is signed in and the root layout shows the tabs.
  }

  return (
    <FormScreen subtitle="Create an account with your email and a password.">
      <TextField
        label="Name (optional)"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="How should we call you?"
        autoComplete="name"
        textContentType="name"
      />
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
        placeholder="At least 6 characters"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={handleSignUp}
      />
      <Button title="Create account" onPress={handleSignUp} loading={loading} />
    </FormScreen>
  );
}
