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
import { cycleHistory } from '@/features/prototype/mock-data';
import { Box, Text, theme } from '@/theme';

export default function TrendsScreen() {
  return (
    <Page>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        tabIndex={0}
      >
        <Box paddingHorizontal="page" paddingTop="l">
          <SectionHeading action="近 4 个周期" title="周期长度" />
          <Box alignItems="baseline" flexDirection="row" gap="s" marginTop="m">
            <Text style={styles.heroNumber} variant="heroNumber">
              30
            </Text>
            <Box paddingBottom="xs">
              <Text style={styles.heroUnit}>天</Text>
              <Text variant="caption">通常在 29～31 天之间</Text>
            </Box>
          </Box>
          <Box style={styles.chartFrame}>
            <TrendLine />
          </Box>
          <Box flexDirection="row" justifyContent="space-between">
            {['6月', '7月', '8月', '本次'].map((label) => (
              <Text key={label} variant="caption">
                {label}
              </Text>
            ))}
          </Box>
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
          <SectionHeading action="3 / 5 天" title="本周期记录覆盖" />
          <Box flexDirection="row" gap="xs" marginTop="m">
            {[true, true, true, false, false].map((recorded, index) => (
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
            <CompactMetric label="已记录" value="3 天" />
            <Box style={styles.metricDivider} />
            <CompactMetric label="经期覆盖" value="60%" />
            <Box style={styles.metricDivider} />
            <CompactMetric label="待补充" value="2 天" />
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
                <Text variant="dataNumber">5～6 天</Text>
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
                <Text variant="dataNumber">2 天</Text>
              </Box>
            </Box>
          </Box>
          <Box marginTop="m">
            <Box
              backgroundColor="companionBerrySoft"
              borderRadius="s"
              height={7}
            >
              <Box
                backgroundColor="companionBerry"
                borderRadius="s"
                height={7}
                marginLeft="l"
                width="52%"
              />
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
              description="最近 4 个周期相差 2 天，整体较稳定"
              icon={WaveSine}
              label="周期稳定性"
            />
            <AnalysisRow
              accent={theme.colors.companionBerry}
              description="4 次中有 3 次持续 5 天"
              icon={Drop}
              label="经期长度"
            />
            <AnalysisRow
              accent={theme.colors.companionApricot}
              description="当前以轻微痛感、腰酸和乏力为主"
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
            {cycleHistory.map((item, index) => (
              <Box
                alignItems="center"
                borderBottomColor="companionCashmereStrong"
                borderBottomWidth={
                  index === cycleHistory.length - 1
                    ? 0
                    : StyleSheet.hairlineWidth
                }
                flexDirection="row"
                key={item.month}
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
                  <Text variant="body">{item.start}开始</Text>
                  <Text variant="caption">持续 {item.periodLength} 天</Text>
                </Box>
                <Box alignItems="flex-end">
                  <Text style={styles.cycleLength}>{item.cycleLength} 天</Text>
                  <Text variant="caption">周期</Text>
                </Box>
              </Box>
            ))}
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
