import { Calendar, LocaleConfig, type DateData } from 'react-native-calendars';
import { Redirect, useRouter } from 'expo-router';
import { CalendarHeart, Minus, Plus } from '@/components/soft-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Page } from '@/components/page';
import { PrimaryButton } from '@/components/primary-button';
import { SoftToggle } from '@/components/soft-toggle';
import { useAppData } from '@/data/app-data-provider';
import { currentTimeZone, formatLocalDate } from '@/domain/local-date';
import { DEFAULT_PREDICTION_SETTINGS } from '@/domain/models';
import { Box, Text, theme } from '@/theme';

LocaleConfig.locales['zh-CN'] = {
  dayNames: [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  monthNames: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  monthNamesShort: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  today: '今天',
};
LocaleConfig.defaultLocale = 'zh-CN';

export default function OnboardingScreen() {
  const router = useRouter();
  const {
    completeOnboarding,
    error: dataError,
    loading,
    settings,
  } = useAppData();
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const [step, setStep] = useState<1 | 2>(1);
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState(today);
  const [automaticCalculation, setAutomaticCalculation] = useState(true);
  const [referenceCycleLength, setReferenceCycleLength] = useState(
    DEFAULT_PREDICTION_SETTINGS.referenceCycleLength,
  );
  const [referencePeriodLength, setReferencePeriodLength] = useState(
    DEFAULT_PREDICTION_SETTINGS.referencePeriodLength,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!loading && settings?.onboardingCompleted) {
    return <Redirect href="/" />;
  }

  async function finish() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await completeOnboarding({
        automaticCalculation,
        lastPeriodStartDate,
        referenceCycleLength,
        referencePeriodLength,
        timeZone: currentTimeZone(),
      });
      router.replace('/');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '初始化保存失败');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Page>
        <Box alignItems="center" flex={1} justifyContent="center">
          <Text variant="caption">正在准备本地数据…</Text>
        </Box>
      </Page>
    );
  }

  if (dataError) {
    return (
      <Page>
        <Box
          alignItems="center"
          flex={1}
          justifyContent="center"
          padding="page"
        >
          <Text textAlign="center">{dataError}</Text>
        </Box>
      </Page>
    );
  }

  return (
    <Page>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        tabIndex={0}
      >
        <Box alignItems="center" flexDirection="row" paddingHorizontal="page">
          <Box
            alignItems="center"
            height={42}
            justifyContent="center"
            style={styles.brandIcon}
            width={42}
          >
            <CalendarHeart
              color={theme.colors.companionBerry}
              size={23}
              weight="duotone"
            />
          </Box>
          <Box flex={1} marginLeft="m">
            <Text style={styles.brand}>月有序</Text>
            <Text variant="caption">第 {step} 步，共 2 步</Text>
          </Box>
          <Box flexDirection="row" gap="xs">
            <Box
              backgroundColor="companionBerry"
              borderRadius="s"
              height={6}
              width={28}
            />
            <Box
              backgroundColor={
                step === 2 ? 'companionBerry' : 'companionCashmereStrong'
              }
              borderRadius="s"
              height={6}
              width={28}
            />
          </Box>
        </Box>

        {step === 1 ? (
          <>
            <Box marginTop="xl" paddingHorizontal="page">
              <Text style={styles.heading}>最近一次经期从哪天开始？</Text>
              <Text marginTop="s" variant="caption">
                这是唯一必填信息，用于建立第一条周期记录。
              </Text>
            </Box>

            <Box marginTop="l" paddingHorizontal="s">
              <Calendar
                current={lastPeriodStartDate}
                enableSwipeMonths
                firstDay={0}
                markedDates={{
                  [lastPeriodStartDate]: {
                    selected: true,
                    selectedColor: theme.colors.companionBerry,
                  },
                }}
                maxDate={today}
                monthFormat="yyyy年M月"
                onDayPress={(date: DateData) =>
                  setLastPeriodStartDate(
                    formatLocalDate(new Date(`${date.dateString}T12:00:00`)),
                  )
                }
                style={styles.calendar}
                theme={{
                  arrowColor: theme.colors.companionBerry,
                  calendarBackground: theme.colors.companionCanvas,
                  selectedDayTextColor: theme.colors.companionSurface,
                  textDayFontSize: 15,
                  textDayHeaderFontSize: 12,
                  textDisabledColor: theme.colors.textMuted,
                  textMonthFontSize: 18,
                  textMonthFontWeight: '700',
                  textSectionTitleColor: theme.colors.textMuted,
                  todayTextColor: theme.colors.companionBerry,
                }}
              />
            </Box>

            <Box marginTop="l" paddingHorizontal="page">
              <Box style={styles.selectionSummary}>
                <Text variant="caption">已选择</Text>
                <Text style={styles.selectedDate}>
                  {formatChineseDate(lastPeriodStartDate)}
                </Text>
              </Box>
            </Box>

            <Box marginTop="l" paddingHorizontal="page">
              <PrimaryButton label="下一步" onPress={() => setStep(2)} />
            </Box>
          </>
        ) : (
          <>
            <Box marginTop="xl" paddingHorizontal="page">
              <Text style={styles.heading}>设置初始参考值</Text>
              <Text marginTop="s" variant="caption">
                不确定时保持默认即可，完整记录积累后会自动更新。
              </Text>
            </Box>

            <Box marginTop="l" style={styles.settingsGroup}>
              <Box
                alignItems="center"
                flexDirection="row"
                minHeight={76}
                paddingHorizontal="page"
              >
                <Box flex={1}>
                  <Text variant="body">自动计算</Text>
                  <Text marginTop="xs" variant="caption">
                    根据完整周期更新个人基准
                  </Text>
                </Box>
                <SoftToggle
                  accessibilityLabel="自动计算预测基准"
                  onChange={setAutomaticCalculation}
                  value={automaticCalculation}
                />
              </Box>
              <ReferenceControl
                label="初始周期长度"
                max={45}
                min={20}
                onChange={setReferenceCycleLength}
                value={referenceCycleLength}
              />
              <ReferenceControl
                isLast
                label="初始经期长度"
                max={10}
                min={2}
                onChange={setReferencePeriodLength}
                value={referencePeriodLength}
              />
            </Box>

            {submitError ? (
              <Text
                marginTop="m"
                paddingHorizontal="page"
                style={styles.errorText}
              >
                {submitError}
              </Text>
            ) : null}

            <Box gap="m" marginTop="xl" paddingHorizontal="page">
              <PrimaryButton
                label={submitting ? '正在保存…' : '开始记录'}
                onPress={() => void finish()}
              />
              <PrimaryButton
                label="返回选择日期"
                onPress={() => setStep(1)}
                tone="neutral"
              />
            </Box>
          </>
        )}
      </ScrollView>
    </Page>
  );
}

function formatChineseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return `${year}年${month}月${day}日`;
}

function ReferenceControl({
  isLast,
  label,
  max,
  min,
  onChange,
  value,
}: {
  isLast?: boolean;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <Box
      alignItems="center"
      borderBottomColor="companionCashmereStrong"
      borderBottomWidth={isLast ? 0 : StyleSheet.hairlineWidth}
      borderTopColor="companionCashmereStrong"
      borderTopWidth={StyleSheet.hairlineWidth}
      flexDirection="row"
      minHeight={76}
      paddingHorizontal="page"
    >
      <Box flex={1}>
        <Text variant="body">{label}</Text>
        <Text marginTop="xs" variant="caption">
          可稍后修改
        </Text>
      </Box>
      <Box alignItems="center" flexDirection="row" gap="m">
        <SmallStepButton
          disabled={value <= min}
          icon={Minus}
          label={`减少${label}`}
          onPress={() => onChange(Math.max(min, value - 1))}
        />
        <Text style={styles.referenceValue}>{value} 天</Text>
        <SmallStepButton
          disabled={value >= max}
          icon={Plus}
          label={`增加${label}`}
          onPress={() => onChange(Math.min(max, value + 1))}
        />
      </Box>
    </Box>
  );
}

function SmallStepButton({
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
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon color={theme.colors.companionInk} size={18} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: theme.colors.companionInk,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  brandIcon: {
    backgroundColor: theme.colors.companionBerryWash,
    borderColor: theme.colors.companionBerrySoft,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
  },
  calendar: {
    backgroundColor: theme.colors.companionCanvas,
  },
  content: {
    paddingBottom: 48,
    paddingTop: 16,
  },
  disabled: {
    opacity: 0.35,
  },
  errorText: {
    color: theme.colors.periodAction,
    fontSize: 13,
    lineHeight: 20,
  },
  heading: {
    color: theme.colors.companionInk,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  pressed: {
    opacity: 0.65,
  },
  referenceValue: {
    color: theme.colors.companionInk,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 24,
    minWidth: 52,
    textAlign: 'center',
  },
  selectedDate: {
    color: theme.colors.companionInk,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 24,
  },
  selectionSummary: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  settingsGroup: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
