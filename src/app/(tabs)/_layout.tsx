import { Redirect, Tabs } from 'expo-router';

import { SoftTabBar } from '@/components/soft-tab-bar';
import { useAppData } from '@/data/app-data-provider';
import { Box, Text } from '@/theme';

export default function TabsLayout() {
  const { error, loading, settings } = useAppData();

  if (loading) {
    return (
      <Box alignItems="center" flex={1} justifyContent="center">
        <Text variant="caption">正在准备本地数据…</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box alignItems="center" flex={1} justifyContent="center" padding="page">
        <Text textAlign="center">{error}</Text>
      </Box>
    );
  }

  if (!settings?.onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      tabBar={(props) => <SoftTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '今天',
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: '记录',
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: '趋势',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
        }}
      />
    </Tabs>
  );
}
