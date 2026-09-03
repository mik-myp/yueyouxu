import { ScrollView, StyleSheet } from 'react-native';

import { CalendarHeart } from '@/components/soft-icons';
import { Page } from '@/components/page';
import { SectionHeading } from '@/components/section-heading';
import { SettingsDetailHeader } from '@/components/settings-detail-header';
import { useAppData } from '@/data/app-data-provider';
import { differenceInLocalDays } from '@/domain/local-date';
import { Box, Text, theme } from '@/theme';

export default function PeriodHistoryScreen() {
  const { periods } = useAppData();
  const orderedPeriods = [...periods].sort((left, right) =>
    right.startDate.localeCompare(left.startDate),
  );

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <SettingsDetailHeader title="历史经期" />
        <Box marginTop="xl">
          <Box paddingHorizontal="page">
            <SectionHeading
              action={`${orderedPeriods.length} 条记录`}
              title="全部记录"
            />
          </Box>
          <Box style={styles.historyGroup}>
            {orderedPeriods.length ? (
              orderedPeriods.map((item, index) => (
                <Box
                  alignItems="center"
                  borderBottomColor="companionCashmereStrong"
                  borderBottomWidth={
                    index === orderedPeriods.length - 1
                      ? 0
                      : StyleSheet.hairlineWidth
                  }
                  flexDirection="row"
                  key={item.id}
                  minHeight={76}
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
                minHeight={88}
                paddingHorizontal="page"
              >
                <Text variant="caption">尚无经期记录</Text>
              </Box>
            )}
          </Box>
        </Box>
      </ScrollView>
    </Page>
  );
}

function formatDate(value: string) {
  const [, month, day] = value.split('-').map(Number);
  return `${month}月${day}日`;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
    paddingTop: 16,
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
});
