import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { Box, Text, theme } from '@/theme';

type PrimaryButtonProps = {
  icon?: LucideIcon;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'neutral';
};

export function PrimaryButton({
  icon: Icon,
  label,
  onPress,
  tone = 'primary',
}: PrimaryButtonProps) {
  const primary = tone === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.neutral,
        pressed && styles.pressed,
      ]}
    >
      <Box flexDirection="row" alignItems="center" gap="s">
        {Icon ? (
          <Icon
            color={primary ? theme.colors.surface : theme.colors.textPrimary}
            size={19}
            strokeWidth={2}
          />
        ) : null}
        <Text style={{ color: primary ? '#FFFFFF' : theme.colors.textPrimary }}>
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: theme.colors.periodAction,
  },
  neutral: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});
