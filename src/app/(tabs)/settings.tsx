import { useRouter } from 'expo-router';
import { CaretRight, Info, type Icon } from '@/components/soft-icons';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Page } from '@/components/page';
import { Box, Text, theme } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <Box paddingHorizontal="page">
          <Text marginBottom="s" variant="caption">
            应用信息
          </Text>
        </Box>
        <Box style={styles.settingsGroup}>
          <SettingRow
            accent={theme.colors.companionBerry}
            icon={Info}
            label="关于月有序"
            onPress={() => router.push('/about')}
            value="v0.1.0"
          />
        </Box>

        <Text marginTop="xl" textAlign="center" variant="caption">
          月有序 · v0.1.0
        </Text>
      </ScrollView>
    </Page>
  );
}

type SettingRowProps = {
  accent: string;
  icon: Icon;
  label: string;
  onPress: () => void;
  value: string;
};

function SettingRow({
  accent,
  icon: Icon,
  label,
  onPress,
  value,
}: SettingRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
    >
      <Box
        alignItems="center"
        height={38}
        justifyContent="center"
        style={[styles.settingIcon, { backgroundColor: `${accent}14` }]}
        width={38}
      >
        <Icon color={accent} size={20} weight="duotone" />
      </Box>
      <Text marginLeft="m" variant="body">
        {label}
      </Text>
      <Box flex={1} />
      <Text variant="label">{value}</Text>
      <CaretRight color={theme.colors.textMuted} size={17} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
    paddingTop: 24,
  },
  pressed: {
    opacity: 0.65,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 68,
    paddingHorizontal: 20,
  },
  settingIcon: {
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  settingsGroup: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
