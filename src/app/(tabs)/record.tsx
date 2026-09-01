import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  CheckCircle,
  Drop,
  Heartbeat,
  NotePencil,
  Smiley,
  Sparkle,
} from '@/components/soft-icons';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { MonthCalendar } from '@/components/month-calendar';
import { Page } from '@/components/page';
import { RecordDetailSheet } from '@/components/record-detail-sheet';
import { RecordRow } from '@/components/record-row';
import {
  actualPeriodRange,
  initialDailyRecord,
  prototypeToday,
} from '@/features/prototype/mock-data';
import type { DailyRecordDraft, RecordKind } from '@/features/prototype/types';
import { Box, Text, theme } from '@/theme';

export default function RecordScreen() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [selectedDate, setSelectedDate] = useState(prototypeToday);
  const [activeKind, setActiveKind] = useState<RecordKind | null>(null);
  const [draft, setDraft] = useState<DailyRecordDraft>(initialDailyRecord);
  const [periodActive, setPeriodActive] = useState(true);

  function openSheet(kind: RecordKind) {
    setActiveKind(kind);
    requestAnimationFrame(() => sheetRef.current?.present());
  }

  function closeSheet() {
    sheetRef.current?.dismiss();
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setPeriodActive(
      date >= actualPeriodRange.start && date <= actualPeriodRange.end,
    );
  }

  function selectedDateLabel() {
    if (selectedDate === prototypeToday) return '9月1日 · 今天';
    const [, month, day] = selectedDate.split('-');
    return `${Number(month)}月${Number(day)}日`;
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
            onSelectDate={selectDate}
            selectedDate={selectedDate}
          />
        </Box>

        <Box
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
          paddingHorizontal="page"
          style={styles.dateSummary}
        >
          <Box>
            <Text style={styles.dateTitle} variant="sectionTitle">
              {selectedDateLabel()}
            </Text>
            <Text style={styles.dateCaption} variant="caption">
              {periodActive ? '经期中 · 记录会用于个人周期分析' : '非经期记录'}
            </Text>
          </Box>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPeriodActive((current) => !current)}
            style={[
              styles.periodButton,
              !periodActive && styles.periodButtonInactive,
            ]}
          >
            {periodActive ? (
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
              style={periodActive ? styles.periodButtonText : undefined}
              variant="label"
            >
              {periodActive ? '月经结束' : '月经来了'}
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
            value={draft.flow}
          />
          <RecordRow
            accent={theme.colors.companionApricot}
            icon={Heartbeat}
            label="痛感"
            onPress={() => openSheet('pain')}
            value={draft.pain}
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
            value={draft.mood}
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
        onClose={closeSheet}
        onDismiss={() => setActiveKind(null)}
        ref={sheetRef}
      />
    </Page>
  );
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
