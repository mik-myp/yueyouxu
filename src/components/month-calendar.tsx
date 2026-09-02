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
  ClipboardText,
  Drop,
  Pause,
  Play,
  Sparkle,
  type Icon,
} from '@/components/soft-icons';
import { formatLocalDate } from '@/domain/local-date';
import type { DailyRecord, Period, PredictionWindow } from '@/domain/models';
import { Text, theme } from '@/theme';

type MonthCalendarProps = {
  dailyRecords?: DailyRecord[];
  estimatedPeriodRanges?: { end: string; start: string }[];
  onSelectDate: (date: string) => void;
  periods?: Period[];
  prediction?: PredictionWindow | null;
  selectedDate: string;
  today?: string;
};

type DayCellProps = {
  date?: DateData;
  onPress: () => void;
  selected: boolean;
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

function DayCell({
  date,
  onPress,
  selected,
  periods,
  dailyRecords,
  prediction,
  today,
  estimatedPeriodRanges,
}: DayCellProps & {
  periods: Period[];
  dailyRecords: DailyRecord[];
  prediction?: PredictionWindow | null;
  today: string;
  estimatedPeriodRanges: { end: string; start: string }[];
}) {
  if (!date) return null;

  const key = date.dateString;
  const actualPeriod = periods.find((period) =>
    period.endDate
      ? inRange(key, period.startDate, period.endDate)
      : key === period.startDate,
  );
  const actual = Boolean(actualPeriod);
  const estimatedPeriodRange = estimatedPeriodRanges.find((range) =>
    inRange(key, range.start, range.end),
  );
  const estimated = Boolean(estimatedPeriodRange && !actual);
  const predicted = Boolean(
    prediction &&
    !actual &&
    !estimated &&
    inRange(key, prediction.earliestDate, prediction.latestDate),
  );
  const range = actualPeriod
    ? {
        start: actualPeriod.startDate,
        end: actualPeriod.endDate ?? actualPeriod.startDate,
      }
    : estimatedPeriodRange && estimated
      ? estimatedPeriodRange
      : prediction
        ? { start: prediction.earliestDate, end: prediction.latestDate }
        : null;
  const start = Boolean(range && key === range.start);
  const end = Boolean(range && key === range.end);
  const disabled = key > today;
  const recorded = dailyRecords.some((record) => record.recordDate === key);
  const isToday = key === today;
  const statusLabel = [
    actual && '实际经期',
    estimated && '预计经期',
    predicted && '预测经期',
    actualPeriod && key === actualPeriod.startDate && '月经来了',
    actualPeriod?.endDate === key && '月经走了',
    recorded && '已记录',
    isToday && '今天',
    selected && '已选择',
  ].filter(Boolean);
  const markers = [
    actualPeriod && key === actualPeriod.startDate
      ? {
          color: theme.colors.companionMint,
          icon: Play,
          key: 'period-start',
        }
      : null,
    actualPeriod?.endDate === key
      ? {
          color: theme.colors.companionMint,
          icon: Pause,
          key: 'period-end',
        }
      : null,
    recorded
      ? {
          color: actual
            ? theme.colors.companionMint
            : theme.colors.companionSage,
          icon: ClipboardText,
          key: 'daily-record',
        }
      : null,
  ].filter((marker) => marker !== null);

  return (
    <Pressable
      accessibilityLabel={`${date.month}月${date.day}日${
        statusLabel.length ? `，${statusLabel.join('，')}` : ''
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayCell,
        pressed && styles.dayCellPressed,
      ]}
    >
      {actual || estimated || predicted ? (
        <View
          style={[
            styles.band,
            start && styles.bandStart,
            end && styles.bandEnd,
            actual
              ? styles.actualBand
              : estimated
                ? styles.estimatedBand
                : styles.predictedBand,
            !actual &&
              (estimated || predicted) &&
              start &&
              styles.predictedBandStart,
            !actual &&
              (estimated || predicted) &&
              end &&
              styles.predictedBandEnd,
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
        <View style={styles.markerRow}>
          {markers.map((marker) => (
            <DayStatusMarker {...marker} key={marker.key} />
          ))}
        </View>
        <Text
          style={[
            styles.dayText,
            disabled && styles.disabledText,
            actual && styles.actualText,
          ]}
        >
          {date.day}
        </Text>
        <View style={styles.markerSpacer} />
      </View>
    </Pressable>
  );
}

function DayStatusMarker({
  color,
  icon: StatusIcon,
}: {
  color: string;
  icon: Icon;
}) {
  return (
    <View style={styles.statusMarker}>
      <StatusIcon color={color} size={12} weight="fill" />
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
  dailyRecords = [],
  estimatedPeriodRanges = [],
  onSelectDate,
  periods = [],
  prediction,
  selectedDate,
  today = formatLocalDate(new Date()),
}: MonthCalendarProps) {
  const reduceMotion = useReducedMotion();
  const [visibleMonth, setVisibleMonth] = useState(
    () => `${selectedDate.slice(0, 7)}-01`,
  );
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

  const selectDate = useCallback(
    (date: string) => {
      const nextMonth = `${date.slice(0, 7)}-01`;
      if (nextMonth !== visibleMonth) {
        setDirection(nextMonth > visibleMonth ? 1 : -1);
        setVisibleMonth(nextMonth);
      }
      onSelectDate(date);
    },
    [onSelectDate, visibleMonth],
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
            dayComponent={({ date }) => (
              <DayCell
                date={date}
                dailyRecords={dailyRecords}
                estimatedPeriodRanges={estimatedPeriodRanges}
                onPress={() => date && selectDate(date.dateString)}
                periods={periods}
                prediction={prediction}
                selected={date?.dateString === selectedDate}
                today={today}
              />
            )}
            firstDay={0}
            hideExtraDays={false}
            maxDate={today}
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
          backgroundColor={theme.colors.companionBerry}
          color={theme.colors.companionSurface}
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
          backgroundColor={theme.colors.companionCashmere}
          color={theme.colors.companionInk}
          icon={CheckCircle}
          label="已选择"
        />
        <LegendItem
          color={theme.colors.companionSage}
          icon={Play}
          label="月经来了"
        />
        <LegendItem
          color={theme.colors.companionSage}
          icon={Pause}
          label="月经走了"
        />
        <LegendItem
          color={theme.colors.companionSage}
          icon={ClipboardText}
          label="已记录"
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
  backgroundColor?: string;
  color: string;
  icon: Icon;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendIcon, backgroundColor && { backgroundColor }]}>
        <LegendIcon
          color={color}
          size={12}
          weight={backgroundColor ? 'duotone' : 'fill'}
        />
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
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18,
  },
  band: {
    bottom: 2,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 2,
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
    height: 46,
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
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  dayText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    lineHeight: 18,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
  estimatedBand: {
    backgroundColor: theme.colors.companionBerryWash,
    borderBottomColor: theme.colors.companionBerry,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderTopColor: theme.colors.companionBerry,
    borderTopWidth: 1.5,
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
  predictedBandEnd: {
    borderRightColor: theme.colors.companionBerryOutline,
    borderRightWidth: 2,
  },
  predictedBandStart: {
    borderLeftColor: theme.colors.companionBerryOutline,
    borderLeftWidth: 2,
  },
  legend: {
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minWidth: 0,
    paddingVertical: 3,
    width: '33.333%',
  },
  legendText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  markerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    height: 12,
    justifyContent: 'center',
  },
  markerSpacer: {
    height: 12,
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
    height: 12,
    justifyContent: 'center',
    width: 12,
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
