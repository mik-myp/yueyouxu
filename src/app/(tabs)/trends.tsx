import { ScrollView, StyleSheet } from 'react-native';

import {
  CalendarHeart,
  Drop,
  Heartbeat,
  Info,
  Sparkle,
  type Icon,
  WaveSine,
} from '@/components/soft-icons';
import { Page } from '@/components/page';
import { SectionHeading } from '@/components/section-heading';
import { TrendLine } from '@/components/trend-line';
import { useAppData } from '@/data/app-data-provider';
import { differenceInLocalDays } from '@/domain/local-date';
import { Box, Text, theme } from '@/theme';

export default function TrendsScreen() {
  const { dailyRecords, periods, settings } = useAppData();
  const ordered = [...periods].sort((left, right) =>
    left.startDate.localeCompare(right.startDate),
  );
  const cycleLengths = ordered
    .slice(1)
    .map((period, index) =>
      differenceInLocalDays(ordered[index].startDate, period.startDate),
    );
  const periodLengths = ordered
    .filter((period) => period.endDate)
    .map(
      (period) => differenceInLocalDays(period.startDate, period.endDate!) + 1,
    );
  const averageCycle =
    average(cycleLengths) ?? settings?.referenceCycleLength ?? 28;
  const cycleMin = cycleLengths.length
    ? Math.min(...cycleLengths)
    : averageCycle;
  const cycleMax = cycleLengths.length
    ? Math.max(...cycleLengths)
    : averageCycle;
  const averagePeriod =
    average(periodLengths) ?? settings?.referencePeriodLength ?? 5;
  const latest = ordered[ordered.length - 1];
  const coveredDays = latest
    ? dailyRecords.filter(
        (record) =>
          record.recordDate >= latest.startDate &&
          (!latest.endDate || record.recordDate <= latest.endDate),
      ).length
    : 0;
  return (
    <Page>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        tabIndex={0}
      >
        <Box paddingHorizontal="page" paddingTop="l">
          <SectionHeading
            action={`${cycleLengths.length} 个完整间隔`}
            title="周期长度"
          />
          <Box alignItems="baseline" flexDirection="row" gap="s" marginTop="m">
            <Text style={styles.heroNumber} variant="heroNumber">
              {averageCycle}
            </Text>
            <Box paddingBottom="xs">
              <Text style={styles.heroUnit}>天</Text>
              <Text variant="caption">
                {cycleLengths.length
                  ? `个人范围 ${cycleMin}～${cycleMax} 天`
                  : '记录不足，暂用初始参考值'}
              </Text>
            </Box>
          </Box>
          {cycleLengths.length >= 2 ? (
            <Box style={styles.chartFrame}>
              <TrendLine values={cycleLengths} />
            </Box>
          ) : null}
        </Box>

        <Box
          backgroundColor="companionSurface"
          borderBottomColor="companionCashmereStrong"
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderTopColor="companionCashmereStrong"
          borderTopWidth={StyleSheet.hairlineWidth}
          marginTop="xxl"
          paddingBottom="l"
          paddingHorizontal="page"
          paddingTop="m"
        >
          <SectionHeading action={`${coveredDays} 天`} title="本周期记录覆盖" />
          <Box flexDirection="row" gap="xs" marginTop="m">
            {Array.from(
              { length: Math.max(1, averagePeriod) },
              (_, index) => index < coveredDays,
            ).map((recorded, index) => (
              <Box
                backgroundColor={
                  recorded ? 'companionBerry' : 'companionCashmereStrong'
                }
                borderRadius="s"
                flex={1}
                height={8}
                key={index}
              />
            ))}
          </Box>
          <Box flexDirection="row" marginTop="m">
            <CompactMetric label="已记录" value={`${coveredDays} 天`} />
            <Box style={styles.metricDivider} />
            <CompactMetric
              label="经期覆盖"
              value={`${Math.min(100, Math.round((coveredDays / Math.max(1, averagePeriod)) * 100))}%`}
            />
            <Box style={styles.metricDivider} />
            <CompactMetric
              label="待补充"
              value={`${Math.max(0, averagePeriod - coveredDays)} 天`}
            />
          </Box>
        </Box>

        <Box
          backgroundColor="companionSurface"
          borderBottomColor="companionCashmereStrong"
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderTopColor="companionCashmereStrong"
          borderTopWidth={StyleSheet.hairlineWidth}
          marginTop="xl"
          paddingHorizontal="page"
          paddingBottom="l"
          paddingTop="m"
        >
          <SectionHeading title="个人范围" />
          <Box flexDirection="row" marginTop="m">
            <Box flex={1} flexDirection="row" gap="m">
              <MetricIcon accent={theme.colors.companionBerry} icon={Drop} />
              <Box>
                <Text variant="caption">经期长度</Text>
                <Text variant="dataNumber">
                  {periodLengths.length
                    ? `${Math.min(...periodLengths)}～${Math.max(...periodLengths)} 天`
                    : `${averagePeriod} 天`}
                </Text>
              </Box>
            </Box>
            <Box style={styles.metricDivider} />
            <Box flex={1} flexDirection="row" gap="m" paddingLeft="m">
              <MetricIcon
                accent={theme.colors.companionLavender}
                icon={WaveSine}
              />
              <Box>
                <Text variant="caption">周期波动</Text>
                <Text variant="dataNumber">{cycleMax - cycleMin} 天</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box marginTop="xxl">
          <Box paddingHorizontal="page">
            <SectionHeading action="基于现有记录" title="记录分析" />
          </Box>
          <Box style={[styles.analysisGroup, styles.sectionSpacing]}>
            <AnalysisRow
              accent={theme.colors.companionLavender}
              description={
                cycleLengths.length >= 2
                  ? `现有周期相差 ${cycleMax - cycleMin} 天`
                  : '至少记录 3 次经期后可分析稳定性'
              }
              icon={WaveSine}
              label="周期稳定性"
            />
            <AnalysisRow
              accent={theme.colors.companionBerry}
              description={
                periodLengths.length
                  ? `平均持续 ${averagePeriod} 天`
                  : '尚无已结束经期样本'
              }
              icon={Drop}
              label="经期长度"
            />
            <AnalysisRow
              accent={theme.colors.companionApricot}
              description={
                dailyRecords.length
                  ? `已积累 ${dailyRecords.length} 天每日记录`
                  : '尚未添加流量、痛感或症状记录'
              }
              icon={Heartbeat}
              isLast
              label="记录特点"
            />
          </Box>
        </Box>

        <Box marginTop="xxl">
          <Box paddingHorizontal="page">
            <SectionHeading action="全部记录" title="历史经期" />
          </Box>
          <Box
            backgroundColor="companionSurface"
            borderBottomColor="companionCashmereStrong"
            borderBottomWidth={StyleSheet.hairlineWidth}
            borderTopColor="companionCashmereStrong"
            borderTopWidth={StyleSheet.hairlineWidth}
            marginTop="m"
          >
            {ordered.length ? (
              [...ordered].reverse().map((item, index) => (
                <Box
                  alignItems="center"
                  borderBottomColor="companionCashmereStrong"
                  borderBottomWidth={
                    index === ordered.length - 1 ? 0 : StyleSheet.hairlineWidth
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
                        : '进行中'}
                    </Text>
                  </Box>
                  <Box alignItems="flex-end">
                    <Text style={styles.cycleLength}>
                      {item.endDate ? formatDate(item.endDate) : '未结束'}
                    </Text>
                    <Text variant="caption">结束</Text>
                  </Box>
                </Box>
              ))
            ) : (
              <Box
                minHeight={76}
                paddingHorizontal="page"
                justifyContent="center"
              >
                <Text variant="caption">尚无经期记录</Text>
              </Box>
            )}
          </Box>
        </Box>

        <Box
          alignItems="center"
          flexDirection="row"
          gap="s"
          marginTop="l"
          paddingHorizontal="page"
        >
          <Info color={theme.colors.textMuted} size={17} weight="duotone" />
          <Text variant="caption">记录越完整，个人范围越稳定</Text>
        </Box>
      </ScrollView>
    </Page>
  );
}

