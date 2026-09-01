import { useRouter } from 'expo-router';
import {
  CalendarPlus,
  ChevronRight,
  Droplets,
  HeartPulse,
  Settings,
  Sparkles,
} from 'lucide-react-native';
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
        >
          <Box>
            <Text variant="caption">2026年9月</Text>
            <Text variant="title">1日，星期二</Text>
          </Box>
          <IconButton
            accessibilityLabel="设置"
            icon={Settings}
            onPress={() => router.push('/settings')}
          />
        </Box>

        <CycleArc />

        <Box gap="s">
          <PrimaryButton
            icon={periodActive ? HeartPulse : CalendarPlus}
            label={periodActive ? '月经结束' : '月经来了'}
            onPress={togglePeriod}
          />
          {periodActive ? (
            <PrimaryButton
              icon={Droplets}
              label="记录今天"
              onPress={() => router.push('/record')}
              tone="neutral"
            />
          ) : null}
        </Box>

        <Box marginTop="xl" gap="m">
          <SectionHeading action="已记录 3 项" title="今天" />
          <Box
            backgroundColor="surface"
            borderColor="border"
            borderRadius="m"
            borderWidth={1}
          >
            <SummaryRow icon={Droplets} label="流量" value="中量" />
            <SummaryRow icon={HeartPulse} label="痛感" value="轻微" />
            <SummaryRow icon={Sparkles} label="状态" value="腰酸、乏力" />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/record')}
              style={({ pressed }) => [
                styles.allRecords,
                pressed && styles.pressed,
              ]}
            >
              <Text variant="label">查看和修改记录</Text>
              <ChevronRight color={theme.colors.textMuted} size={18} />
            </Pressable>
          </Box>
        </Box>
      </ScrollView>

      {toastVisible ? (
        <Box bottom={18} left={20} position="absolute" right={20}>
          <Box
            alignItems="center"
            backgroundColor="textPrimary"
            borderRadius="m"
            flexDirection="row"
            justifyContent="space-between"
            paddingHorizontal="m"
            paddingVertical="s"
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
  icon: typeof Droplets;
  label: string;
  value: string;
};

function SummaryRow({ icon: Icon, label, value }: SummaryRowProps) {
  return (
    <Box
      alignItems="center"
      borderBottomColor="border"
      borderBottomWidth={StyleSheet.hairlineWidth}
      flexDirection="row"
      minHeight={58}
      paddingHorizontal="m"
    >
      <Icon color={theme.colors.symptom} size={18} strokeWidth={1.8} />
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
    minHeight: 56,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.6,
  },
  toastText: {
    color: theme.colors.surface,
    fontSize: 14,
  },
  undoButton: {
    minHeight: 40,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  undoText: {
    color: theme.colors.periodPredicted,
    fontWeight: '600',
  },
});
