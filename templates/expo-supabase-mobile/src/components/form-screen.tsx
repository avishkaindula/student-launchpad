import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type FormScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
}>;

/**
 * Page wrapper for the auth screens: centers the form, scrolls on small phones,
 * and moves out of the way of the keyboard.
 */
export function FormScreen({ title, subtitle, children }: FormScreenProps) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
              {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
              {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  form: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: Spacing.three,
  },
});
