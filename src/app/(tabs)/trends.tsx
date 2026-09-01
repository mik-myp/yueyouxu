import { ScrollView, StyleSheet } from 'react-native';

import {
  CalendarHeart,
  Drop,
  Info,
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
        <Box paddingHorizontal="page" paddingTop="m">
          <Text style={styles.title} variant="title">
            趋势
          </Text>
          <Text style={styles.subtitle} variant="caption">
            根据最近 4 个完整周期整理
          </Text>
        </Box>

        <Box marginTop="l" paddingHorizontal="page">
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

        <Box marginTop="xl">
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

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
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
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  title: {
    color: theme.colors.companionInk,
  },
});
