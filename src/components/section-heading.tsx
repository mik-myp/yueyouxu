import { StyleSheet } from 'react-native';

import { Box, Text, theme } from '@/theme';

type SectionHeadingProps = {
  action?: string;
  title: string;
};

export function SectionHeading({ action, title }: SectionHeadingProps) {
  return (
    <Box alignItems="center" flexDirection="row" justifyContent="space-between">
      <Box alignItems="center" flexDirection="row" gap="s">
        <Box style={styles.marker} />
        <Text variant="sectionTitle">{title}</Text>
      </Box>
      {action ? <Text style={styles.action}>{action}</Text> : null}
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
});
