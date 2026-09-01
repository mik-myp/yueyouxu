import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import { IconButton } from '@/components/icon-button';
import { Page } from '@/components/page';
import { Box, Text, theme } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();

  function confirmClear() {
    Alert.alert('清除全部数据', '此操作将在数据功能接入后删除本地记录。', [
      { text: '取消', style: 'cancel' },
      { text: '清除', style: 'destructive' },
    ]);
  }

  return (
    <Page>
      <Box
        alignItems="center"
        flexDirection="row"
        minHeight={56}
        paddingHorizontal="s"
      >
        <IconButton
          accessibilityLabel="返回"
          icon={ChevronLeft}
          onPress={() => router.back()}
        />
        <Text variant="title">设置</Text>
      </Box>

      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <Text marginBottom="s" variant="caption">
          周期默认值
        </Text>
        <Box
          backgroundColor="surface"
          borderColor="border"
          borderRadius="m"
          borderWidth={1}
        >
          <SettingRow label="常见周期长度" value="30 天" />
          <SettingRow isLast label="常见经期长度" value="5 天" />
        </Box>

        <Text marginBottom="s" marginTop="xl" variant="caption">
          隐私
        </Text>
        <Box
          backgroundColor="surface"
          borderColor="border"
          borderRadius="m"
          borderWidth={1}
        >
          <SettingRow
            icon={ShieldCheck}
            isLast
            label="本地数据说明"
            value="仅此设备"
          />
        </Box>

        <Pressable
          accessibilityRole="button"
          onPress={confirmClear}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.pressed,
          ]}
        >
          <Trash2
            color={theme.colors.periodAction}
            size={19}
            strokeWidth={1.9}
          />
          <Text style={styles.clearText}>清除全部数据</Text>
        </Pressable>

        <Text marginTop="l" textAlign="center" variant="caption">
          Yueyouxu v0.1 UI Prototype
        </Text>
      </ScrollView>
    </Page>
  );
}

type SettingRowProps = {
  icon?: typeof ShieldCheck;
  isLast?: boolean;
  label: string;
  value: string;
};

function SettingRow({ icon: Icon, isLast, label, value }: SettingRowProps) {
  return (
    <Pressable style={[styles.settingRow, isLast && styles.settingRowLast]}>
      {Icon ? (
        <Icon color={theme.colors.positive} size={19} strokeWidth={1.9} />
      ) : null}
      <Text marginLeft={Icon ? 'm' : 'none'} variant="body">
        {label}
      </Text>
      <Box flex={1} />
      <Text variant="label">{value}</Text>
      <ChevronRight color={theme.colors.textMuted} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    alignItems: 'center',
    borderColor: theme.colors.periodPredicted,
    borderRadius: 8,
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
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.65,
  },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 62,
    paddingHorizontal: 16,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
});
