import { useRouter } from 'expo-router';
import {
  ArrowRight,
  CalendarPlus,
  Drop,
  GearSix,
  Heart,
  Heartbeat,
  Sparkle,
  type Icon,
} from '@/components/soft-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { CycleArc } from '@/components/cycle-arc';
import { IconButton } from '@/components/icon-button';
import { Page } from '@/components/page';
import { PrimaryButton } from '@/components/primary-button';
import { SectionHeading } from '@/components/section-heading';
import { Box, Text, theme } from '@/theme';

export default function TodayScreen() {
  const router = useRouter();
  const [periodActive, setPeriodActive] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  function togglePeriod() {
    setPeriodActive((current) => !current);
    setToastVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToastVisible(false), 3000);
  }

  function undoPeriod() {
    setPeriodActive((current) => !current);
    setToastVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  return (
    <Page>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        tabIndex={0}
      >
        <Box
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
          paddingHorizontal="page"
          paddingTop="m"
        >
          <Box>
            <Text style={styles.eyebrow}>2026年9月</Text>
            <Text style={styles.pageTitle} variant="title">
              1日，星期二
            </Text>
          </Box>
          <IconButton
            accessibilityLabel="设置"
            icon={GearSix}
            onPress={() => router.push('/settings')}
          />
        </Box>

        <Box paddingHorizontal="s">
          <CycleArc />
        </Box>

        <Box gap="s" paddingHorizontal="page">
          <PrimaryButton
            icon={periodActive ? Heart : CalendarPlus}
            label={periodActive ? '月经结束' : '月经来了'}
            onPress={togglePeriod}
          />
          {periodActive ? (
            <PrimaryButton
              icon={Drop}
              label="记录今天"
              onPress={() => router.push('/record')}
              tone="neutral"
            />
          ) : null}
        </Box>

        <Box marginTop="xl" gap="m">
          <Box paddingHorizontal="page">
            <SectionHeading action="已记录 3 项" title="今天的记录" />
          </Box>
          <Box
            backgroundColor="companionSurface"
            borderBottomColor="companionCashmereStrong"
            borderBottomWidth={StyleSheet.hairlineWidth}
            borderTopColor="companionCashmereStrong"
            borderTopWidth={StyleSheet.hairlineWidth}
          >
            <SummaryRow
              accent={theme.colors.companionBerry}
              icon={Drop}
              label="流量"
              value="中量"
            />
            <SummaryRow
              accent={theme.colors.companionApricot}
              icon={Heartbeat}
              label="痛感"
              value="轻微"
            />
            <SummaryRow
              accent={theme.colors.companionLavender}
              icon={Sparkle}
              label="症状"
              value="腰酸、乏力"
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/record')}
              style={({ pressed }) => [
                styles.allRecords,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.allRecordsText}>查看和修改记录</Text>
              <ArrowRight
                color={theme.colors.companionBerry}
                size={18}
                weight="bold"
              />
            </Pressable>
          </Box>
        </Box>
      </ScrollView>

      {toastVisible ? (
        <Box bottom={18} left={20} position="absolute" right={20}>
          <Box
            alignItems="center"
            backgroundColor="companionInk"
            flexDirection="row"
            justifyContent="space-between"
            paddingHorizontal="m"
            paddingVertical="s"
            style={styles.toast}
          >
            <Text style={styles.toastText}>
              {periodActive ? '已标记月经开始' : '已标记月经结束'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={undoPeriod}
              style={styles.undoButton}
            >
              <Text style={styles.undoText}>撤销</Text>
            </Pressable>
          </Box>
        </Box>
      ) : null}
    </Page>
  );
}

type SummaryRowProps = {
  accent: string;
  icon: Icon;
  label: string;
  value: string;
};

function SummaryRow({ accent, icon: Icon, label, value }: SummaryRowProps) {
  return (
    <Box
      alignItems="center"
      borderBottomColor="companionCashmereStrong"
      borderBottomWidth={StyleSheet.hairlineWidth}
      flexDirection="row"
      minHeight={68}
      paddingHorizontal="page"
    >
      <Box
        alignItems="center"
        height={38}
        justifyContent="center"
        style={[styles.summaryIcon, { backgroundColor: `${accent}14` }]}
        width={38}
      >
        <Icon color={accent} size={20} weight="duotone" />
      </Box>
      <Text marginLeft="m" variant="label">
        {label}
      </Text>
      <Box flex={1} />
      <Text variant="body">{value}</Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  allRecords: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: 20,
  },
  allRecordsText: {
    color: theme.colors.companionBerry,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  content: {
    paddingBottom: 36,
  },
  eyebrow: {
    color: theme.colors.companionBerry,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  pageTitle: {
    color: theme.colors.companionInk,
  },
  pressed: {
    opacity: 0.6,
  },
  toastText: {
    color: theme.colors.companionSurface,
    fontSize: 14,
  },
  summaryIcon: {
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  toast: {
    borderCurve: 'continuous',
    borderRadius: 14,
    boxShadow: `0 6px 18px rgba(58, 46, 52, 0.2)`,
  },
  undoButton: {
    minHeight: 40,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  undoText: {
    color: theme.colors.companionBerrySoft,
    fontWeight: '600',
  },
});
