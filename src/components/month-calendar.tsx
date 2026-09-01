import { Calendar, type DateData } from 'react-native-calendars';
import { Pressable, StyleSheet, View } from 'react-native';

import { CaretLeft, CaretRight } from '@/components/soft-icons';
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
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayCell,
        pressed && styles.dayCellPressed,
      ]}
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
          selected && !actual && styles.selected,
          selected && actual && styles.selectedActual,
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
          <CaretLeft
            color={theme.colors.companionInk}
            size={19}
            weight="bold"
          />
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
          <CaretRight
            color={theme.colors.companionInk}
            size={19}
            weight="bold"
          />
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
        arrowColor: theme.colors.companionInk,
        calendarBackground: theme.colors.companionCanvas,
        textDayHeaderFontSize: 12,
        textSectionTitleColor: theme.colors.textMuted,
      }}
    />
  );
}

const styles = StyleSheet.create({
  actualBand: {
    backgroundColor: theme.colors.companionBerry,
  },
  actualText: {
    color: theme.colors.surface,
    fontSize: 19,
    fontWeight: '600',
    lineHeight: 24,
  },
  band: {
    bottom: 5,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 5,
  },
  bandEnd: {
    borderBottomRightRadius: 12,
    borderCurve: 'continuous',
    borderTopRightRadius: 12,
    right: 5,
  },
  bandStart: {
    borderBottomLeftRadius: 12,
    borderCurve: 'continuous',
    borderTopLeftRadius: 12,
    left: 5,
  },
  calendar: {
    backgroundColor: theme.colors.companionCanvas,
    paddingBottom: 8,
    paddingHorizontal: 6,
  },
  dayCell: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  dayCellPressed: {
    opacity: 0.7,
  },
  dayNumber: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
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
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  monthHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  predictedBand: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionBerrySoft,
    borderBottomWidth: 2,
    borderTopColor: theme.colors.companionBerrySoft,
    borderTopWidth: 2,
  },
  recordDot: {
    backgroundColor: theme.colors.companionLavender,
    borderColor: theme.colors.companionCanvas,
    borderRadius: 3,
    borderWidth: 1,
    bottom: 0,
    height: 6,
    position: 'absolute',
    width: 6,
  },
  selected: {
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionInk,
    borderWidth: 1.5,
    boxShadow: `0 2px 5px ${theme.colors.companionShadow}`,
  },
  selectedActual: {
    borderColor: theme.colors.companionSurface,
    borderWidth: 2,
  },
  today: {
    borderColor: theme.colors.companionBerry,
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
    paddingBottom: 6,
    paddingTop: 7,
  },
});
