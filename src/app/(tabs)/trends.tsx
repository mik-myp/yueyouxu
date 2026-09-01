import { CalendarRange, Minus, MoveRight } from 'lucide-react-native';
import { ScrollView, StyleSheet } from 'react-native';

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
        <Box paddingHorizontal="page" paddingTop="s">
          <Text variant="title">趋势</Text>
          <Text variant="caption">根据最近 4 个完整周期整理</Text>
        </Box>

        <Box marginTop="xl" paddingHorizontal="page">
          <SectionHeading action="近 4 个周期" title="周期长度" />
          <Box alignItems="baseline" flexDirection="row" gap="xs" marginTop="m">
            <Text variant="heroNumber">30</Text>
            <Text variant="label">天，通常在 29～31 天之间</Text>
          </Box>
          <TrendLine />
          <Box flexDirection="row" justifyContent="space-between">
            {['6月', '7月', '8月', '本次'].map((label) => (
              <Text key={label} variant="caption">
                {label}
              </Text>
            ))}
          </Box>
        </Box>

        <Box
          borderBottomColor="border"
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderTopColor="border"
          borderTopWidth={StyleSheet.hairlineWidth}
          marginTop="xl"
          paddingHorizontal="page"
          paddingVertical="l"
        >
          <SectionHeading title="个人范围" />
          <Box alignItems="center" flexDirection="row" marginTop="m">
            <Box>
              <Text variant="caption">经期长度</Text>
              <Text variant="sectionTitle">5～6 天</Text>
            </Box>
            <Box flex={1} paddingHorizontal="m">
              <Box
                backgroundColor="periodPredicted"
                borderRadius="s"
                height={8}
              >
                <Box
                  backgroundColor="periodActual"
                  borderRadius="s"
                  height={8}
                  marginLeft="l"
                  width="52%"
                />
              </Box>
            </Box>
            <Box alignItems="flex-end">
              <Text variant="caption">周期波动</Text>
              <Text variant="sectionTitle">2 天</Text>
            </Box>
          </Box>
        </Box>

        <Box marginTop="xl">
          <Box paddingHorizontal="page">
            <SectionHeading action="全部记录" title="历史经期" />
          </Box>
          <Box backgroundColor="surface" marginTop="m">
            {cycleHistory.map((item, index) => (
              <Box
                alignItems="center"
                borderBottomColor="border"
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
                  backgroundColor="periodPredicted"
                  borderRadius="m"
                  height={38}
                  justifyContent="center"
                  width={38}
                >
                  <CalendarRange color={theme.colors.periodAction} size={19} />
                </Box>
                <Box flex={1} marginLeft="m">
                  <Text variant="body">{item.start}开始</Text>
                  <Text variant="caption">持续 {item.periodLength} 天</Text>
                </Box>
                <Text variant="label">{item.cycleLength} 天</Text>
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
          <Minus color={theme.colors.textMuted} size={16} />
          <Text variant="caption">记录越完整，个人范围越稳定</Text>
          <MoveRight color={theme.colors.textMuted} size={16} />
        </Box>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
});
