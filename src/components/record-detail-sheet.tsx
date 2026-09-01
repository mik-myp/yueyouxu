import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
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
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { Check, Sparkle, X } from '@/components/soft-icons';
import type { DailyRecordDraft, RecordKind } from '@/features/prototype/types';
import { Box, Text, theme } from '@/theme';

const labels: Record<RecordKind, string> = {
  flow: '流量',
  pain: '痛感',
  symptoms: '症状',
  mood: '心情',
  note: '备注',
};

const options: Partial<Record<RecordKind, string[]>> = {
  flow: ['点滴', '少量', '中量', '多量'],
  pain: ['无', '轻微', '中等', '严重'],
  symptoms: ['腰酸', '腹胀', '头痛', '乏力', '乳房胀痛'],
  mood: ['平静', '愉快', '低落', '焦虑', '烦躁'],
};

function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return <Animated.View style={[style, styles.sheetBackground]} />;
}

function SoftSheetBackground({ style }: BottomSheetBackgroundProps) {
  return <Animated.View style={[style, styles.softSheetBackground]} />;
}

function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View accessible={false} style={styles.handleContainer}>
      <View style={styles.handle} />
    </View>
  );
}

function SoftSheetHandle(_: BottomSheetHandleProps) {
  return (
    <View accessible={false} style={styles.handleContainer}>
      <View style={[styles.handle, styles.softHandle]} />
    </View>
  );
}

type RecordDetailSheetProps = {
  activeKind: RecordKind | null;
  draft: DailyRecordDraft;
  onChange: (draft: DailyRecordDraft) => void;
  onClose: () => void;
  onDismiss: () => void;
  onSingleSelect: () => void;
};

export const RecordDetailSheet = forwardRef<
  BottomSheetModal,
  RecordDetailSheetProps
