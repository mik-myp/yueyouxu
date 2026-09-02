import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';

import {
  ArrowClockwise,
  CalendarHeart,
  DownloadSimple,
  GithubLogo,
} from '@/components/soft-icons';

import { Page } from '@/components/page';
import { PrimaryButton } from '@/components/primary-button';
import { SettingsDetailHeader } from '@/components/settings-detail-header';
import {
  type AndroidReleaseUpdate,
  checkForAndroidUpdate,
  UpdateCheckError,
} from '@/services/github-release-update';
import { Box, Text, theme } from '@/theme';

type UpdateState =
  | { kind: 'available'; update: AndroidReleaseUpdate }
  | { kind: 'checking' }
  | { kind: 'current'; version: string }
  | { kind: 'error'; message: string }
  | { kind: 'idle' };

const currentVersion = Constants.expoConfig?.version ?? '0.1.0';

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return 'APK 安装包';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB APK`;
}

function updateErrorMessage(error: unknown): string {
  if (!(error instanceof UpdateCheckError))
    return '无法连接 GitHub，请检查网络后重试';
  if (error.code === 'not-found') return '暂未发布可下载的 Android 版本';
  if (error.code === 'rate-limited') return '检查次数暂时受限，请稍后再试';
  if (error.code === 'missing-apk') return '最新版本暂未提供 Android 安装包';
  return '更新信息不可用，请稍后再试';
}

export default function AboutScreen() {
  const [updateState, setUpdateState] = useState<UpdateState>({ kind: 'idle' });
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const supportsAndroidUpdates =
    Platform.OS === 'android' || Platform.OS === 'web';

  const handleCheckForUpdate = async () => {
    if (updateState.kind === 'checking') return;
    setDownloadError(null);
    setUpdateState({ kind: 'checking' });
    try {
      const update = await checkForAndroidUpdate(currentVersion);
      setUpdateState(
        update.available
          ? { kind: 'available', update }
          : { kind: 'current', version: update.latestVersion },
      );
    } catch (error) {
      setUpdateState({ kind: 'error', message: updateErrorMessage(error) });
    }
  };

  const handleDownload = async (update: AndroidReleaseUpdate) => {
    setDownloadError(null);
    try {
      await Linking.openURL(update.downloadUrl);
    } catch {
      setDownloadError('无法打开下载链接，请稍后再试');
    }
  };

  return (
    <Page>
      <ScrollView contentContainerStyle={styles.content} tabIndex={0}>
        <SettingsDetailHeader title="关于月有序" />

        <Box alignItems="center" marginTop="xxl" paddingHorizontal="page">
          <Box
            alignItems="center"
            height={72}
            justifyContent="center"
            style={styles.appIcon}
            width={72}
          >
            <CalendarHeart
              color={theme.colors.companionBerry}
              size={37}
              weight="duotone"
            />
          </Box>
          <Text marginTop="m" variant="sectionTitle">
            月有序
          </Text>
          <Text marginTop="xs" variant="caption">
            经期记录与周期观察
          </Text>
        </Box>

        <Box marginTop="xxl" style={styles.versionRow}>
          <Text variant="body">版本</Text>
          <Text variant="label">{currentVersion}</Text>
        </Box>

        {supportsAndroidUpdates ? (
          <Box marginTop="xl" style={styles.updateSection}>
            <Box alignItems="center" flexDirection="row">
              <Box
                alignItems="center"
                height={40}
                justifyContent="center"
                style={styles.githubIcon}
                width={40}
              >
                <GithubLogo
                  color={theme.colors.companionInk}
                  size={22}
                  weight="duotone"
                />
              </Box>
              <Box flex={1} marginLeft="m">
                <Text variant="body">Android 更新</Text>
                <Text marginTop="xs" variant="caption">
                  仅在手动检查时连接 GitHub
                </Text>
              </Box>
            </Box>

            <Box marginTop="l">
              {updateState.kind === 'available' ? (
                <>
                  <Text accessibilityLiveRegion="polite" variant="sectionTitle">
                    发现新版本 {updateState.update.latestVersion}
                  </Text>
                  <Text marginTop="xs" variant="caption">
                    {formatFileSize(updateState.update.fileSize)} ·
                    下载后由系统确认安装
                  </Text>
                  <Box marginTop="m">
                    <PrimaryButton
                      icon={DownloadSimple}
                      label="下载更新"
                      onPress={() => handleDownload(updateState.update)}
                    />
                  </Box>
                </>
              ) : (
                <>
                  {updateState.kind === 'current' ? (
                    <Text
                      accessibilityLiveRegion="polite"
                      style={styles.successText}
                      variant="label"
                    >
                      已是最新版本 {updateState.version}
                    </Text>
                  ) : null}
                  {updateState.kind === 'error' ? (
                    <Text
                      accessibilityLiveRegion="polite"
                      style={styles.errorText}
                      variant="label"
                    >
                      {updateState.message}
                    </Text>
                  ) : null}
                  <Box
                    marginTop={
                      updateState.kind === 'current' ||
                      updateState.kind === 'error'
                        ? 'm'
                        : 'none'
                    }
                  >
                    <PrimaryButton
                      disabled={updateState.kind === 'checking'}
                      icon={ArrowClockwise}
                      label={
                        updateState.kind === 'checking'
                          ? '正在检查…'
                          : '检查更新'
                      }
                      onPress={handleCheckForUpdate}
                      tone="neutral"
                    />
                  </Box>
                </>
              )}
              {downloadError ? (
                <Text
                  accessibilityLiveRegion="polite"
                  marginTop="s"
                  style={styles.errorText}
                  variant="caption"
                >
                  {downloadError}
                </Text>
              ) : null}
            </Box>
          </Box>
        ) : null}
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  appIcon: {
    backgroundColor: theme.colors.companionBerryWash,
    borderColor: theme.colors.companionBerrySoft,
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: `0 5px 14px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  content: {
    paddingBottom: 48,
    paddingTop: 16,
  },
  errorText: {
    color: theme.colors.periodAction,
  },
  githubIcon: {
    backgroundColor: theme.colors.companionCashmere,
    borderColor: theme.colors.companionHighlight,
    borderCurve: 'continuous',
    borderRadius: 13,
    borderWidth: 1,
    boxShadow: `0 3px 8px ${theme.colors.companionShadow}, inset 0 1px 0 ${theme.colors.companionHighlight}`,
  },
  successText: {
    color: theme.colors.companionSage,
  },
  updateSection: {
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  versionRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.companionSurface,
    borderBottomColor: theme.colors.companionCashmereStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.companionCashmereStrong,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 20,
  },
});
