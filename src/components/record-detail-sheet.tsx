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

import {
  Check,
  Drop,
  Heartbeat,
  NotePencil,
  Smiley,
  Sparkle,
  X,
  type Icon,
} from '@/components/soft-icons';
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
  mood: {
    accent: theme.colors.companionSage,
    icon: Smiley,
    wash: theme.colors.companionSageWash,
  },
  note: {
    accent: theme.colors.companionLavender,
    icon: NotePencil,
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
    if (activeKind === 'mood') return ['46%'];
    if (activeKind === 'note') return ['62%'];
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
  const selected = isMulti ? draft.symptoms : draft[activeKind];
  const meta = kindMeta[activeKind];
  const TitleIcon = meta.icon;

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
          <Box alignItems="center" flexDirection="row" gap="m">
            <Box
              alignItems="center"
              height={42}
              justifyContent="center"
              style={[styles.sheetTitleIcon, { backgroundColor: meta.wash }]}
              width={42}
            >
              <TitleIcon color={meta.accent} size={22} weight="duotone" />
            </Box>
            <Box>
              <Text style={styles.softTitle} variant="sectionTitle">
                {labels[activeKind]}
              </Text>
              <Text style={styles.softCaption} variant="caption">
                {activeKind === 'note'
                  ? '最多 200 字'
                  : isMulti
                    ? '可以选择多项'
                    : '选择后立即记录'}
              </Text>
            </Box>
          </Box>
          <Pressable
            accessibilityLabel="关闭"
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeButton}
          >
            <X color={theme.colors.companionInk} size={20} weight="bold" />
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
                style={[styles.noteInput, { borderColor: `${meta.accent}3D` }]}
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
                style={[styles.noteInput, { borderColor: `${meta.accent}3D` }]}
                value={noteDraft}
              />
            )}
            <Pressable
              accessibilityRole="button"
              onPress={saveNote}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
              ]}
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
                      style={[
                        styles.softCheck,
                        { backgroundColor: meta.accent },
                      ]}
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
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
    height: 44,
    justifyContent: 'center',
    width: 44,
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
  noteInput: {
    backgroundColor: theme.colors.companionCashmere,
    borderCurve: 'continuous',
    borderRadius: 15,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: 16,
    minHeight: 128,
    padding: 16,
    textAlignVertical: 'top',
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
  saveButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionBerry,
    borderColor: theme.colors.companionBerry,
    borderCurve: 'continuous',
    borderRadius: 15,
    borderWidth: 1,
    boxShadow: `0 5px 12px rgba(146, 36, 75, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
    height: 52,
    justifyContent: 'center',
    marginTop: 16,
  },
  saveText: {
    color: theme.colors.companionSurface,
    fontWeight: '700',
  },
  saveButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
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
