import { useRouter } from 'expo-router';
import {
  ArrowRight,
  CalendarPlus,
  Drop,
  Heart,
  Heartbeat,
  Sparkle,
  type Icon,
} from '@/components/soft-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { CycleArc } from '@/components/cycle-arc';
import { Page } from '@/components/page';
import { PrimaryButton } from '@/components/primary-button';
import { SectionHeading } from '@/components/section-heading';
import { useAppData } from '@/data/app-data-provider';
import {
  currentTimeZone,
  differenceInLocalDays,
  formatLocalDate,
} from '@/domain/local-date';
import { Box, Text, theme } from '@/theme';

export default function TodayScreen() {
  const today = formatLocalDate(new Date());
  const router = useRouter();
  const {
    dailyRecords,
    periods,
    prediction,
    recordPeriod,
    settings,
    undoPeriod,
  } = useAppData();
  const todayRecord = dailyRecords.find(
    (record) => record.recordDate === today,
  );
  const activePeriod = periods
    .filter((period) => period.startDate <= today)
    .sort((left, right) => right.startDate.localeCompare(left.startDate))[0];
  const periodActive = Boolean(activePeriod && activePeriod.endDate === null);
  const [lastAction, setLastAction] = useState<{
    id: string;
    wasStart: boolean;
  } | null>(null);
  const cycleDay = activePeriod
    ? differenceInLocalDays(activePeriod.startDate, today) + 1
    : 1;
  const cycleLength =
    activePeriod && prediction
      ? differenceInLocalDays(activePeriod.startDate, prediction.centerDate)
      : (settings?.referenceCycleLength ?? 28);
  const predictionLabel = prediction
    ? `${formatShortDate(prediction.earliestDate)}～${formatShortDate(prediction.latestDate)}`
    : undefined;
  const [toastVisible, setToastVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  async function togglePeriod() {
    const wasActive = periodActive;
    try {
      const period = await recordPeriod({
        action: wasActive ? 'end' : 'start',
        startDate: today,
        timeZone: currentTimeZone(),
      });
      setLastAction({ id: period.id, wasStart: !wasActive });
      setToastVisible(true);
    } catch {
      setToastVisible(false);
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToastVisible(false), 3000);
  }

  async function undoPeriodAction() {
    if (!lastAction) return;
    await undoPeriod(lastAction.id, lastAction.wasStart);
    setToastVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  return (
    <Page>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        tabIndex={0}
      >
        <Box paddingHorizontal="page" paddingTop="m">
          <Text style={styles.dateLine}>{formatFullDate(today)}</Text>
        </Box>

        <Box marginTop="s" paddingHorizontal="s">
          <CycleArc
            cycleDay={cycleDay}
            cycleLength={cycleLength}
            periodActive={periodActive}
            periodLength={
              prediction?.periodLength ?? settings?.referencePeriodLength ?? 5
            }
            predictionLabel={predictionLabel}
          />
        </Box>

        <Box gap="m" marginTop="l" paddingHorizontal="page">
          <PrimaryButton
            icon={periodActive ? Heart : CalendarPlus}
            label={periodActive ? '月经走了' : '月经来了'}
            onPress={() => void togglePeriod()}
          />
          {periodActive ? (
            <PrimaryButton
              icon={Drop}
              label="记录今天"
              onPress={() => router.push('/record')}
              tone="neutral"
            />
          ) : null}
        </Box>

        <Box marginTop="xxl" gap="m">
          <Box paddingHorizontal="page">
            <SectionHeading
              action={`已记录 ${countRecordFields(todayRecord)} 项`}
              title="今天的记录"
            />
          </Box>
          <Box
            backgroundColor="companionSurface"
            borderBottomColor="companionCashmereStrong"
            borderBottomWidth={StyleSheet.hairlineWidth}
            borderTopColor="companionCashmereStrong"
            borderTopWidth={StyleSheet.hairlineWidth}
          >
            <SummaryRow
              accent={theme.colors.companionBerry}
              icon={Drop}
              label="流量"
              value={todayRecord?.flow ?? '未记录'}
            />
            <SummaryRow
              accent={theme.colors.companionApricot}
              icon={Heartbeat}
              label="痛感"
              value={todayRecord?.pain ?? '未记录'}
            />
            <SummaryRow
              accent={theme.colors.companionLavender}
              icon={Sparkle}
              label="症状"
              value={todayRecord?.symptoms.join('、') || '未记录'}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/record')}
              style={({ pressed }) => [
                styles.allRecords,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.allRecordsText}>查看和修改记录</Text>
              <ArrowRight
                color={theme.colors.companionBerry}
                size={18}
                weight="bold"
              />
            </Pressable>
          </Box>
        </Box>
      </ScrollView>

      {toastVisible ? (
        <Box bottom={18} left={20} position="absolute" right={20}>
          <Box
            alignItems="center"
            backgroundColor="companionInk"
            flexDirection="row"
            justifyContent="space-between"
            paddingHorizontal="m"
            paddingVertical="s"
            style={styles.toast}
          >
            <Text style={styles.toastText}>
              {periodActive ? '已标记月经开始' : '已标记月经走了'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void undoPeriodAction()}
              style={styles.undoButton}
            >
              <Text style={styles.undoText}>撤销</Text>
            </Pressable>
          </Box>
        </Box>
      ) : null}
    </Page>
  );
}

function countRecordFields(
  record:
    | {
        flow: string | null;
        pain: string | null;
        symptoms: string[];
      }
    | undefined,
) {
  if (!record) return 0;
  return [
    record.flow,
    record.pain,
    record.symptoms.length ? record.symptoms : null,
  ].filter(Boolean).length;
}

function formatShortDate(value: string) {
  const [, month, day] = value.split('-').map(Number);
  return `${month}月${day}日`;
}

function formatFullDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  const weekday = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ][new Date(`${value}T12:00:00`).getDay()];
  return `${year}年${month}月${day}日 · ${weekday}`;
}

type SummaryRowProps = {
  accent: string;
  icon: Icon;
  label: string;
  value: string;
};

function SummaryRow({ accent, icon: Icon, label, value }: SummaryRowProps) {
  return (
    <Box
      alignItems="center"
      borderBottomColor="companionCashmereStrong"
      borderBottomWidth={StyleSheet.hairlineWidth}
      flexDirection="row"
      minHeight={68}
      paddingHorizontal="page"
    >
      <Box
        alignItems="center"
        height={38}
        justifyContent="center"
        style={[styles.summaryIcon, { backgroundColor: `${accent}14` }]}
        width={38}
      >
        <Icon color={accent} size={20} weight="duotone" />
      </Box>
      <Text marginLeft="m" variant="label">
        {label}
      </Text>
      <Box flex={1} />
      <Text variant="body">{value}</Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  allRecords: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: 20,
  },
  allRecordsText: {
    color: theme.colors.companionBerry,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  content: {
    paddingBottom: 44,
  },
  dateLine: {
    color: theme.colors.companionInk,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    lineHeight: 26,
  },
  pressed: {
    opacity: 0.6,
  },
  toastText: {
    color: theme.colors.companionSurface,
    fontSize: 14,
  },
  summaryIcon: {
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  toast: {
    borderCurve: 'continuous',
    borderRadius: 14,
    boxShadow: `0 6px 18px rgba(58, 46, 52, 0.2)`,
  },
  undoButton: {
    minHeight: 40,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  undoText: {
    color: theme.colors.companionBerrySoft,
    fontWeight: '600',
  },
});
