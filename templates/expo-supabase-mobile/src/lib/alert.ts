import { Alert, Platform } from 'react-native';

/**
 * Show a simple message. React Native's `Alert` does nothing on web,
 * so fall back to the browser's built-in alert there.
 */
export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}
