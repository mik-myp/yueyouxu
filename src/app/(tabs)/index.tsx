import {
  CaretRight,
  CalendarPlus,
  Drop,
  Heart,
  Heartbeat,
  Sparkle,
  type Icon,
} from '@/components/soft-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { CycleArc } from '@/components/cycle-arc';
import { Page } from '@/components/page';
import { PrimaryButton } from '@/components/primary-button';
import { RecordDetailSheet } from '@/components/record-detail-sheet';
import { SectionHeading } from '@/components/section-heading';
import { useAppData } from '@/data/app-data-provider';
import {
  currentTimeZone,
  differenceInLocalDays,
  formatLocalDate,
} from '@/domain/local-date';
import type { DailyRecordDraft, RecordKind } from '@/features/prototype/types';
import { Box, Text, theme } from '@/theme';

export default function TodayScreen() {
  const today = formatLocalDate(new Date());
  const sheetRef = useRef<BottomSheetModal>(null);
  const [activeKind, setActiveKind] = useState<RecordKind | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const {
    dailyRecords,
    periods,
    prediction,
    recordPeriod,
    saveDailyRecord,
    settings,
    undoPeriod,
  } = useAppData();
  const todayRecord = dailyRecords.find(
    (record) => record.recordDate === today,
  );
  const [draft, setDraft] = useState<DailyRecordDraft>(() =>
    todayRecord ? toDraft(todayRecord) : emptyDraft(),
  );
  const activePeriod = periods
    .filter((period) => period.startDate <= today)
    .sort((left, right) => right.startDate.localeCompare(left.startDate))[0];
  const periodActive = Boolean(activePeriod && activePeriod.endDate === null);
  const periodToReopen = activePeriod?.endDate === today ? activePeriod : null;
  const actualPeriodLength = activePeriod?.endDate
    ? differenceInLocalDays(activePeriod.startDate, activePeriod.endDate) + 1
    : null;
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
  const daysUntilPrediction = prediction
    ? differenceInLocalDays(today, prediction.centerDate)
    : undefined;
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  async function togglePeriod() {
    const wasActive = periodActive;
    const deletesSameDay = Boolean(
      wasActive && activePeriod?.startDate === today,
    );
    const reopensToday = Boolean(!wasActive && periodToReopen);
    try {
      const period = await recordPeriod({
        action: wasActive || reopensToday ? 'end' : 'start',
        periodId: reopensToday ? periodToReopen?.id : undefined,
        startDate: today,
        timeZone: currentTimeZone(),
      });
      setLastAction(
        deletesSameDay || reopensToday
          ? null
          : { id: period.id, wasStart: !wasActive },
      );
      setToastMessage(
        deletesSameDay
          ? '已取消本次经期'
          : reopensToday
            ? '已重新标记月经开始'
            : wasActive
              ? '已标记月经走了'
              : '已标记月经开始',
      );
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

  function openRecord(kind: RecordKind) {
    setRecordError(null);
    setDraft(todayRecord ? toDraft(todayRecord) : emptyDraft());
    setActiveKind(kind);
    requestAnimationFrame(() => sheetRef.current?.present());
  }

  function saveDraft(nextDraft: DailyRecordDraft) {
    setDraft(nextDraft);
    void saveDailyRecord({
      record: {
        flow: nextDraft.flow || null,
        pain: nextDraft.pain || null,
        symptoms: nextDraft.symptoms,
        timeZone: currentTimeZone(),
      },
      recordDate: today,
    }).catch((error) => {
      setRecordError(
        error instanceof Error ? error.message : '每日记录保存失败',
      );
    });
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
              actualPeriodLength ??
              prediction?.periodLength ??
              settings?.referencePeriodLength ??
              5
            }
            daysUntilPrediction={daysUntilPrediction}
            predictionLabel={predictionLabel}
          />
        </Box>

        <Box gap="m" marginTop="l" paddingHorizontal="page">
          <PrimaryButton
            icon={periodActive ? Heart : CalendarPlus}
            label={periodActive ? '月经走了' : '月经来了'}
            onPress={() => void togglePeriod()}
          />
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
              onPress={() => openRecord('flow')}
              recorded={Boolean(todayRecord?.flow)}
              value={todayRecord?.flow ?? '未记录'}
            />
            <SummaryRow
              accent={theme.colors.companionApricot}
              icon={Heartbeat}
              label="痛感"
              onPress={() => openRecord('pain')}
              recorded={Boolean(todayRecord?.pain)}
              value={todayRecord?.pain ?? '未记录'}
            />
            <SummaryRow
              accent={theme.colors.companionLavender}
              icon={Sparkle}
              label="症状"
              onPress={() => openRecord('symptoms')}
              recorded={Boolean(todayRecord?.symptoms.length)}
              value={todayRecord?.symptoms.join('、') || '未记录'}
            />
          </Box>
          {recordError ? (
            <Text style={styles.errorText}>{recordError}</Text>
          ) : null}
        </Box>
      </ScrollView>

      <RecordDetailSheet
        activeKind={activeKind}
        draft={draft}
        key={activeKind ?? 'closed'}
        onChange={setDraft}
        onConfirm={saveDraft}
        onClose={() => sheetRef.current?.dismiss()}
        onDismiss={() => setActiveKind(null)}
        ref={sheetRef}
      />

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
            <Text style={styles.toastText}>{toastMessage}</Text>
            {lastAction ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void undoPeriodAction()}
                style={styles.undoButton}
              >
                <Text style={styles.undoText}>撤销</Text>
              </Pressable>
            ) : null}
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

function emptyDraft(): DailyRecordDraft {
  return { flow: '', pain: '', symptoms: [] };
}

function toDraft(record: {
  flow: string | null;
  pain: string | null;
  symptoms: string[];
}): DailyRecordDraft {
  return {
    flow: record.flow ?? '',
    pain: record.pain ?? '',
    symptoms: record.symptoms,
  };
}

type SummaryRowProps = {
  accent: string;
  icon: Icon;
  label: string;
  onPress: () => void;
  recorded: boolean;
  value: string;
};

function SummaryRow({
  accent,
  icon: Icon,
  label,
  onPress,
  recorded,
  value,
}: SummaryRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.summaryRow, pressed && styles.pressed]}
    >
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
        <Box alignItems="center" flexDirection="row" gap="s" maxWidth="48%">
          <Text
            numberOfLines={1}
            style={[
              styles.summaryValue,
              recorded ? { color: accent } : styles.summaryValueEmpty,
            ]}
          >
            {value}
          </Text>
          <CaretRight color={theme.colors.textMuted} size={17} weight="bold" />
        </Box>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  errorText: {
    color: theme.colors.periodAction,
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
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
  summaryRow: {
    minHeight: 68,
  },
  summaryValue: {
    color: theme.colors.companionInk,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  summaryValueEmpty: {
    color: theme.colors.textMuted,
    fontWeight: '500',
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
