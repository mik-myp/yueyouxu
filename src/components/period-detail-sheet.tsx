import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Check } from '@/components/soft-icons';
import type { Period } from '@/domain/models';
import { Box, Text, theme } from '@/theme';

function Background({ style }: BottomSheetBackgroundProps) {
  return <Animated.View style={[style, styles.background]} />;
}

export type PeriodEditAction = 'start' | 'end' | 'delete';

export const PeriodDetailSheet = forwardRef<
  BottomSheetModal,
  {
    onCancel: () => void;
    onConfirm: (period: Period, action: PeriodEditAction) => void;
    period: Period | null;
    selectedDate: string;
  }
>(function PeriodDetailSheet(
  { onCancel, onConfirm, period, selectedDate },
  ref,
) {
  const [pendingAction, setPendingAction] = useState<PeriodEditAction | null>(
    null,
  );
  const backdrop = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} opacity={0.28} pressBehavior="close" />
    ),
    [],
  );
  if (!period) return null;

  function confirm() {
    if (!pendingAction || !period) return;
    onConfirm(period, pendingAction);
    setPendingAction(null);
  }

  return (
    <BottomSheetModal
      accessibilityLabel={null}
      accessibilityRole={null}
      accessible={false}
      backdropComponent={backdrop}
      backgroundComponent={Background}
      enableDynamicSizing={false}
      handleComponent={() => (
        <View accessible={false} style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
      )}
      index={0}
      onDismiss={() => setPendingAction(null)}
      ref={ref}
      snapPoints={['47%']}
    >
      <BottomSheetView style={styles.content}>
        <Box
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
        >
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={styles.action}
          >
            <Text variant="label">取消</Text>
          </Pressable>
          <Text variant="sectionTitle">修正经期</Text>
          <Pressable
            accessibilityRole="button"
            disabled={!pendingAction}
            onPress={confirm}
            style={[styles.action, !pendingAction && styles.disabled]}
          >
            <Text style={styles.confirmText} variant="label">
              确认
            </Text>
          </Pressable>
        </Box>
        <Text marginTop="s" textAlign="center" variant="caption">
          选择要对 {formatDate(selectedDate)} 执行的操作，确认后保存
        </Text>
        <Box gap="m" marginTop="xl">
          <SheetButton
            label="设为开始日"
            onPress={() => setPendingAction('start')}
            selected={pendingAction === 'start'}
          />
          <SheetButton
            label="设为结束日"
            onPress={() => setPendingAction('end')}
            selected={pendingAction === 'end'}
          />
          <SheetButton
            destructive
            label="删除本次经期"
            onPress={() => setPendingAction('delete')}
            selected={pendingAction === 'delete'}
          />
        </Box>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

function SheetButton({
  destructive,
  label,
  onPress,
  selected,
}: {
  destructive?: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        destructive && styles.destructive,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={destructive ? styles.destructiveText : styles.buttonText}>
        {label}
      </Text>
      {selected ? (
        <View style={[styles.check, destructive && styles.destructiveCheck]}>
          <Check
            color={theme.colors.companionSurface}
            size={13}
            weight="bold"
          />
        </View>
      ) : null}
    </Pressable>
  );
}

function formatDate(value: string) {
  const [, month, day] = value.split('-').map(Number);
  return `${month}月${day}日`;
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    minWidth: 56,
  },
  background: {
    backgroundColor: theme.colors.companionSurface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 52,
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.companionInk,
    fontSize: 15,
    fontWeight: '700',
  },
  check: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionBerry,
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  confirmText: {
    color: theme.colors.companionBerry,
  },
  content: { paddingBottom: 32, paddingHorizontal: 20 },
  destructive: {
    backgroundColor: theme.colors.companionBerryWash,
    borderColor: theme.colors.companionBerrySoft,
  },
  destructiveCheck: {
    backgroundColor: theme.colors.periodAction,
  },
  destructiveText: {
    color: theme.colors.periodAction,
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: { opacity: 0.35 },
  handle: {
    backgroundColor: theme.colors.companionCashmereStrong,
    borderRadius: 2,
    height: 4,
    width: 38,
  },
  handleContainer: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  selected: {
    borderColor: theme.colors.companionBerry,
  },
});
