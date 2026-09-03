import { Calendar, type DateData } from 'react-native-calendars';
import { useCallback, useMemo, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
  useReducedMotion,
} from 'react-native-reanimated';

import {
  ArrowDown,
  ArrowUp,
  CaretLeft,
  CaretRight,
  NotePencil,
  Drop,
  Selection,
  Sparkle,
  Minus,
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

function weekDay(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
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
      : key >= period.startDate && key <= today,
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
        end: actualPeriod.endDate ?? today,
      }
    : estimatedPeriodRange && estimated
      ? estimatedPeriodRange
      : prediction
        ? { start: prediction.earliestDate, end: prediction.latestDate }
        : null;
  const start = Boolean(range && key === range.start);
  const end = Boolean(range && key === range.end);
  const dayOfWeek = weekDay(key);
  const segmentStart = start || dayOfWeek === 0;
  const segmentEnd = end || dayOfWeek === 6;
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
          color: theme.colors.companionButter,
          icon: ArrowDown,
          key: 'period-start',
        }
      : null,
    actualPeriod?.endDate === key
      ? {
          color: theme.colors.companionButter,
          icon: ArrowUp,
          key: 'period-end',
        }
      : null,
    recorded
      ? {
          color: actual
            ? theme.colors.companionButter
            : theme.colors.companionOchre,
          icon: NotePencil,
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
            segmentStart && styles.bandStart,
            segmentEnd && styles.bandEnd,
            actual
              ? styles.actualBand
              : estimated
                ? styles.estimatedBand
                : styles.predictedBand,
            !actual &&
              (estimated || predicted) &&
              segmentStart &&
              styles.predictedBandStart,
            !actual &&
              (estimated || predicted) &&
              segmentEnd &&
              styles.predictedBandEnd,
          ]}
        />
      ) : null}
      <View style={[styles.dayNumber, isToday && !actual && styles.today]}>
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
        <View style={styles.markerSpacer}>
          {selected ? (
            <View
              style={[
                styles.selectionMark,
                actual && styles.selectionMarkActual,
              ]}
            />
          ) : null}
        </View>
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
  const ResolvedIcon = StatusIcon || Minus;
  return (
    <View style={styles.statusMarker}>
      <ResolvedIcon color={color} size={11} weight="fill" />
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
      {visibleMonth.slice(0, 7) !== today.slice(0, 7) ? (
        <Pressable
          accessibilityLabel="回到今天"
          accessibilityRole="button"
          onPress={() => {
            const nextMonth = `${today.slice(0, 7)}-01`;
            setDirection(nextMonth > visibleMonth ? 1 : -1);
            setVisibleMonth(nextMonth);
            onSelectDate(today);
          }}
          style={({ pressed }) => [
            styles.todayButton,
            pressed && styles.dayCellPressed,
          ]}
        >
          <Text style={styles.todayButtonText}>回到今天</Text>
        </Pressable>
      ) : null}
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
          backgroundColor={theme.colors.transparent}
          color={theme.colors.companionInk}
          icon={Selection}
          label="已选择"
        />
        <LegendItem
          color={theme.colors.companionOchre}
          icon={ArrowDown}
          label="月经来了"
        />
        <LegendItem
          color={theme.colors.companionOchre}
          icon={ArrowUp}
          label="月经走了"
        />
        <LegendItem
          color={theme.colors.companionOchre}
          icon={NotePencil}
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
  const ResolvedIcon = LegendIcon || Minus;
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendIcon, backgroundColor && { backgroundColor }]}>
        <ResolvedIcon
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
    lineHeight: 16,
  },
  band: {
    bottom: 3,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 3,
  },
  bandEnd: {
    borderBottomRightRadius: 14,
    borderCurve: 'continuous',
    borderTopRightRadius: 14,
    right: 4,
  },
  bandStart: {
    borderBottomLeftRadius: 14,
    borderCurve: 'continuous',
    borderTopLeftRadius: 14,
    left: 4,
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
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  dayText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    lineHeight: 16,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
  estimatedBand: {
    backgroundColor: theme.colors.companionBerryWash,
    borderBottomColor: theme.colors.companionBerryOutline,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: theme.colors.companionBerryOutline,
    borderTopWidth: 1,
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
  todayButton: {
    alignSelf: 'flex-end',
    marginRight: 26,
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  todayButtonText: {
    color: theme.colors.companionBerry,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  predictedBand: {
    backgroundColor: theme.colors.companionBerryWash,
    borderBottomColor: theme.colors.companionBerryOutline,
    borderBottomWidth: 1.5,
    borderTopColor: theme.colors.companionBerryOutline,
    borderTopWidth: 1.5,
  },
  predictedBandEnd: {
    borderRightColor: theme.colors.companionBerryOutline,
    borderRightWidth: 1.5,
  },
  predictedBandStart: {
    borderLeftColor: theme.colors.companionBerryOutline,
    borderLeftWidth: 1.5,
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
    height: 14,
    justifyContent: 'center',
    paddingTop: 3,
  },
  markerSpacer: {
    alignItems: 'center',
    height: 14,
    justifyContent: 'center',
  },
  selectionMark: {
    borderColor: theme.colors.companionInk,
    borderRadius: 6,
    borderWidth: 1.5,
    height: 10,
    width: 10,
  },
  selectionMarkActual: {
    borderColor: theme.colors.companionButter,
  },
  statusMarker: {
    alignItems: 'center',
    height: 11,
    justifyContent: 'center',
    width: 11,
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
