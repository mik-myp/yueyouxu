import { Minus, Plus } from '@/components/soft-icons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Page } from '@/components/page';
import { PrimaryButton } from '@/components/primary-button';
import { SettingsDetailHeader } from '@/components/settings-detail-header';
import { SoftToggle } from '@/components/soft-toggle';
import { useAppData } from '@/data/app-data-provider';
import type { CycleHistoryAnalysis } from '@/domain/cycle-analysis';
import type { AppSettings, PredictionSettings } from '@/domain/models';
import { Box, Text, theme } from '@/theme';

export default function CycleSettingsScreen() {
  const router = useRouter();
  const { analysis, error, loading, savePredictionSettings, settings } =
    useAppData();

  if (loading) {
    return (
      <Page>
        <Box alignItems="center" flex={1} justifyContent="center">
          <Text variant="caption">正在读取周期设置…</Text>
        </Box>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Box
          alignItems="center"
          flex={1}
          justifyContent="center"
          padding="page"
        >
          <Text textAlign="center">{error}</Text>
        </Box>
      </Page>
    );
  }

  if (!settings) return <Redirect href="/onboarding" />;

  return (
    <CycleSettingsForm
      initialSettings={settings}
      cycleAnalysis={analysis?.cycle}
      onSave={savePredictionSettings}
      onSaved={() => router.back()}
    />
  );
}

function CycleSettingsForm({
  cycleAnalysis,
  initialSettings,
  onSave,
  onSaved,
}: {
  cycleAnalysis?: CycleHistoryAnalysis;
  initialSettings: AppSettings;
  onSave: (settings: PredictionSettings) => Promise<void>;
  onSaved: () => void;
}) {
  const [automatic, setAutomatic] = useState(
    initialSettings.automaticCalculation,
  );
  const [cycleLength, setCycleLength] = useState(
    initialSettings.referenceCycleLength,
  );
  const [periodLength, setPeriodLength] = useState(
    initialSettings.referencePeriodLength,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const calculatedCycleLength =
    automatic && cycleAnalysis?.typicalCycleLength
      ? cycleAnalysis.typicalCycleLength
      : cycleLength;
  const calculatedPeriodLength =
    automatic && cycleAnalysis?.typicalPeriodLength
      ? cycleAnalysis.typicalPeriodLength
      : periodLength;
  const cycleBasisSource = automatic
    ? cycleAnalysis?.typicalCycleLength
      ? `最近 ${cycleAnalysis.cycleSamples.length} 个有效间隔的中位数`
      : '需要至少两个经期开始日'
    : '使用固定数值';
  const periodBasisSource = automatic
    ? cycleAnalysis?.typicalPeriodLength
      ? `最近 ${cycleAnalysis.periodLengths.length} 条完整经期记录的中位数`
      : '需要已记录经期结束日'
    : '使用固定数值';

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      await onSave({
        automaticCalculation: automatic,
        referenceCycleLength: cycleLength,
        referencePeriodLength: periodLength,
      });
      onSaved();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '设置保存失败');
    } finally {
      setSaving(false);
    }
  }

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
            <SoftToggle
              accessibilityLabel="自动计算预测基准"
              onChange={setAutomatic}
              value={automatic}
            />
          </Box>
        </Box>

        <Box marginTop="xl">
          <Text marginBottom="s" paddingHorizontal="page" variant="caption">
            当前预测基准
          </Text>
          <Box style={styles.controlGroup}>
            <BasisRow
              label="周期长度"
              source={cycleBasisSource}
              value={calculatedCycleLength}
            />
            <BasisRow
              isLast
              label="经期长度"
              source={periodBasisSource}
              value={calculatedPeriodLength}
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
                ? '至少记录两个经期开始日后，周期基准会根据有效间隔自动计算；经期长度需要已记录结束日。'
                : '关闭自动计算后，预测始终使用固定数值。'}
            </Text>
          </Box>
        </Box>

        <Box marginTop="xxl" paddingHorizontal="page">
          {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
          <Box marginTop={saveError ? 'm' : 'none'}>
            <PrimaryButton
              label={saving ? '正在保存…' : '保存设置'}
              onPress={() => void save()}
            />
          </Box>
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
  errorText: {
    color: theme.colors.periodAction,
    fontSize: 13,
    lineHeight: 20,
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
  valueText: {
    color: theme.colors.companionInk,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 28,
  },
});
