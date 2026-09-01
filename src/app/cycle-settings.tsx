import { useRouter } from 'expo-router';
import { Minus, Plus } from '@/components/soft-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Page } from '@/components/page';
import { SettingsDetailHeader } from '@/components/settings-detail-header';
import { Box, Text, theme } from '@/theme';

export default function CycleSettingsScreen() {
  const router = useRouter();
  const [cycleLength, setCycleLength] = useState(30);
  const [periodLength, setPeriodLength] = useState(5);

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <SettingsDetailHeader title="周期设置" />

        <Box marginTop="xl">
          <Text marginBottom="s" paddingHorizontal="page" variant="caption">
            默认周期
          </Text>
          <Box style={styles.controlGroup}>
            <NumberControl
              label="常见周期长度"
              max={45}
              min={20}
              onChange={setCycleLength}
              value={cycleLength}
            />
            <NumberControl
              isLast
              label="常见经期长度"
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
              预测会优先使用完整记录；样本不足时使用这里的默认值。
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
          <Text variant="caption">天</Text>
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
  controlGroup: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
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
