import { Minus, Plus } from '@/components/soft-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Page } from '@/components/page';
import { PrimaryButton } from '@/components/primary-button';
import { SettingsDetailHeader } from '@/components/settings-detail-header';
import { Box, Text, theme } from '@/theme';

export default function CycleSettingsScreen() {
  const router = useRouter();
  const [automatic, setAutomatic] = useState(true);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <SettingsDetailHeader title="预测设置" />

        <Box marginTop="xl">
          <Text marginBottom="s" paddingHorizontal="page" variant="caption">
            计算方式
          </Text>
          <Box style={styles.methodGroup}>
            <Box flex={1}>
              <Text variant="body">自动计算</Text>
              <Text marginTop="xs" variant="caption">
                根据完整经期记录更新个人基准
              </Text>
            </Box>
            <Pressable
              accessibilityLabel={`自动计算预测基准，${automatic ? '已开启' : '已关闭'}`}
              accessibilityRole="button"
              onPress={() => setAutomatic((current) => !current)}
              style={({ pressed }) => [
                styles.toggle,
                automatic ? styles.toggleOn : styles.toggleOff,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[styles.toggleThumb, automatic && styles.toggleThumbOn]}
              />
            </Pressable>
          </Box>
        </Box>

        <Box marginTop="xl">
          <Text marginBottom="s" paddingHorizontal="page" variant="caption">
            当前预测基准
          </Text>
          <Box style={styles.controlGroup}>
            <BasisRow
              label="周期长度"
              source={automatic ? '最近 4 个完整周期' : '使用固定数值'}
              value={automatic ? 30 : cycleLength}
            />
            <BasisRow
              isLast
              label="经期长度"
              source={automatic ? '最近 4 次经期记录' : '使用固定数值'}
              value={automatic ? 5 : periodLength}
            />
          </Box>
        </Box>

        <Box marginTop="xl">
          <Text marginBottom="s" paddingHorizontal="page" variant="caption">
            {automatic ? '初始参考值' : '固定预测值'}
          </Text>
          <Box style={styles.controlGroup}>
            <NumberControl
              label="周期长度"
              max={45}
              min={20}
              onChange={setCycleLength}
              value={cycleLength}
            />
            <NumberControl
              isLast
              label="经期长度"
              max={10}
              min={2}
              onChange={setPeriodLength}
              value={periodLength}
            />
          </Box>
        </Box>

        <Box marginTop="xl" paddingHorizontal="page">
          <Box style={styles.rangeNote}>
            <Text variant="caption">
              {automatic
                ? '完整记录少于 3 个周期时，使用初始参考值进行预测。'
                : '关闭自动计算后，预测始终使用固定数值。'}
            </Text>
          </Box>
        </Box>

        <Box marginTop="xxl" paddingHorizontal="page">
          <PrimaryButton label="保存设置" onPress={() => router.back()} />
        </Box>
      </ScrollView>
    </Page>
  );
}

type NumberControlProps = {
  isLast?: boolean;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
};

function BasisRow({
  isLast,
  label,
  source,
  value,
}: {
  isLast?: boolean;
  label: string;
  source: string;
  value: number;
}) {
  return (
    <Box
      alignItems="center"
      borderBottomColor="companionCashmereStrong"
      borderBottomWidth={isLast ? 0 : StyleSheet.hairlineWidth}
      flexDirection="row"
      minHeight={72}
      paddingHorizontal="page"
    >
      <Box flex={1}>
        <Text variant="body">{label}</Text>
        <Text marginTop="xs" variant="caption">
          {source}
        </Text>
      </Box>
      <Text style={styles.basisValue}>{value} 天</Text>
    </Box>
  );
}

function NumberControl({
  isLast,
  label,
  max,
  min,
  onChange,
  value,
}: NumberControlProps) {
  return (
    <Box
      alignItems="center"
      borderBottomColor="companionCashmereStrong"
      borderBottomWidth={isLast ? 0 : StyleSheet.hairlineWidth}
      flexDirection="row"
      minHeight={88}
      paddingHorizontal="page"
    >
      <Box flex={1}>
        <Text variant="body">{label}</Text>
        <Text marginTop="xs" variant="caption">
          {min}～{max} 天
        </Text>
      </Box>
      <Box alignItems="center" flexDirection="row" gap="m">
        <StepButton
          disabled={value <= min}
          icon={Minus}
          label={`减少${label}`}
          onPress={() => onChange(Math.max(min, value - 1))}
        />
        <Box alignItems="center" minWidth={52}>
          <Text style={styles.valueText}>{value}</Text>
        </Box>
        <StepButton
          disabled={value >= max}
          icon={Plus}
          label={`增加${label}`}
          onPress={() => onChange(Math.min(max, value + 1))}
        />
      </Box>
    </Box>
  );
}

function StepButton({
  disabled,
  icon: Icon,
  label,
  onPress,
}: {
  disabled: boolean;
  icon: typeof Minus;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepButton,
        disabled && styles.stepButtonDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon color={theme.colors.companionInk} size={19} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
    paddingTop: 16,
  },
  basisValue: {
    color: theme.colors.companionInk,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 24,
  },
  controlGroup: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  methodGroup: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 78,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },
  rangeNote: {
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepButton: {
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
  stepButtonDisabled: {
    opacity: 0.35,
  },
  toggle: {
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 52,
  },
  toggleOff: {
    backgroundColor: theme.colors.companionCashmereStrong,
    borderColor: theme.colors.companionCashmereStrong,
  },
  toggleOn: {
    backgroundColor: theme.colors.companionBerry,
    borderColor: theme.colors.companionBerry,
  },
  toggleThumb: {
    backgroundColor: theme.colors.companionSurface,
    borderRadius: 11,
    boxShadow: `0 2px 4px ${theme.colors.companionShadow}`,
    height: 22,
    width: 22,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  valueText: {
    color: theme.colors.companionInk,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 28,
  },
});
