import { Pressable, StyleSheet } from 'react-native';

import { CaretRight, type Icon } from '@/components/soft-icons';
import { Box, Text, theme } from '@/theme';

type RecordRowProps = {
  accent: string;
  icon: Icon;
  isLast?: boolean;
  label: string;
  onPress: () => void;
  recorded: boolean;
  value: string;
};

export function RecordRow({
  accent,
  icon: Icon,
  isLast,
  label,
  onPress,
  recorded,
  value,
}: RecordRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Box
        alignItems="center"
        borderBottomColor="companionCashmereStrong"
        borderBottomWidth={isLast ? 0 : StyleSheet.hairlineWidth}
        flexDirection="row"
        flex={1}
        minHeight={72}
      >
        <Box
          alignItems="center"
          borderColor="companionHighlight"
          borderWidth={1}
          height={40}
          justifyContent="center"
          style={[styles.iconWell, { backgroundColor: `${accent}14` }]}
          width={40}
        >
          <Icon color={accent} size={21} weight="duotone" />
        </Box>
        <Text marginLeft="m" variant="body">
          {label}
        </Text>
        <Box flex={1} />
        <Box alignItems="center" flexDirection="row" gap="s" maxWidth="48%">
          <Text
            numberOfLines={1}
            style={[
              styles.value,
              recorded ? { color: accent } : styles.emptyValue,
            ]}
          >
            {value}
          </Text>
          <CaretRight color={theme.colors.textMuted} size={17} weight="bold" />
        </Box>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  iconWell: {
    borderCurve: 'continuous',
    borderRadius: 14,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  pressed: {
    backgroundColor: theme.colors.companionCashmere,
  },
  emptyValue: {
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  value: {
    color: theme.colors.companionInk,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
