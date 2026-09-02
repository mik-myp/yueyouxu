import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackgroundProps,
  type BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type ComponentProps,
} from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  Check,
  Drop,
  Heartbeat,
  Sparkle,
  type Icon,
} from '@/components/soft-icons';
import type { DailyRecordDraft, RecordKind } from '@/features/prototype/types';
import { Box, Text, theme } from '@/theme';

const labels: Record<RecordKind, string> = {
  flow: '流量',
  pain: '痛感',
  symptoms: '症状',
};

const options: Partial<Record<RecordKind, string[]>> = {
  flow: ['点滴', '少量', '中量', '多量'],
  pain: ['无', '轻微', '中等', '严重'],
  symptoms: ['腰酸', '腹胀', '头痛', '乏力', '乳房胀痛'],
};

const kindMeta: Record<
  RecordKind,
  { accent: string; icon: Icon; wash: string }
> = {
  flow: {
    accent: theme.colors.companionBerry,
    icon: Drop,
    wash: theme.colors.companionBerryWash,
  },
  pain: {
    accent: theme.colors.companionApricot,
    icon: Heartbeat,
    wash: theme.colors.companionApricotWash,
  },
  symptoms: {
    accent: theme.colors.companionLavender,
    icon: Sparkle,
    wash: theme.colors.companionLavenderWash,
  },
};

function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return <Animated.View style={[style, styles.softSheetBackground]} />;
}

function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View accessible={false} style={styles.handleContainer}>
      <View style={styles.handle} />
    </View>
  );
}

type RecordDetailSheetProps = {
  activeKind: RecordKind | null;
  draft: DailyRecordDraft;
  onChange: (draft: DailyRecordDraft) => void;
  onConfirm: (draft: DailyRecordDraft) => void;
  onClose: () => void;
  onDismiss: () => void;
};

export const RecordDetailSheet = forwardRef<
  BottomSheetModal,
  RecordDetailSheetProps
>(function RecordDetailSheet(
  { activeKind, draft, onChange, onConfirm, onClose, onDismiss },
  ref,
) {
  const [pendingDraft, setPendingDraft] = useState(draft);
  const snapPoints = useMemo(() => {
    if (activeKind === 'symptoms') return ['50%'];
    return ['38%'];
  }, [activeKind]);
  const renderBackdrop = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.28}
        pressBehavior="close"
      />
    ),
    [],
  );

  if (!activeKind) return null;

  const isMulti = activeKind === 'symptoms';
  const selected = isMulti ? pendingDraft.symptoms : pendingDraft[activeKind];
  const meta = kindMeta[activeKind];
  const TitleIcon = meta.icon;

  function selectOption(option: string) {
    if (!activeKind) return;

    if (activeKind === 'symptoms') {
      const next = pendingDraft.symptoms.includes(option)
        ? pendingDraft.symptoms.filter((item) => item !== option)
        : [...pendingDraft.symptoms, option];
      setPendingDraft({ ...pendingDraft, symptoms: next });
      return;
    }

    setPendingDraft({ ...pendingDraft, [activeKind]: option });
  }

  function confirmChanges() {
    Keyboard.dismiss();
    onChange(pendingDraft);
    onConfirm(pendingDraft);
    requestAnimationFrame(onClose);
  }

  function cancelChanges() {
    Keyboard.dismiss();
    onClose();
  }

  return (
    <BottomSheetModal
      accessibilityLabel={null}
      accessibilityRole={null}
      accessible={false}
      backdropComponent={renderBackdrop}
      backgroundComponent={SheetBackground}
      enableDynamicSizing={false}
      handleComponent={SheetHandle}
      index={0}
      keyboardBehavior="interactive"
      onDismiss={onDismiss}
      ref={ref}
      snapPoints={snapPoints}
    >
      <BottomSheetView style={styles.content}>
        <Box
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
          style={styles.actionBar}
        >
          <Pressable
            accessibilityRole="button"
            onPress={cancelChanges}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Text style={styles.cancelText}>取消</Text>
          </Pressable>
          <Box alignItems="center" flexDirection="row" gap="s">
            <Box
              alignItems="center"
              height={34}
              justifyContent="center"
              style={[styles.sheetTitleIcon, { backgroundColor: meta.wash }]}
              width={34}
            >
              <TitleIcon color={meta.accent} size={19} weight="duotone" />
            </Box>
            <Text style={styles.softTitle} variant="sectionTitle">
              {labels[activeKind]}
            </Text>
          </Box>
          <Pressable
            accessibilityRole="button"
            onPress={confirmChanges}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Text style={styles.confirmText}>确认</Text>
          </Pressable>
        </Box>
        <Text style={styles.softCaption} variant="caption">
          {isMulti ? '可以选择多项，确认后保存' : '选择一项，确认后保存'}
        </Text>

        <Box flexDirection="row" flexWrap="wrap" gap="s" marginTop="l">
          {options[activeKind]?.map((option) => {
            const isSelected = Array.isArray(selected)
              ? selected.includes(option)
              : selected === option;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={option}
                onPress={() => selectOption(option)}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: meta.wash },
                  isSelected && [
                    styles.optionSelected,
                    {
                      borderColor: `${meta.accent}55`,
                      boxShadow: `inset 0 2px 5px ${meta.accent}24, 0 1px 2px ${theme.colors.companionHighlight}`,
                    },
                  ],
                  pressed && styles.optionPressed,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && [
                      styles.optionTextSelected,
                      { color: meta.accent },
                    ],
                  ]}
                  variant="label"
                >
                  {option}
                </Text>
                {isSelected ? (
                  <View
                    style={[styles.softCheck, { backgroundColor: meta.accent }]}
                  >
                    <Check
                      color={theme.colors.companionSurface}
                      size={13}
                      weight="bold"
                    />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </Box>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  actionBar: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    minWidth: 56,
  },
  actionPressed: {
    opacity: 0.58,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  confirmText: {
    color: theme.colors.companionBerry,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  handle: {
    backgroundColor: theme.colors.companionCashmereStrong,
    borderRadius: 2,
    height: 4,
    width: 38,
  },
  handleContainer: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
  },
  option: {
    alignItems: 'center',
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 15,
    borderWidth: 1,
    boxShadow: `0 5px 11px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    width: '48%',
  },
  optionSelected: {
    borderWidth: 1.5,
  },
  optionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
  optionText: {
    color: theme.colors.companionInk,
  },
  optionTextSelected: {
    fontWeight: '700',
  },
  sheetTitleIcon: {
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 15,
    borderWidth: 1,
    boxShadow: `0 4px 10px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  softCaption: {
    color: theme.colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  softCheck: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  softSheetBackground: {
    backgroundColor: theme.colors.companionSurface,
    borderCurve: 'continuous',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    boxShadow: `0 -8px 28px rgba(84, 59, 69, 0.12)`,
  },
  softTitle: {
    color: theme.colors.companionInk,
  },
});
