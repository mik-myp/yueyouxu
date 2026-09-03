import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

import type { AndroidReleaseUpdate } from './github-release-update';

export type ApkDownloadProgress = {
  downloadedBytes: number;
  totalBytes: number;
};

export type ApkDownloadSnapshot =
  | { kind: 'idle' }
  | ({ kind: 'downloading' } & ApkDownloadProgress & {
        update: AndroidReleaseUpdate;
      })
  | ({ kind: 'ready' } & ApkDownloadProgress & {
        fileUri: string;
        update: AndroidReleaseUpdate;
      })
  | { kind: 'error'; message: string; update: AndroidReleaseUpdate };

type DownloadListener = (snapshot: ApkDownloadSnapshot) => void;

let snapshot: ApkDownloadSnapshot = { kind: 'idle' };
let activePromise: Promise<string> | null = null;
const listeners = new Set<DownloadListener>();

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function publish(next: ApkDownloadSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener(snapshot));
}

export function getDownloadSnapshot() {
  return snapshot;
}

export function subscribeDownload(listener: DownloadListener) {
  listeners.add(listener);
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

async function resolveDownloadUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });
    if (response.ok && response.url?.startsWith('https://')) {
      return response.url;
    }
  } catch {
    // The original GitHub URL remains a valid fallback when HEAD is blocked.
  } finally {
    clearTimeout(timeout);
  }
  return url;
}

export function startAndroidApkDownload(
  update: AndroidReleaseUpdate,
): Promise<string> {
  if (
    activePromise &&
    snapshot.kind === 'downloading' &&
    snapshot.update.downloadUrl === update.downloadUrl
  ) {
    return activePromise;
  }
  if (
    snapshot.kind === 'ready' &&
    snapshot.update.downloadUrl === update.downloadUrl
  ) {
    return Promise.resolve(snapshot.fileUri);
  }

  const cacheDirectory = FileSystem.cacheDirectory;
  if (!cacheDirectory) {
    const error = Promise.reject(new Error('本地缓存目录不可用'));
    publish({ kind: 'error', message: '本地缓存目录不可用', update });
    return error;
  }

  const fileUri = `${cacheDirectory}yueyouxu-update-${safeFileName(update.fileName)}`;
  publish({
    downloadedBytes: 0,
    kind: 'downloading',
    totalBytes: update.fileSize,
    update,
  });

  let lastPublishedAt = 0;
  const taskPromise = resolveDownloadUrl(update.downloadUrl)
    .then((downloadUrl) => {
      const task = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        { sessionType: FileSystem.FileSystemSessionType.BACKGROUND },
        ({ totalBytesExpectedToWrite, totalBytesWritten }) => {
          const totalBytes =
            totalBytesExpectedToWrite > 0
              ? totalBytesExpectedToWrite
              : update.fileSize;
          const now = Date.now();
          if (now - lastPublishedAt < 200 && totalBytesWritten < totalBytes) {
            return;
          }
          lastPublishedAt = now;
          publish({
            downloadedBytes: totalBytesWritten,
            kind: 'downloading',
            totalBytes,
            update,
          });
        },
      );
      return task.downloadAsync();
    })
    .then((result) => {
      if (!result?.uri) throw new Error('APK 下载未完成');
      const totalBytes =
        snapshot.kind === 'downloading' && snapshot.totalBytes > 0
          ? snapshot.totalBytes
          : update.fileSize;
      publish({
        downloadedBytes: totalBytes,
        fileUri: result.uri,
        kind: 'ready',
        totalBytes,
        update,
      });
      return result.uri;
    })
    .catch((error: unknown) => {
      publish({
        kind: 'error',
        message: error instanceof Error ? error.message : 'APK 下载失败',
        update,
      });
      throw error;
    })
    .finally(() => {
      activePromise = null;
    });

  activePromise = taskPromise;
  return taskPromise;
}

/** Backwards-compatible one-shot API for callers that need progress callbacks. */
export async function downloadAndroidApk(
  update: AndroidReleaseUpdate,
  onProgress: (progress: ApkDownloadProgress) => void,
) {
  const unsubscribe = subscribeDownload((next) => {
    if (
      (next.kind === 'downloading' || next.kind === 'ready') &&
      next.update.downloadUrl === update.downloadUrl
    ) {
      onProgress({
        downloadedBytes: next.downloadedBytes,
        totalBytes: next.totalBytes,
      });
    }
  });
  try {
    return await startAndroidApkDownload(update);
  } finally {
    unsubscribe();
  }
}

export async function installAndroidApk(fileUri: string) {
  const contentUri = await FileSystem.getContentUriAsync(fileUri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1,
    type: 'application/vnd.android.package-archive',
  });
}
