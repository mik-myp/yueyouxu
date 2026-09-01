import { CalendarHeart } from '@/components/soft-icons';
import { ScrollView, StyleSheet } from 'react-native';

import { Page } from '@/components/page';
import { SettingsDetailHeader } from '@/components/settings-detail-header';
import { Box, Text, theme } from '@/theme';

export default function AboutScreen() {
  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <SettingsDetailHeader title="关于月有序" />

        <Box alignItems="center" marginTop="xxl" paddingHorizontal="page">
          <Box
            alignItems="center"
            height={72}
            justifyContent="center"
            style={styles.appIcon}
            width={72}
          >
            <CalendarHeart
              color={theme.colors.companionBerry}
              size={37}
              weight="duotone"
            />
          </Box>
          <Text marginTop="m" variant="sectionTitle">
            月有序
          </Text>
          <Text marginTop="xs" variant="caption">
            经期记录与周期观察
          </Text>
        </Box>

        <Box marginTop="xxl" style={styles.versionRow}>
          <Text variant="body">版本</Text>
          <Text variant="label">0.1.0</Text>
        </Box>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  appIcon: {
    backgroundColor: theme.colors.companionBerryWash,
    borderColor: theme.colors.companionBerrySoft,
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: `0 5px 14px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  content: {
    paddingBottom: 48,
    paddingTop: 16,
  },
  versionRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 20,
  },
});
