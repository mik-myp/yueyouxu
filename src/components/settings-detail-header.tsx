import { useRouter } from 'expo-router';
import { CaretLeft } from '@/components/soft-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Box, Text, theme } from '@/theme';

export function SettingsDetailHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <Box alignItems="center" flexDirection="row" paddingHorizontal="page">
      <Pressable
        accessibilityLabel="返回上一页"
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <CaretLeft color={theme.colors.companionInk} size={20} weight="bold" />
      </Pressable>
      <Text marginLeft="m" variant="sectionTitle">
        {title}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: {
    opacity: 0.65,
  },
});
