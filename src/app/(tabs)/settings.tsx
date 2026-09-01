import {
  CalendarHeart,
  CaretRight,
  ShieldCheck,
  TrashSimple,
  WaveSine,
  type Icon,
} from '@/components/soft-icons';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import { Page } from '@/components/page';
import { Box, Text, theme } from '@/theme';

export default function SettingsScreen() {
  function confirmClear() {
    Alert.alert('清除全部数据', '此操作将在数据功能接入后删除本地记录。', [
      { text: '取消', style: 'cancel' },
      { text: '清除', style: 'destructive' },
    ]);
  }

  return (
    <Page>
      <Box paddingHorizontal="page" paddingTop="l">
        <Text style={styles.title} variant="title">
          设置
        </Text>
        <Text style={styles.subtitle} variant="caption">
          管理周期默认值与本地数据
        </Text>
      </Box>

      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <Box paddingHorizontal="page">
          <Text marginBottom="s" variant="caption">
            周期与记录
          </Text>
        </Box>
        <Box style={styles.settingsGroup}>
          <SettingRow
            accent={theme.colors.companionBerry}
            icon={CalendarHeart}
            label="常见周期长度"
            value="30 天"
          />
          <SettingRow
            accent={theme.colors.companionLavender}
            icon={WaveSine}
            isLast
            label="常见经期长度"
            value="5 天"
          />
        </Box>

        <Box marginTop="xl" paddingHorizontal="page">
          <Text marginBottom="s" variant="caption">
            隐私与数据
          </Text>
        </Box>
        <Box style={styles.settingsGroup}>
          <SettingRow
            accent={theme.colors.companionSage}
            icon={ShieldCheck}
            isLast
            label="本地数据说明"
            value="仅此设备"
          />
        </Box>

        <Box paddingHorizontal="page">
          <Pressable
            accessibilityRole="button"
            onPress={confirmClear}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.pressed,
            ]}
          >
            <TrashSimple
              color={theme.colors.periodAction}
              size={20}
              weight="duotone"
            />
            <Text style={styles.clearText}>清除全部数据</Text>
          </Pressable>
        </Box>

        <Text marginTop="l" textAlign="center" variant="caption">
          月有序 v0.1
        </Text>
      </ScrollView>
    </Page>
  );
}

type SettingRowProps = {
  accent: string;
  icon: Icon;
  isLast?: boolean;
  label: string;
  value: string;
};

function SettingRow({
  accent,
  icon: Icon,
  isLast,
  label,
  value,
}: SettingRowProps) {
  return (
    <Pressable style={[styles.settingRow, isLast && styles.settingRowLast]}>
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
  clearButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionBerryWash,
    borderColor: theme.colors.companionBerrySoft,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 32,
    minHeight: 52,
  },
  clearText: {
    color: theme.colors.periodAction,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 48,
    paddingTop: 32,
  },
  pressed: {
    opacity: 0.65,
  },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 68,
    paddingHorizontal: 20,
  },
  settingRowLast: {
    borderBottomWidth: 0,
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
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  title: {
    color: theme.colors.companionInk,
  },
});
