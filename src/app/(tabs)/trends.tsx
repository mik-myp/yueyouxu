import { useRouter } from 'expo-router';
import {
  useEffect,
  useRef,
  useState,
  type Component,
  type RefObject,
} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type TextLayoutEvent,
} from 'react-native';
import Popover, {
  PopoverMode,
  PopoverPlacement,
} from 'react-native-popover-view';

import { Page } from '@/components/page';
import { SectionHeading } from '@/components/section-heading';
import {
  CalendarHeart,
  Drop,
  Heartbeat,
  Info,
  Sparkle,
  WarningCircle,
  WaveSine,
  type Icon,
} from '@/components/soft-icons';
import { TrendLine } from '@/components/trend-line';
import { useAppData } from '@/data/app-data-provider';
import type { ValueCount } from '@/domain/cycle-analysis';
import { differenceInLocalDays } from '@/domain/local-date';
import { Box, Text, theme } from '@/theme';

export default function TrendsScreen() {
  const router = useRouter();
  const [dailyNoteVisible, setDailyNoteVisible] = useState(false);
  const noteButtonRef = useRef<View>(null);
  const { analysis, prediction, settings } = useAppData();
  const { cycle, daily } = analysis;
  const cycleLengths = cycle.cycleSamples.map(({ length }) => length);
  const cycleLength =
    cycle.typicalCycleLength ?? settings?.referenceCycleLength ?? 28;
  const periodLength =
    cycle.typicalPeriodLength ?? settings?.referencePeriodLength ?? 5;
  const excludedCount =
    cycle.excludedShortIntervalCount + cycle.excludedLongIntervalCount;
  const recentPeriods = cycle.orderedPeriods.slice(-3);

  return (
    <Page>
      <MethodTicker />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        tabIndex={0}
      >
        <Box paddingHorizontal="page" paddingTop="l">
          <SectionHeading
            action={`${cycleLengths.length} 个有效间隔`}
            title="预测依据"
          />
          <Box alignItems="baseline" flexDirection="row" gap="s" marginTop="m">
            <Text style={styles.heroNumber} variant="heroNumber">
              {cycleLength}
            </Text>
            <Box paddingBottom="xs">
              <Text style={styles.heroUnit}>天</Text>
              <Text variant="caption">
                {cycle.typicalCycleLength
                  ? '最近有效间隔的中位数'
                  : '记录不足，使用初始参考值'}
              </Text>
            </Box>
          </Box>
          {cycleLengths.length >= 2 ? (
            <Box style={styles.chartFrame}>
              <TrendLine values={cycleLengths} />
            </Box>
          ) : null}
          <Text style={styles.methodText} variant="caption">
            {prediction
              ? `${confidenceLabel(prediction.confidence)} · 预计 ${formatDate(prediction.earliestDate)}～${formatDate(prediction.latestDate)}`
              : '记录一次经期开始后生成首次预测'}
          </Text>
        </Box>

        <Box style={styles.factBand}>
          <SectionHeading action="均为记录事实" title="周期统计" />
          <Box flexDirection="row" marginTop="m">
            <CompactMetric
              label={cycle.typicalPeriodLength ? '经期中位数' : '经期参考值'}
              value={`${periodLength} 天`}
            />
            <Box style={styles.metricDivider} />
            <CompactMetric
              label="有效周期范围"
              value={formatRange(cycle.cycleRange)}
            />
            <Box style={styles.metricDivider} />
            <CompactMetric
              label="典型波动"
              value={
                cycle.cycleVariability === null
                  ? '记录不足'
                  : `${cycle.cycleVariability} 天`
              }
            />
          </Box>
          {excludedCount ? (
            <Box
              alignItems="flex-start"
              flexDirection="row"
              gap="s"
              marginTop="l"
            >
              <Info color={theme.colors.textMuted} size={17} weight="duotone" />
              <Text flex={1} variant="caption">
                {formatExcludedIntervals(
                  cycle.excludedShortIntervalCount,
                  cycle.excludedLongIntervalCount,
                )}
                保留在历史中，但未用于预测。
              </Text>
            </Box>
          ) : null}
        </Box>

        <Box marginTop="xxl" style={styles.dailyObservationSection}>
          <Box paddingHorizontal="page">
            <SectionHeading
              title="每日观察"
              extra={
                <Pressable
                  accessibilityLabel="每日观察说明"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: dailyNoteVisible }}
                  onPress={() => setDailyNoteVisible((visible) => !visible)}
                  ref={noteButtonRef}
                  style={({ pressed }) => [
                    styles.noteButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <WarningCircle color={theme.colors.textMuted} size={20} />
                </Pressable>
              }
            />
          </Box>
          <Box style={styles.analysisGroup}>
            <AnalysisRow
              accent={theme.colors.companionBerry}
              description={describeCounts(daily.flow.counts, '尚未记录流量')}
              icon={Drop}
              label={`流量 · ${daily.flow.observationCount} 天`}
            />
            <AnalysisRow
              accent={theme.colors.companionApricot}
              description={describePain(
                daily.pain.counts,
                daily.pain.moderateOrSevereDays,
              )}
              icon={Heartbeat}
              label={`痛感 · ${daily.pain.observationCount} 天`}
            />
            <AnalysisRow
              accent={theme.colors.companionLavender}
              description={describeCounts(
                daily.symptoms.counts,
                '尚未记录症状',
              )}
              icon={Sparkle}
              isLast
              label={`症状 · ${daily.symptoms.observationCount} 天`}
            />
          </Box>
        </Box>

        <Box marginTop="xxl">
          <Box paddingHorizontal="page">
            <SectionHeading
              action="更多记录"
              onActionPress={() => router.push('../period-history')}
              title="历史经期"
            />
          </Box>
          <Box style={styles.historyGroup}>
            {recentPeriods.length ? (
              [...recentPeriods].reverse().map((item, index) => (
                <Box
                  alignItems="center"
                  borderBottomColor="companionCashmereStrong"
                  borderBottomWidth={
                    index === recentPeriods.length - 1
                      ? 0
                      : StyleSheet.hairlineWidth
                  }
                  flexDirection="row"
                  key={item.id}
                  minHeight={68}
                  paddingHorizontal="page"
                >
                  <Box
                    alignItems="center"
                    height={40}
                    justifyContent="center"
                    style={styles.historyIcon}
                    width={40}
                  >
                    <CalendarHeart
                      color={theme.colors.companionBerry}
                      size={21}
                      weight="duotone"
                    />
                  </Box>
                  <Box flex={1} marginLeft="m">
                    <Text variant="body">{formatDate(item.startDate)}开始</Text>
                    <Text variant="caption">
                      {item.endDate
                        ? `持续 ${differenceInLocalDays(item.startDate, item.endDate) + 1} 天`
                        : '尚未记录结束日'}
                    </Text>
                  </Box>
                  <Box alignItems="flex-end">
                    <Text style={styles.historyValue}>
                      {item.endDate ? formatDate(item.endDate) : '进行中'}
                    </Text>
                    <Text variant="caption">结束</Text>
                  </Box>
                </Box>
              ))
            ) : (
              <Box
                justifyContent="center"
                minHeight={76}
                paddingHorizontal="page"
              >
                <Text variant="caption">尚无经期记录</Text>
              </Box>
            )}
          </Box>
        </Box>
      </ScrollView>
      <Popover
        arrowSize={{ height: 8, width: 16 }}
        backgroundStyle={styles.popoverBackdrop}
        isVisible={dailyNoteVisible}
        mode={PopoverMode.JS_MODAL}
        onCloseComplete={() => setDailyNoteVisible(false)}
        onRequestClose={() => setDailyNoteVisible(false)}
        placement={[PopoverPlacement.TOP, PopoverPlacement.BOTTOM]}
        popoverStyle={styles.notePopover}
        from={noteButtonRef as unknown as RefObject<Component>}
      >
        <Text style={styles.notePopoverText} variant="caption">
          只统计主动填写的项目；未记录不等于没有流量、痛感或症状。
        </Text>
      </Popover>
    </Page>
  );
}

