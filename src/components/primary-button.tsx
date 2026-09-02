import { Pressable, StyleSheet } from 'react-native';

import type { Icon } from '@/components/soft-icons';
import { Box, Text, theme } from '@/theme';

type PrimaryButtonProps = {
  icon?: Icon;
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
            size={20}
            weight={primary ? 'bold' : 'duotone'}
          />
        ) : null}
        <Text
          style={[
            styles.label,
            { color: primary ? '#FFFFFF' : theme.colors.textPrimary },
          ]}
        >
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 15,
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  primary: {
    backgroundColor: theme.colors.companionBerry,
    borderColor: theme.colors.companionBerry,
    borderWidth: 1,
    boxShadow: `0 5px 12px rgba(146, 36, 75, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
  },
  neutral: {
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderWidth: 1,
    boxShadow: `0 4px 10px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});
