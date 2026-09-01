import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { Box, Text, theme } from '@/theme';

type RecordRowProps = {
  accent: string;
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  value: string;
};

export function RecordRow({
  accent,
  icon: Icon,
  label,
  onPress,
  value,
}: RecordRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Box alignItems="center" flexDirection="row" flex={1} gap="m">
        <Box
          alignItems="center"
          borderRadius="m"
          height={36}
          justifyContent="center"
          style={{ backgroundColor: `${accent}18` }}
          width={36}
        >
          <Icon color={accent} size={19} strokeWidth={1.9} />
        </Box>
        <Text variant="body">{label}</Text>
      </Box>
      <Box alignItems="center" flexDirection="row" gap="s" maxWidth="48%">
        <Text numberOfLines={1} variant="label">
          {value}
        </Text>
        <ChevronRight
          color={theme.colors.textMuted}
          size={18}
          strokeWidth={1.8}
        />
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 68,
    paddingHorizontal: 20,
  },
  pressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
});
