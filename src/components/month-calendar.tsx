import { Calendar, type DateData } from 'react-native-calendars';
import { useCallback, useMemo, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
  useReducedMotion,
} from 'react-native-reanimated';

import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  Drop,
  NotePencil,
  Sparkle,
  type Icon,
} from '@/components/soft-icons';
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
  const recorded = recordedDates.has(key);
  const isToday = key === prototypeToday;
  const statusLabel = [
    actual && '实际经期',
    predicted && '预测经期',
    recorded && '已记录',
    isToday && '今天',
    selected && '已选择',
  ].filter(Boolean);
  const marker = recorded
    ? {
        backgroundColor: theme.colors.companionLavenderWash,
        color: theme.colors.companionLavender,
        icon: NotePencil,
      }
    : actual && start
      ? {
          backgroundColor: theme.colors.companionSurface,
          color: theme.colors.companionBerry,
          icon: Drop,
        }
      : predicted && start
        ? {
            backgroundColor: theme.colors.companionBerryWash,
            color: theme.colors.companionBerry,
            icon: Sparkle,
          }
        : null;

  return (
    <Pressable
      accessibilityLabel={`${date.month}月${date.day}日${
        statusLabel.length ? `，${statusLabel.join('，')}` : ''
      }`}
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
          isToday && !actual && styles.today,
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
      {marker ? <DayStatusMarker {...marker} /> : null}
    </Pressable>
  );
}

function DayStatusMarker({
  backgroundColor,
  color,
  icon: StatusIcon,
}: {
  backgroundColor: string;
  color: string;
  icon: Icon;
}) {
  return (
    <View style={[styles.statusMarker, { backgroundColor }]}>
      <StatusIcon color={color} size={9} weight="bold" />
    </View>
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
  const reduceMotion = useReducedMotion();
  const [visibleMonth, setVisibleMonth] = useState(prototypeToday);
  const [direction, setDirection] = useState(0);

  const showMonth = useCallback((amount: number) => {
    setDirection(amount);
    setVisibleMonth((current) => {
      const [year, month] = current.split('-').map(Number);
      const next = new Date(year, month - 1 + amount, 1);
      return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(
        2,
        '0',
      )}-01`;
    });
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 18 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -52) showMonth(1);
          if (gesture.dx > 52) showMonth(-1);
        },
      }),
    [showMonth],
  );

  const handleMonthChange = useCallback(
    (date: DateData) => {
      const next = `${date.year}-${String(date.month).padStart(2, '0')}-01`;
      if (next === visibleMonth) return;
      setDirection(next > visibleMonth ? 1 : -1);
      setVisibleMonth(next);
    },
    [visibleMonth],
  );

  const entering = reduceMotion
    ? undefined
    : direction > 0
      ? FadeInRight.duration(180)
      : direction < 0
        ? FadeInLeft.duration(180)
        : undefined;

  return (
    <View>
      <View {...panResponder.panHandlers} style={styles.calendarViewport}>
        <Animated.View entering={entering} key={visibleMonth}>
          <Calendar
            current={visibleMonth}
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
            onMonthChange={handleMonthChange}
            style={styles.calendar}
            theme={{
              arrowColor: theme.colors.companionInk,
              calendarBackground: theme.colors.companionCanvas,
              textDayHeaderFontSize: 12,
              textSectionTitleColor: theme.colors.textMuted,
            }}
          />
        </Animated.View>
      </View>
      <View style={styles.legend}>
        <LegendItem
          backgroundColor={theme.colors.companionBerryWash}
          color={theme.colors.companionBerry}
          icon={Drop}
          label="实际经期"
        />
        <LegendItem
          backgroundColor={theme.colors.companionBerryWash}
          color={theme.colors.companionBerry}
          icon={Sparkle}
          label="预测经期"
        />
        <LegendItem
          backgroundColor={theme.colors.companionLavenderWash}
          color={theme.colors.companionLavender}
          icon={NotePencil}
          label="已记录"
        />
        <LegendItem
          backgroundColor={theme.colors.companionCashmere}
          color={theme.colors.companionInk}
          icon={CheckCircle}
          label="已选择"
        />
      </View>
    </View>
  );
}

function LegendItem({
  backgroundColor,
  color,
  icon: LegendIcon,
  label,
}: {
  backgroundColor: string;
  color: string;
  icon: Icon;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendIcon, { backgroundColor }]}>
        <LegendIcon color={color} size={12} weight="duotone" />
      </View>
      <Text style={styles.legendText}>{label}</Text>
    </View>
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
    paddingBottom: 4,
    paddingHorizontal: 6,
  },
  calendarViewport: {
    overflow: 'hidden',
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
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.companionBerryWash,
    borderBottomColor: theme.colors.companionBerryOutline,
    borderBottomWidth: 2,
    borderTopColor: theme.colors.companionBerryOutline,
    borderTopWidth: 2,
  },
  legend: {
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 8,
    paddingTop: 12,
  },
  legendIcon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 8,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  legendItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minWidth: 0,
  },
  legendText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
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
  statusMarker: {
    alignItems: 'center',
    borderColor: theme.colors.companionCanvas,
    borderRadius: 7,
    borderWidth: 1,
    bottom: 0,
    height: 14,
    justifyContent: 'center',
    position: 'absolute',
    right: 3,
    width: 14,
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
