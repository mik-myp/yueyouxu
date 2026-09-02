import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

export function SoftToggle({
  accessibilityLabel,
  onChange,
  value,
}: {
  accessibilityLabel: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={`${accessibilityLabel}，${value ? '已开启' : '已关闭'}`}
      accessibilityRole="button"
      onPress={() => onChange(!value)}
      style={({ pressed }) => [
        styles.toggle,
        value ? styles.toggleOn : styles.toggleOff,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.thumb, value && styles.thumbOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  thumb: {
    backgroundColor: theme.colors.companionSurface,
    borderRadius: 11,
    boxShadow: `0 2px 4px ${theme.colors.companionShadow}`,
    height: 22,
    width: 22,
  },
  thumbOn: {
    alignSelf: 'flex-end',
  },
  toggle: {
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 52,
  },
  toggleOff: {
    backgroundColor: theme.colors.companionCashmereStrong,
    borderColor: theme.colors.companionCashmereStrong,
  },
  toggleOn: {
    backgroundColor: theme.colors.companionBerry,
    borderColor: theme.colors.companionBerry,
  },
});
