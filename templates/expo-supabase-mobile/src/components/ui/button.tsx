import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  /** primary = filled, secondary = grey, danger = red text, link = text only */
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? theme.tint
      : variant === 'secondary' || variant === 'danger'
        ? theme.backgroundElement
        : 'transparent';
  const textColor =
    variant === 'primary' ? theme.onTint : variant === 'danger' ? theme.danger : theme.tint;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'link' && styles.link,
        { backgroundColor },
        (pressed || isDisabled) && styles.dimmed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    minHeight: 40,
  },
  text: {
    fontSize: 16,
    fontWeight: 600,
  },
  dimmed: {
    opacity: 0.6,
  },
});
