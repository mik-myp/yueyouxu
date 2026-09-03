import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Box, Text, theme } from '@/theme';

type SectionHeadingProps = {
  action?: ReactNode;
  onActionPress?: () => void;
  title: string;
  extra?: ReactNode;
};

export function SectionHeading({
  action,
  onActionPress,
  title,
  extra,
}: SectionHeadingProps) {
  return (
    <Box alignItems="center" flexDirection="row" justifyContent="space-between">
      <Box alignItems="center" flexDirection="row" gap="s">
        <Box style={styles.marker} />
        <Text variant="sectionTitle">{title}</Text>
      </Box>
      <Box alignItems="center" flexDirection="row" gap="m">
        {extra}
        {action ? (
          onActionPress ? (
            <Pressable
              accessibilityRole="button"
              onPress={onActionPress}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={styles.action}>{action}</Text>
            </Pressable>
          ) : (
            <Text style={styles.action}>{action}</Text>
          )
        ) : null}
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  action: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  marker: {
    backgroundColor: theme.colors.companionBerry,
    borderRadius: 2,
    height: 16,
    width: 3,
  },
  pressed: {
    opacity: 0.65,
  },
});