function average(values: number[]) {
  return values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : null;
}

function formatDate(value: string) {
  const [, month, day] = value.split('-').map(Number);
  return `${month}月${day}日`;
}

type MetricIconProps = {
  accent: string;
  icon: Icon;
};

function MetricIcon({ accent, icon: Icon }: MetricIconProps) {
  return (
    <Box
      alignItems="center"
      height={40}
      justifyContent="center"
      style={[styles.metricIcon, { backgroundColor: `${accent}14` }]}
      width={40}
    >
      <Icon color={accent} size={21} weight="duotone" />
    </Box>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <Box alignItems="center" flex={1}>
      <Text style={styles.compactMetricValue}>{value}</Text>
      <Text variant="caption">{label}</Text>
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
      minHeight={76}
      paddingHorizontal="page"
    >
      <MetricIcon accent={accent} icon={Icon} />
      <Box flex={1} marginLeft="m">
        <Text variant="label">{label}</Text>
        <Text style={styles.analysisDescription}>{description}</Text>
      </Box>
      <Sparkle color={accent} size={15} weight="duotone" />
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
  },
  content: {
    paddingBottom: 48,
  },
  compactMetricValue: {
    color: theme.colors.companionInk,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 25,
  },
  chartFrame: {
    marginTop: 2,
  },
  cycleLength: {
    color: theme.colors.companionInk,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 22,
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
  historyIcon: {
    backgroundColor: theme.colors.companionBerryWash,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
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
  sectionSpacing: {
    marginTop: 16,
  },
});
