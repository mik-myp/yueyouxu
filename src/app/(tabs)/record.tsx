import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  Droplets,
  FileText,
  HeartPulse,
  Smile,
  Sparkles,
} from 'lucide-react-native';
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
    if (selectedDate === prototypeToday) return '9月1日 · 今天 · 经期第1天';
    const [, month, day] = selectedDate.split('-');
    return `${Number(month)}月${Number(day)}日`;
  }

  return (
    <Page>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        tabIndex={0}
      >
        <Box paddingHorizontal="page" paddingTop="s">
          <Text variant="title">记录</Text>
          <Text variant="caption">选择日期，查看或补充当天状态</Text>
        </Box>

        <Box marginTop="s">
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
          paddingVertical="m"
        >
          <Box>
            <Text variant="sectionTitle">{selectedDateLabel()}</Text>
            <Text variant="caption">记录会用于个人周期分析</Text>
          </Box>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPeriodActive((current) => !current)}
            style={[
              styles.periodButton,
              !periodActive && styles.periodButtonInactive,
            ]}
          >
            <Text
              style={periodActive ? styles.periodButtonText : undefined}
              variant="label"
            >
              {periodActive ? '月经结束' : '月经来了'}
            </Text>
          </Pressable>
        </Box>

        <Box
          backgroundColor="surface"
          borderBottomColor="border"
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderTopColor="border"
          borderTopWidth={StyleSheet.hairlineWidth}
        >
          <RecordRow
            accent={theme.colors.periodActual}
            icon={Droplets}
            label="流量"
            onPress={() => openSheet('flow')}
            value={draft.flow}
          />
          <RecordRow
            accent={theme.colors.periodActual}
            icon={HeartPulse}
            label="痛感"
            onPress={() => openSheet('pain')}
            value={draft.pain}
          />
          <RecordRow
            accent={theme.colors.symptom}
            icon={Sparkles}
            label="症状"
            onPress={() => openSheet('symptoms')}
            value={draft.symptoms.length ? draft.symptoms.join('、') : '未记录'}
          />
          <RecordRow
            accent={theme.colors.positive}
            icon={Smile}
            label="心情"
            onPress={() => openSheet('mood')}
            value={draft.mood}
          />
          <RecordRow
            accent={theme.colors.textMuted}
            icon={FileText}
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
        onSingleSelect={closeSheet}
        ref={sheetRef}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 28,
  },
  periodButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.periodAction,
    borderColor: theme.colors.periodAction,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 14,
  },
  periodButtonInactive: {
    backgroundColor: theme.colors.surface,
  },
  periodButtonText: {
    color: theme.colors.surface,
  },
});
