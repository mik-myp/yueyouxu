import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

import type { AndroidReleaseUpdate } from './github-release-update';

export type ApkDownloadProgress = {
  downloadedBytes: number;
  totalBytes: number;
};

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function downloadAndroidApk(
  update: AndroidReleaseUpdate,
  onProgress: (progress: ApkDownloadProgress) => void,
) {
  const cacheDirectory = FileSystem.cacheDirectory;
  if (!cacheDirectory) throw new Error('本地缓存目录不可用');

  const fileUri = `${cacheDirectory}yueyouxu-update-${safeFileName(update.fileName)}`;
  const task = FileSystem.createDownloadResumable(
    update.downloadUrl,
    fileUri,
    {
      sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
    },
    ({ totalBytesExpectedToWrite, totalBytesWritten }) => {
      onProgress({
        downloadedBytes: totalBytesWritten,
        totalBytes:
          totalBytesExpectedToWrite > 0
            ? totalBytesExpectedToWrite
            : update.fileSize,
      });
    },
  );

  const result = await task.downloadAsync();
  if (!result?.uri) throw new Error('APK 下载未完成');
  onProgress({
    downloadedBytes: update.fileSize,
    totalBytes: update.fileSize,
  });
  return result.uri;
}

export async function installAndroidApk(fileUri: string) {
  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
    type: 'application/vnd.android.package-archive',
  });
}
