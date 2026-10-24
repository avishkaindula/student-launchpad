import { router } from 'expo-router';
import { useState } from 'react';

import { FormScreen } from '@/components/form-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/context/auth';
import { showAlert } from '@/lib/alert';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!email) {
      showAlert('Missing email', 'Enter the email you signed up with.');
      return;
    }
    setLoading(true);
    const { error } = await sendPasswordReset(email.trim());
    setLoading(false);

    if (error) {
      showAlert('Could not send email', error);
    } else {
      showAlert(
        'Check your email',
        'Open the reset link on this device. It will bring you back here to choose a new password.'
      );
      router.back();
    }
  }

  return (
    <FormScreen subtitle="We will email you a link to choose a new password.">
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        onSubmitEditing={handleSend}
      />
      <Button title="Send reset link" onPress={handleSend} loading={loading} />
    </FormScreen>
  );
}