const methodTickerText =
  '预测采用最近 12 个有效周期间隔的中位数；少于 10 天和超过 90 天的间隔不参与计算。';

function MethodTicker() {
  const [translateX] = useState(() => new Animated.Value(0));
  const [viewportWidth, setViewportWidth] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (!viewportWidth || trackWidth <= viewportWidth) {
      translateX.stopAnimation();
      translateX.setValue(0);
      return;
    }

    const distance = trackWidth + 28;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(translateX, {
          duration: Math.max(7000, distance * 28),
          easing: Easing.linear,
          toValue: -distance,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          duration: 0,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [trackWidth, translateX, viewportWidth]);

  function handleViewportLayout(event: LayoutChangeEvent) {
    setViewportWidth(event.nativeEvent.layout.width);
  }

  function handleTrackLayout(event: LayoutChangeEvent) {
    setTrackWidth((width) => Math.max(width, event.nativeEvent.layout.width));
  }

  function handleTextLayout(event: TextLayoutEvent) {
    const width = event.nativeEvent.lines.reduce(
      (maximum, line) => Math.max(maximum, line.width),
      0,
    );
    if (width > 0) setTrackWidth((current) => Math.max(current, width));
  }

  return (
    <View onLayout={handleViewportLayout} style={styles.methodTicker}>
      <WaveSine color={theme.colors.textMuted} size={17} weight="duotone" />
      <View style={styles.methodTickerViewport}>
        <Animated.View
          onLayout={handleTrackLayout}
          style={[styles.methodTickerTrack, { transform: [{ translateX }] }]}
        >
          <Text
            numberOfLines={1}
            onTextLayout={handleTextLayout}
            style={styles.methodTickerText}
          >
            {methodTickerText}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

function formatDate(value: string) {
  const [, month, day] = value.split('-').map(Number);
  return `${month}月${day}日`;
}

function confidenceLabel(value: 'low' | 'medium' | 'high') {
  return `${{ high: '高', low: '低', medium: '中' }[value]}置信度`;
}

function formatRange(range: { maximum: number; minimum: number } | null) {
  return range ? `${range.minimum}～${range.maximum} 天` : '记录不足';
}

function formatExcludedIntervals(shortCount: number, longCount: number) {
  return [
    shortCount ? `${shortCount} 个少于 10 天的间隔` : '',
    longCount ? `${longCount} 个超过 90 天的间隔` : '',
  ]
    .filter(Boolean)
    .join('、');
}

function describeCounts(counts: ValueCount[], emptyText: string) {
  if (!counts.length) return emptyText;
  return counts.map(({ count, value }) => `${value} ${count} 天`).join(' · ');
}

function describePain(counts: ValueCount[], moderateOrSevereDays: number) {
  if (!counts.length) return '尚未记录痛感';
  const distribution = describeCounts(counts, '');
  return moderateOrSevereDays
    ? `${distribution}；其中中等或严重 ${moderateOrSevereDays} 天`
    : distribution;
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <Box alignItems="center" flex={1} paddingHorizontal="xs">
      <Text style={styles.compactMetricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Box>
  );
}

type AnalysisRowProps = {
  accent: string;
  description: string;
  icon: Icon;
  isLast?: boolean;
  label: string;
};

function AnalysisRow({
  accent,
  description,
  icon: Icon,
  isLast,
  label,
}: AnalysisRowProps) {
  return (
    <Box
      alignItems="center"
      borderBottomColor="companionCashmereStrong"
      borderBottomWidth={isLast ? 0 : StyleSheet.hairlineWidth}
      flexDirection="row"
      minHeight={82}
      paddingHorizontal="page"
      paddingVertical="s"
    >
      <Box
        alignItems="center"
        height={40}
        justifyContent="center"
        style={[styles.metricIcon, { backgroundColor: `${accent}14` }]}
        width={40}
      >
        <Icon color={accent} size={21} weight="duotone" />
      </Box>
      <Box flex={1} marginLeft="m">
        <Text variant="label">{label}</Text>
        <Text style={styles.analysisDescription}>{description}</Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  analysisDescription: {
    color: theme.colors.companionInk,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 2,
  },
  analysisGroup: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  chartFrame: {
    marginTop: 2,
  },
  compactMetricValue: {
    color: theme.colors.companionInk,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 48,
  },
  factBand: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroNumber: {
    color: theme.colors.companionInk,
  },
  heroUnit: {
    color: theme.colors.companionInk,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  historyGroup: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  historyIcon: {
    backgroundColor: theme.colors.companionBerryWash,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  historyValue: {
    color: theme.colors.companionInk,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 22,
  },
  methodText: {
    marginTop: 12,
  },
  methodTicker: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionCashmere,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    minHeight: 38,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  methodTickerText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    flexShrink: 0,
    lineHeight: 20,
  },
  methodTickerTrack: {
    alignSelf: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
  },
  methodTickerViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  metricDivider: {
    backgroundColor: theme.colors.companionCashmereStrong,
    width: StyleSheet.hairlineWidth,
  },
  metricIcon: {
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  pressed: {
    opacity: 0.65,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
    textAlign: 'center',
  },
  dailyObservationSection: {
    position: 'relative',
    zIndex: 2,
  },
  noteButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginLeft: -8,
    width: 32,
  },
  notePopover: {
    backgroundColor: theme.colors.companionSurface,
    borderColor: theme.colors.companionCashmereStrong,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 280,
  },
  notePopoverText: {
    color: theme.colors.companionInk,
    lineHeight: 20,
  },
  popoverBackdrop: {
    backgroundColor: 'transparent',
  },
});
