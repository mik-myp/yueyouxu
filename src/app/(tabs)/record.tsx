import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  CheckCircle,
  Drop,
  Heartbeat,
  NotePencil,
  Smiley,
  Sparkle,
} from '@/components/soft-icons';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { MonthCalendar } from '@/components/month-calendar';
import { Page } from '@/components/page';
import { RecordDetailSheet } from '@/components/record-detail-sheet';
import { RecordRow } from '@/components/record-row';
import {
  PeriodDetailSheet,
  type PeriodEditAction,
} from '@/components/period-detail-sheet';
import { useAppData } from '@/data/app-data-provider';
import {
  addLocalDays,
  currentTimeZone,
  formatLocalDate,
} from '@/domain/local-date';
import type { DailyRecordDraft, RecordKind } from '@/features/prototype/types';
import type { DailyRecord, Period } from '@/domain/models';
import { Box, Text, theme } from '@/theme';

export default function RecordScreen() {
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const sheetRef = useRef<BottomSheetModal>(null);
  const periodSheetRef = useRef<BottomSheetModal>(null);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [activeKind, setActiveKind] = useState<RecordKind | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const {
    dailyRecords,
    periods,
    prediction,
    recordPeriod,
    removePeriod,
    saveDailyRecord,
    settings,
  } = useAppData();
  const [draft, setDraft] = useState<DailyRecordDraft>(() => {
    const saved = dailyRecords.find((record) => record.recordDate === today);
    return saved ? toDraft(saved) : emptyDraft();
  });
  const selectedPeriod = findPeriodForDate(periods, selectedDate);
  const periodForEditor =
    periods.find((period) => period.id === editingPeriodId) ??
    selectedPeriod ??
    null;
  const periodActive = Boolean(selectedPeriod);
  const referencePeriodLength = settings?.referencePeriodLength ?? 5;
  const openPeriodForSelectedDate = [...periods]
    .filter(
      (period) => period.endDate === null && period.startDate <= selectedDate,
    )
    .sort((left, right) => right.startDate.localeCompare(left.startDate))[0];
  const estimatedPeriodRanges = getEstimatedPeriodRanges(
    periods,
    referencePeriodLength,
  );
  const selectedEstimatedRange = openPeriodForSelectedDate
    ? estimatedPeriodRanges.find(
        (range) => range.periodId === openPeriodForSelectedDate.id,
      )
    : null;
  const canEndOpenPeriod = Boolean(
    openPeriodForSelectedDate && !selectedPeriod,
  );
  const periodButtonPrimary = periodActive || canEndOpenPeriod;

  function openSheet(kind: RecordKind) {
    const saved = dailyRecords.find(
      (record) => record.recordDate === selectedDate,
    );
    setDraft(saved ? toDraft(saved) : emptyDraft());
    setActiveKind(kind);
    requestAnimationFrame(() => sheetRef.current?.present());
  }

  function saveDraft(nextDraft: DailyRecordDraft) {
    setActionError(null);
    void saveDailyRecord({
      record: {
        flow: nextDraft.flow || null,
        mood: nextDraft.mood || null,
        note: nextDraft.note || null,
        pain: nextDraft.pain || null,
        symptoms: nextDraft.symptoms,
        timeZone: currentTimeZone(),
      },
      recordDate: selectedDate,
    }).catch((error) => {
      setActionError(
        error instanceof Error ? error.message : '每日记录保存失败',
      );
    });
  }

  function closeSheet() {
    sheetRef.current?.dismiss();
  }

  function selectDate(date: string) {
    setActionError(null);
    setSelectedDate(date);
    const saved = dailyRecords.find((record) => record.recordDate === date);
    setDraft(saved ? toDraft(saved) : emptyDraft());
  }

  async function togglePeriod() {
    setActionError(null);
    if (selectedPeriod && selectedPeriod.endDate !== null) {
      openPeriodEditor(selectedPeriod);
      return;
    }
    try {
      await recordPeriod({
        action: openPeriodForSelectedDate ? 'end' : 'start',
        startDate: selectedDate,
        timeZone: currentTimeZone(),
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '经期记录失败');
    }
  }

  function openPeriodEditor(period: Period) {
    setEditingPeriodId(period.id);
    requestAnimationFrame(() => periodSheetRef.current?.present());
  }

  async function correctPeriod(
    period: DailyRecordPeriod,
    boundary: 'start' | 'end',
  ) {
    try {
      setActionError(null);
      await recordPeriod({
        action: 'correct',
        endDate: boundary === 'end' ? selectedDate : period.endDate,
        periodId: period.id,
        startDate: boundary === 'start' ? selectedDate : period.startDate,
        timeZone: currentTimeZone(),
      });
      periodSheetRef.current?.dismiss();
      selectDate(selectedDate);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '经期修正失败');
      periodSheetRef.current?.dismiss();
    }
  }

  async function deletePeriod(period: DailyRecordPeriod) {
    try {
      setActionError(null);
      await removePeriod(period.id);
      periodSheetRef.current?.dismiss();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '经期删除失败');
      periodSheetRef.current?.dismiss();
    }
  }

  function confirmPeriodEdit(
    period: DailyRecordPeriod,
    action: PeriodEditAction,
  ) {
    if (action === 'delete') void deletePeriod(period);
    else void correctPeriod(period, action);
  }

  function selectedDateLabel() {
    if (selectedDate === today) {
      const [, month, day] = selectedDate.split('-');
      return `${Number(month)}月${Number(day)}日 · 今天`;
    }
    const [, month, day] = selectedDate.split('-');
    return `${Number(month)}月${Number(day)}日`;
  }

  function periodCaption() {
    if (selectedPeriod?.endDate) {
      return '实际经期记录 · 可调整开始日或结束日';
    }
    if (selectedPeriod && selectedEstimatedRange) {
      return `已标记月经来了 · 预计至 ${formatShortDate(selectedEstimatedRange.end)}`;
    }
    if (openPeriodForSelectedDate) {
      return `${formatShortDate(openPeriodForSelectedDate.startDate)} 月经来了 · 当前选择为走了日期`;
    }
    return selectedDate < today ? '非经期记录 · 可标记月经来了' : '非经期记录';
  }

  function periodButtonLabel() {
    if (selectedPeriod?.endDate) return '调整经期';
    if (openPeriodForSelectedDate) return '月经走了';
    return '月经来了';
  }

  return (
    <Page>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        tabIndex={0}
      >
        <Box paddingTop="m">
          <MonthCalendar
            dailyRecords={dailyRecords}
            estimatedPeriodRanges={estimatedPeriodRanges}
            onSelectDate={selectDate}
            periods={periods}
            prediction={prediction}
            selectedDate={selectedDate}
            today={today}
          />
        </Box>

        {actionError ? (
          <Text
            paddingBottom="m"
            paddingHorizontal="page"
            style={styles.errorText}
          >
            {actionError}
          </Text>
        ) : null}

        <Box
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
          paddingHorizontal="page"
          style={styles.dateSummary}
        >
          <Box flex={1} paddingRight="s">
            <Text style={styles.dateTitle} variant="sectionTitle">
              {selectedDateLabel()}
            </Text>
            <Text style={styles.dateCaption} variant="caption">
              {periodCaption()}
            </Text>
          </Box>
          <Pressable
            accessibilityRole="button"
            onPress={() => void togglePeriod()}
            style={[
              styles.periodButton,
              !periodButtonPrimary && styles.periodButtonInactive,
            ]}
          >
            {periodButtonPrimary ? (
              <CheckCircle
                color={theme.colors.companionSurface}
                size={18}
                weight="fill"
              />
            ) : (
              <Drop
                color={theme.colors.companionBerry}
                size={18}
                weight="duotone"
              />
            )}
            <Text
              style={periodButtonPrimary ? styles.periodButtonText : undefined}
              variant="label"
            >
              {periodButtonLabel()}
            </Text>
          </Pressable>
        </Box>

        <Box
          backgroundColor="companionSurface"
          borderBottomColor="companionCashmereStrong"
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderTopColor="companionCashmereStrong"
          borderTopWidth={StyleSheet.hairlineWidth}
        >
          <RecordRow
            accent={theme.colors.companionBerry}
            icon={Drop}
            label="流量"
            onPress={() => openSheet('flow')}
            value={draft.flow || '未记录'}
          />
          <RecordRow
            accent={theme.colors.companionApricot}
            icon={Heartbeat}
            label="痛感"
            onPress={() => openSheet('pain')}
            value={draft.pain || '未记录'}
          />
          <RecordRow
            accent={theme.colors.companionLavender}
            icon={Sparkle}
            label="症状"
            onPress={() => openSheet('symptoms')}
            value={draft.symptoms.length ? draft.symptoms.join('、') : '未记录'}
          />
          <RecordRow
            accent={theme.colors.companionSage}
            icon={Smiley}
            label="心情"
            onPress={() => openSheet('mood')}
            value={draft.mood || '未记录'}
          />
          <RecordRow
            accent={theme.colors.textMuted}
            icon={NotePencil}
            isLast
            label="备注"
            onPress={() => openSheet('note')}
            value={draft.note || '未记录'}
          />
        </Box>
      </ScrollView>

      <RecordDetailSheet
        activeKind={activeKind}
        draft={draft}
        key={activeKind ?? 'closed'}
        onChange={setDraft}
        onConfirm={saveDraft}
        onClose={closeSheet}
        onDismiss={() => setActiveKind(null)}
        ref={sheetRef}
      />
      <PeriodDetailSheet
        onCancel={() => periodSheetRef.current?.dismiss()}
        onConfirm={confirmPeriodEdit}
        period={periodForEditor}
        ref={periodSheetRef}
        selectedDate={selectedDate}
      />
    </Page>
  );
}

