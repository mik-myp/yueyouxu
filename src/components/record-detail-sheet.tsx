import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackgroundProps,
  type BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
import { Check, X } from 'lucide-react-native';
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
  const snapPoints = useMemo(
    () => [activeKind === 'symptoms' || activeKind === 'note' ? '62%' : '46%'],
    [activeKind],
  );
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
          marginBottom="l"
        >
          <Box>
            <Text variant="sectionTitle">{labels[activeKind]}</Text>
            <Text variant="caption">
              {isMulti ? '可以选择多项' : '选择后立即记录'}
            </Text>
          </Box>
          <Pressable
            accessibilityLabel="关闭"
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeButton}
          >
            <X color={theme.colors.textPrimary} size={21} />
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
                  key={option}
                  onPress={() => selectOption(option)}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <Text
                    style={isSelected ? styles.optionTextSelected : undefined}
                    variant="label"
                  >
                    {option}
                  </Text>
                  {isSelected ? (
                    <Check
                      color={theme.colors.periodAction}
                      size={17}
                      strokeWidth={2.2}
                    />
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
});
