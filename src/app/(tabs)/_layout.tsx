import { Tabs } from 'expo-router';

import { SoftTabBar } from '@/components/soft-tab-bar';

export default function TabsLayout() {
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
