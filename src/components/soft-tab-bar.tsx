import { Tabs } from 'expo-router';
import { useEffect, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CalendarDots,
  ChartLineUp,
  MoonStars,
  type Icon,
} from '@/components/soft-icons';
import { Text, theme } from '@/theme';

type SoftTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

const tabMeta: Record<string, { icon: Icon; label: string }> = {
  index: { icon: MoonStars, label: '今天' },
  record: { icon: CalendarDots, label: '记录' },
  trends: { icon: ChartLineUp, label: '趋势' },
};

type SoftTabItemProps = {
  focused: boolean;
  icon: Icon;
  label: string;
  onLongPress: () => void;
  onPress: () => void;
};

function SoftTabItem({
  focused,
  icon: IconComponent,
  label,
  onLongPress,
  onPress,
}: SoftTabItemProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    const next = focused ? 1 : 0;
    progress.value = reduceMotion
      ? next
      : withSpring(next, { damping: 18, mass: 0.55, stiffness: 210 });
  }, [focused, progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -progress.value },
      { scale: 1 + progress.value * 0.035 },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [styles.tabPressable, pressed && styles.pressed]}
    >
      <Animated.View
        style={[
          styles.tabContent,
          focused && styles.tabContentFocused,
          animatedStyle,
        ]}
      >
        <View style={styles.iconFrame}>
          <IconComponent
            color={
              focused ? theme.colors.companionBerry : theme.colors.textMuted
            }
            size={23}
            weight={focused ? 'duotone' : 'regular'}
          />
        </View>
        <Text
          style={focused ? styles.labelFocused : styles.label}
          variant="caption"
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function SoftTabBar({
  descriptors,
  navigation,
  state,
}: SoftTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View accessibilityRole="tablist" style={styles.barContent}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const options = descriptors[route.key]?.options;
          const meta = tabMeta[route.name];

          if (!meta) return null;

          function handlePress() {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: 'tabPress',
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          function handleLongPress() {
            navigation.emit({ target: route.key, type: 'tabLongPress' });
          }

          return (
            <SoftTabItem
              focused={focused}
              icon={meta.icon}
              key={route.key}
              label={
                typeof options?.tabBarLabel === 'string'
                  ? options.tabBarLabel
                  : meta.label
              }
              onLongPress={handleLongPress}
              onPress={handlePress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.companionSurface,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 7,
  },
  barContent: {
    alignSelf: 'center',
    flexDirection: 'row',
    height: 53,
    maxWidth: 520,
    width: '100%',
  },
  iconFrame: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    width: 30,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  labelFocused: {
    color: theme.colors.companionBerry,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.72,
  },
  tabContent: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 15,
    height: 48,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 14,
  },
  tabContentFocused: {
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderWidth: 1,
    boxShadow: `0 4px 10px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  tabPressable: {
    alignItems: 'center',
    flex: 1,
    height: 53,
    justifyContent: 'center',
  },
});