type DailyRecordPeriod = Period;

function findPeriodForDate(periods: DailyRecordPeriod[], date: string) {
  return (
    periods.find(
      (period) =>
        period.startDate <= date &&
        (period.endDate ? period.endDate >= date : period.startDate === date),
    ) ?? null
  );
}

function getEstimatedPeriodRanges(
  periods: DailyRecordPeriod[],
  referencePeriodLength: number,
) {
  const sortedPeriods = [...periods].sort((left, right) =>
    left.startDate.localeCompare(right.startDate),
  );

  return sortedPeriods.flatMap((period, index) => {
    if (period.endDate !== null || referencePeriodLength < 2) return [];
    const nextPeriod = sortedPeriods[index + 1];
    const estimatedEnd = addLocalDays(
      period.startDate,
      referencePeriodLength - 1,
    );
    const end = nextPeriod
      ? [estimatedEnd, addLocalDays(nextPeriod.startDate, -1)].sort()[0]
      : estimatedEnd;
    const start = addLocalDays(period.startDate, 1);

    return start <= end ? [{ end, periodId: period.id, start }] : [];
  });
}

function emptyDraft(): DailyRecordDraft {
  return { flow: '', mood: '', note: '', pain: '', symptoms: [] };
}

function toDraft(record: DailyRecord): DailyRecordDraft {
  return {
    flow: record.flow ?? '',
    mood: record.mood ?? '',
    note: record.note ?? '',
    pain: record.pain ?? '',
    symptoms: record.symptoms,
  };
}

function formatShortDate(value: string) {
  const [, month, day] = value.split('-').map(Number);
  return `${month}月${day}日`;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 44,
  },
  dateCaption: {
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  dateSummary: {
    minHeight: 94,
    paddingVertical: 20,
  },
  dateTitle: {
    color: theme.colors.companionInk,
  },
  errorText: {
    color: theme.colors.periodAction,
    fontSize: 13,
    lineHeight: 20,
  },
  periodButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionBerry,
    borderColor: theme.colors.companionBerry,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: `0 4px 10px ${theme.colors.companionShadow}, inset 0 1px 0 rgba(255, 255, 255, 0.28)`,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  periodButtonInactive: {
    backgroundColor: theme.colors.companionSurface,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  periodButtonText: {
    color: theme.colors.companionSurface,
  },
  scroll: {
    backgroundColor: theme.colors.companionCanvas,
  },
});
