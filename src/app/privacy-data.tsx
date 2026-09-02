import {
  Database,
  DeviceMobile,
  TrashSimple,
  type Icon,
} from '@/components/soft-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Page } from '@/components/page';
import { SettingsDetailHeader } from '@/components/settings-detail-header';
import { useAppData } from '@/data/app-data-provider';
import { Box, Text, theme } from '@/theme';

export default function PrivacyDataScreen() {
  const router = useRouter();
  const { clearAllData } = useAppData();

  function clearAndRestart() {
    void clearAllData().then(() => router.replace('/onboarding'));
  }

  function confirmClear() {
    const message = '将永久删除当前设备上的周期、每日记录和分析结果。';

    if (Platform.OS === 'web') {
      if (globalThis.confirm(`清除全部数据\n\n${message}`)) clearAndRestart();
      return;
    }

    Alert.alert('清除全部数据', message, [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        style: 'destructive',
        onPress: clearAndRestart,
      },
    ]);
  }

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <SettingsDetailHeader title="隐私与数据" />

        <Box marginTop="xl">
          <Text marginBottom="s" paddingHorizontal="page" variant="caption">
            当前状态
          </Text>
          <Box style={styles.statusGroup}>
            <StatusRow
              accent={theme.colors.companionSage}
              description="记录保存在当前设备"
              icon={DeviceMobile}
              label="本地存储"
              value="已启用"
            />
            <StatusRow
              accent={theme.colors.companionApricot}
              description="尚未连接账户或云端"
              icon={Database}
              isLast
              label="云端同步"
              value="未连接"
            />
          </Box>
        </Box>

        <Box marginTop="xxl" paddingHorizontal="page">
          <Text marginBottom="s" variant="caption">
            数据操作
          </Text>
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
            <Box flex={1} marginLeft="m">
              <Text style={styles.clearTitle}>清除全部数据</Text>
              <Text style={styles.clearDescription}>
                删除当前设备上的周期与每日记录
              </Text>
            </Box>
          </Pressable>
        </Box>
      </ScrollView>
    </Page>
  );
}

type StatusRowProps = {
  accent: string;
  description: string;
  icon: Icon;
  isLast?: boolean;
  label: string;
  value: string;
};

function StatusRow({
  accent,
  description,
  icon: Icon,
  isLast,
  label,
  value,
}: StatusRowProps) {
  return (
    <Box
      alignItems="center"
      borderBottomColor="companionCashmereStrong"
      borderBottomWidth={isLast ? 0 : StyleSheet.hairlineWidth}
      flexDirection="row"
      minHeight={78}
      paddingHorizontal="page"
    >
      <Box
        alignItems="center"
        height={40}
        justifyContent="center"
        style={[styles.statusIcon, { backgroundColor: `${accent}14` }]}
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
      <Text style={styles.statusValue}>{value}</Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionBerryWash,
    borderColor: theme.colors.companionBerrySoft,
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: 16,
  },
  clearTitle: {
    color: theme.colors.periodAction,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  clearDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  content: {
    paddingBottom: 48,
    paddingTop: 16,
  },
  pressed: {
    opacity: 0.65,
  },
  statusGroup: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusIcon: {
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  statusValue: {
    color: theme.colors.companionInk,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    marginLeft: 8,
  },
});
