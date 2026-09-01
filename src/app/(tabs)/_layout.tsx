import { Tabs } from 'expo-router';
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CircleDot,
} from 'lucide-react-native';

import { theme } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.periodAction,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          letterSpacing: 0,
          marginTop: 2,
        },
        tabBarStyle: {
          alignSelf: 'center',
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 66,
          maxWidth: 520,
          paddingBottom: 8,
          paddingTop: 7,
          width: '100%',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <CircleDot color={color} size={size} strokeWidth={1.9} />
          ),
          title: '今天',
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} strokeWidth={1.9} />
          ),
          title: '记录',
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          tabBarIcon: ({ color, size }) => (
            <ChartNoAxesColumnIncreasing
              color={color}
              size={size}
              strokeWidth={1.9}
            />
          ),
          title: '趋势',
        }}
      />
    </Tabs>
  );
}
