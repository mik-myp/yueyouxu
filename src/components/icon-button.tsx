import { Pressable, StyleSheet } from 'react-native';

import type { Icon } from '@/components/soft-icons';
import { theme } from '@/theme';

type IconButtonProps = {
  accessibilityLabel: string;
  icon: Icon;
  onPress: () => void;
};

export function IconButton({
  accessibilityLabel,
  icon: Icon,
  onPress,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon color={theme.colors.companionInk} size={21} weight="duotone" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
});
