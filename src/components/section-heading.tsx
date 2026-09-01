import { Box, Text } from '@/theme';

type SectionHeadingProps = {
  action?: string;
  title: string;
};

export function SectionHeading({ action, title }: SectionHeadingProps) {
  return (
    <Box alignItems="center" flexDirection="row" justifyContent="space-between">
      <Text variant="sectionTitle">{title}</Text>
      {action ? <Text variant="caption">{action}</Text> : null}
    </Box>
  );
}
