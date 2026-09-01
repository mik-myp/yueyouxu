import { Calendar, type DateData } from 'react-native-calendars';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  actualPeriodRange,
  predictedPeriodRange,
  prototypeToday,
  recordedDates,
} from '@/features/prototype/mock-data';
import { Text, theme } from '@/theme';

type MonthCalendarProps = {
  onSelectDate: (date: string) => void;
  selectedDate: string;
};

type DayCellProps = {
  date?: DateData;
  onPress: () => void;
  selected: boolean;
  state?: string;
};

type CalendarHeaderProps = {
  addMonth?: (amount: number) => void;
  month?: {
    getFullYear: () => number;
    getMonth: () => number;
  };
};

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

function inRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

function DayCell({ date, onPress, selected, state }: DayCellProps) {
  if (!date) return null;

  const key = date.dateString;
  const actual = inRange(key, actualPeriodRange.start, actualPeriodRange.end);
  const predicted = inRange(
    key,
    predictedPeriodRange.start,
    predictedPeriodRange.end,
  );
  const range = actual ? actualPeriodRange : predictedPeriodRange;
  const start = key === range.start;
  const end = key === range.end;
  const disabled = state === 'disabled';

  return (
    <Pressable
      accessibilityLabel={`${date.month}月${date.day}日`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.dayCell}
    >
      {actual || predicted ? (
        <View
          style={[
            styles.band,
            start && styles.bandStart,
            end && styles.bandEnd,
            actual ? styles.actualBand : styles.predictedBand,
          ]}
        />
      ) : null}
      <View
        style={[
          styles.dayNumber,
          key === prototypeToday && !actual && styles.today,
          selected && styles.selected,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            disabled && styles.disabledText,
            actual && styles.actualText,
          ]}
        >
          {date.day}
        </Text>
      </View>
      {recordedDates.has(key) && !actual ? (
        <View style={styles.recordDot} />
      ) : null}
    </Pressable>
  );
}

function CalendarHeader({ addMonth, month }: CalendarHeaderProps) {
  return (
    <View>
      <View style={styles.monthHeader}>
        <Pressable
          accessibilityLabel="上个月"
          accessibilityRole="button"
          onPress={() => addMonth?.(-1)}
          style={styles.monthButton}
        >
          <ChevronLeft color={theme.colors.textPrimary} size={20} />
        </Pressable>
        <Text variant="sectionTitle">
          {month?.getFullYear()}年{(month?.getMonth() ?? 0) + 1}月
        </Text>
        <Pressable
          accessibilityLabel="下个月"
          accessibilityRole="button"
          onPress={() => addMonth?.(1)}
          style={styles.monthButton}
        >
          <ChevronRight color={theme.colors.textPrimary} size={20} />
        </Pressable>
      </View>
      <View style={styles.weekHeader}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function MonthCalendar({
  onSelectDate,
  selectedDate,
}: MonthCalendarProps) {
  return (
    <Calendar
      current={prototypeToday}
      customHeader={CalendarHeader}
      dayComponent={({ date, state }) => (
        <DayCell
          date={date}
          onPress={() => date && onSelectDate(date.dateString)}
          selected={date?.dateString === selectedDate}
          state={state}
        />
      )}
      firstDay={0}
      hideExtraDays={false}
      style={styles.calendar}
      theme={{
        arrowColor: theme.colors.textPrimary,
        calendarBackground: theme.colors.background,
        textDayHeaderFontSize: 12,
        textSectionTitleColor: theme.colors.textMuted,
      }}
    />
  );
}

const styles = StyleSheet.create({
  actualBand: {
    backgroundColor: theme.colors.periodActual,
  },
  actualText: {
    color: theme.colors.surface,
    fontSize: 19,
    fontWeight: '600',
    lineHeight: 24,
  },
  band: {
    bottom: 4,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 4,
  },
  bandEnd: {
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    right: 4,
  },
  bandStart: {
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    left: 4,
  },
  calendar: {
    backgroundColor: theme.colors.background,
    paddingBottom: 4,
  },
  dayCell: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  dayNumber: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  dayText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    lineHeight: 20,
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
  monthButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  predictedBand: {
    backgroundColor: '#FFF7F9',
    borderBottomColor: theme.colors.periodPredicted,
    borderBottomWidth: 2,
    borderTopColor: theme.colors.periodPredicted,
    borderTopWidth: 2,
  },
  recordDot: {
    backgroundColor: theme.colors.symptom,
    borderRadius: 2,
    bottom: 1,
    height: 4,
    position: 'absolute',
    width: 4,
  },
  selected: {
    borderColor: theme.colors.textPrimary,
    borderWidth: 1.5,
  },
  today: {
    borderColor: theme.colors.periodActual,
    borderWidth: 1.5,
  },
  weekDay: {
    color: theme.colors.textMuted,
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  weekHeader: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
});