>(function RecordDetailSheet(
  { activeKind, draft, onChange, onClose, onDismiss, onSingleSelect },
  ref,
) {
  const [noteDraft, setNoteDraft] = useState(draft.note);
  const snapPoints = useMemo(() => {
    if (activeKind === 'symptoms') return ['50%'];
    if (activeKind === 'note') return ['62%'];
    return ['46%'];
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
  const isSoftCompanion = activeKind === 'symptoms';
  const selected = isMulti ? draft.symptoms : draft[activeKind];

  function selectOption(option: string) {
    if (!activeKind || activeKind === 'note') return;

    if (activeKind === 'symptoms') {
      const next = draft.symptoms.includes(option)
        ? draft.symptoms.filter((item) => item !== option)
        : [...draft.symptoms, option];
      onChange({ ...draft, symptoms: next });
      return;
    }

    onChange({ ...draft, [activeKind]: option });
    onSingleSelect();
  }

  function saveNote() {
    Keyboard.dismiss();
    onChange({ ...draft, note: noteDraft.trim() });
    requestAnimationFrame(onSingleSelect);
  }

  return (
    <BottomSheetModal
      accessibilityLabel={null}
      accessibilityRole={null}
      accessible={false}
      backdropComponent={renderBackdrop}
      backgroundComponent={
        isSoftCompanion ? SoftSheetBackground : SheetBackground
      }
      enableDynamicSizing={false}
      handleComponent={isSoftCompanion ? SoftSheetHandle : SheetHandle}
      index={0}
      keyboardBehavior="interactive"
      onDismiss={onDismiss}
      ref={ref}
      snapPoints={snapPoints}
    >
      <BottomSheetView
        style={[styles.content, isSoftCompanion && styles.softContent]}
      >
        <Box
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
          marginBottom="l"
        >
          <Box alignItems="center" flexDirection="row" gap="m">
            {isSoftCompanion ? (
              <Box
                alignItems="center"
                backgroundColor="companionCashmere"
                height={42}
                justifyContent="center"
                style={styles.sheetTitleIcon}
                width={42}
              >
                <Sparkle
                  color={theme.colors.companionLavender}
                  size={22}
                  weight="duotone"
                />
              </Box>
            ) : null}
            <Box>
              <Text
                style={isSoftCompanion ? styles.softTitle : undefined}
                variant="sectionTitle"
              >
                {labels[activeKind]}
              </Text>
              <Text
                style={isSoftCompanion ? styles.softCaption : undefined}
                variant="caption"
              >
                {isMulti ? '可以选择多项' : '选择后立即记录'}
              </Text>
            </Box>
          </Box>
          <Pressable
            accessibilityLabel="关闭"
            accessibilityRole="button"
            onPress={onClose}
            style={[
              styles.closeButton,
              isSoftCompanion && styles.softCloseButton,
            ]}
          >
            <X
              color={
                isSoftCompanion
                  ? theme.colors.companionInk
                  : theme.colors.textPrimary
              }
              size={20}
              weight="bold"
            />
          </Pressable>
        </Box>

        {activeKind === 'note' ? (
          <>
            {Platform.OS === 'web' ? (
              <TextInput
                accessibilityLabel="备注"
                maxLength={200}
                multiline
                onChangeText={setNoteDraft}
                placeholder="记录今天想留下的内容"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.noteInput}
                value={noteDraft}
              />
            ) : (
              <BottomSheetTextInput
                accessibilityLabel="备注"
                maxLength={200}
                multiline
                onChangeText={setNoteDraft}
                placeholder="记录今天想留下的内容"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.noteInput}
                value={noteDraft}
              />
            )}
            <Pressable
              accessibilityRole="button"
              onPress={saveNote}
              style={styles.saveButton}
            >
              <Text style={styles.saveText}>完成</Text>
            </Pressable>
          </>
        ) : (
          <Box flexDirection="row" flexWrap="wrap" gap="s">
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
                    isSoftCompanion && styles.softOption,
                    isSelected &&
                      (isSoftCompanion
                        ? styles.softOptionSelected
                        : styles.optionSelected),
                    pressed && isSoftCompanion && styles.softOptionPressed,
                  ]}
                >
                  <Text
                    style={
                      isSelected
                        ? isSoftCompanion
                          ? styles.softOptionTextSelected
                          : styles.optionTextSelected
                        : isSoftCompanion
                          ? styles.softOptionText
                          : undefined
                    }
                    variant="label"
                  >
                    {option}
                  </Text>
                  {isSelected ? (
                    isSoftCompanion ? (
                      <View style={styles.softCheck}>
                        <Check
                          color={theme.colors.companionSurface}
                          size={13}
                          weight="bold"
                        />
                      </View>
                    ) : (
                      <Check
                        color={theme.colors.periodAction}
                        size={17}
                        weight="bold"
                      />
                    )
                  ) : null}
                </Pressable>
              );
            })}
          </Box>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  handle: {
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    height: 4,
    width: 38,
  },
  handleContainer: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
  },
  noteInput: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 16,
    minHeight: 128,
    padding: 16,
    textAlignVertical: 'top',
  },
  option: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    width: '48%',
  },
  optionSelected: {
    backgroundColor: '#FFF2F6',
    borderColor: theme.colors.periodAction,
  },
  optionTextSelected: {
    color: theme.colors.periodAction,
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.periodAction,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    marginTop: 16,
  },
  saveText: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  sheetBackground: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  },
  softCheck: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionLavender,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  softCloseButton: {
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  softContent: {
    paddingHorizontal: 20,
  },
  softHandle: {
    backgroundColor: theme.colors.companionCashmereStrong,
  },
  softOption: {
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 15,
    boxShadow: `0 5px 11px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
    height: 56,
  },
  softOptionPressed: {
    opacity: 0.78,
  },
  softOptionSelected: {
    backgroundColor: '#F0E8F5',
    borderColor: '#D8CBE4',
    boxShadow: `inset 0 2px 5px rgba(92, 71, 114, 0.16), 0 1px 2px ${theme.colors.companionHighlight}`,
  },
  softOptionText: {
    color: theme.colors.companionInk,
  },
  softOptionTextSelected: {
    color: theme.colors.companionLavender,
    fontWeight: '700',
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
