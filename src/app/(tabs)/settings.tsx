import { useRouter } from 'expo-router';
import {
  CaretRight,
  Info,
  ShieldCheck,
  SlidersHorizontal,
  type Icon,
} from '@/components/soft-icons';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Page } from '@/components/page';
import { Box, Text, theme } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <SettingsSection label="预测与周期">
          <SettingRow
            accent={theme.colors.companionBerry}
            description="自动计算 · 当前周期基准 30 天"
            icon={SlidersHorizontal}
            label="预测设置"
            onPress={() => router.push('/cycle-settings')}
          />
        </SettingsSection>

        <SettingsSection label="隐私与数据">
          <SettingRow
            accent={theme.colors.companionSage}
            description="本地优先 · AI 未启用"
            icon={ShieldCheck}
            label="数据管理"
            onPress={() => router.push('/privacy-data')}
          />
        </SettingsSection>

        <SettingsSection label="应用信息">
          <SettingRow
            accent={theme.colors.companionLavender}
            description="版本与应用说明"
            icon={Info}
            label="关于月有序"
            onPress={() => router.push('/about')}
          />
        </SettingsSection>
      </ScrollView>
    </Page>
  );
}

function SettingsSection({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Box marginBottom="xl">
      <Box paddingHorizontal="page">
        <Text marginBottom="s" variant="caption">
          {label}
        </Text>
      </Box>
      <Box style={styles.settingsGroup}>{children}</Box>
    </Box>
  );
}

type SettingRowProps = {
  accent: string;
  description: string;
  icon: Icon;
  label: string;
  onPress: () => void;
};

function SettingRow({
  accent,
  description,
  icon: Icon,
  label,
  onPress,
}: SettingRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
    >
      <Box
        alignItems="center"
        height={40}
        justifyContent="center"
        style={[styles.settingIcon, { backgroundColor: `${accent}14` }]}
        width={40}
      >
        <Icon color={accent} size={21} weight="duotone" />
      </Box>
      <Box flex={1} marginLeft="m">
        <Text variant="body">{label}</Text>
        <Text marginTop="xs" variant="caption">
          {description}
        </Text>
      </Box>
      <CaretRight color={theme.colors.textMuted} size={18} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
    paddingTop: 24,
  },
  pressed: {
    opacity: 0.65,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 80,
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
