import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { FormScreen } from '@/components/form-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/context/auth';
import { showAlert } from '@/lib/alert';

/**
 * Set a new password. Reached two ways:
 * - from the link in a "reset password" email (the link signs the user in first), or
 * - from the Profile tab while signed in.
 */
export default function ResetPasswordScreen() {
  const { session, isLoading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return (
      <FormScreen subtitle="Checking your link...">
        <ActivityIndicator />
      </FormScreen>
    );
  }

  if (!session) {
    return (
      <FormScreen
        title="Link expired"
        subtitle="This reset link is invalid or has expired. Request a new one and open it on this device.">
        <Button title="Request a new link" onPress={() => router.replace('/forgot-password')} />
      </FormScreen>
    );
  }

  async function handleSave() {
    if (password.length < 6) {
      showAlert('Password too short', 'Use at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      showAlert('Passwords do not match', 'Type the same password twice.');
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      showAlert('Could not update password', error);
    } else {
      showAlert('Password updated', 'Use your new password next time you sign in.');
      router.replace('/');
    }
  }

  return (
    <FormScreen subtitle="Choose a new password for your account.">
      <TextField
        label="New password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        label="Confirm new password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Type it again"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={handleSave}
      />
      <Button title="Save password" onPress={handleSave} loading={loading} />
    </FormScreen>
  );
}
