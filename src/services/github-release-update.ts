const GITHUB_LATEST_RELEASE_URL =
  'https://api.github.com/repos/mik-myp/yueyouxu/releases/latest';

type GithubReleaseAsset = {
  browser_download_url?: unknown;
  name?: unknown;
  size?: unknown;
};

type GithubReleaseResponse = {
  assets?: unknown;
  html_url?: unknown;
  published_at?: unknown;
  tag_name?: unknown;
};

export type AndroidReleaseUpdate = {
  available: boolean;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  latestVersion: string;
  publishedAt: string | null;
  releaseUrl: string;
};

export type UpdateCheckErrorCode =
  | 'invalid-release'
  | 'missing-apk'
  | 'not-found'
  | 'rate-limited'
  | 'request-failed';

export class UpdateCheckError extends Error {
  constructor(
    public readonly code: UpdateCheckErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'UpdateCheckError';
  }
}

function parseVersion(value: string): [number, number, number] | null {
  const match = value.trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/i);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function normalizeVersion(value: string): string | null {
  const parsed = parseVersion(value);
  return parsed ? parsed.join('.') : null;
}

export function isNewerVersion(candidate: string, current: string): boolean {
  const candidateParts = parseVersion(candidate);
  const currentParts = parseVersion(current);
  if (!candidateParts || !currentParts) return false;

  for (let index = 0; index < candidateParts.length; index += 1) {
    if (candidateParts[index] === currentParts[index]) continue;
    return candidateParts[index] > currentParts[index];
  }
  return false;
}

function isGithubDownloadUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'github.com' &&
      url.pathname.startsWith('/mik-myp/yueyouxu/releases/download/')
    );
  } catch {
    return false;
  }
}

export async function checkForAndroidUpdate(
  currentVersion: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AndroidReleaseUpdate> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  try {
    response = await fetchImpl(GITHUB_LATEST_RELEASE_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: controller.signal,
    });
  } catch {
    throw new UpdateCheckError('request-failed', 'Unable to reach GitHub');
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    throw new UpdateCheckError('not-found', 'No public release is available');
  }
  if (response.status === 403 || response.status === 429) {
    throw new UpdateCheckError('rate-limited', 'GitHub rate limit reached');
  }
  if (!response.ok) {
    throw new UpdateCheckError(
      'request-failed',
      `GitHub returned ${response.status}`,
    );
  }

  const release = (await response.json()) as GithubReleaseResponse;
  if (typeof release.tag_name !== 'string') {
    throw new UpdateCheckError('invalid-release', 'Release tag is missing');
  }

  const latestVersion = normalizeVersion(release.tag_name);
  const normalizedCurrentVersion = normalizeVersion(currentVersion);
  if (!latestVersion || !normalizedCurrentVersion) {
    throw new UpdateCheckError('invalid-release', 'Release version is invalid');
  }

  const assets = Array.isArray(release.assets)
    ? (release.assets as GithubReleaseAsset[])
    : [];
  const apk = assets.find(
    (asset) =>
      typeof asset.name === 'string' &&
      asset.name.toLowerCase().endsWith('.apk'),
  );
  if (
    !apk ||
    typeof apk.name !== 'string' ||
    typeof apk.browser_download_url !== 'string' ||
    !isGithubDownloadUrl(apk.browser_download_url)
  ) {
    throw new UpdateCheckError(
      'missing-apk',
      'Release has no trusted APK asset',
    );
  }

  return {
    available: isNewerVersion(latestVersion, normalizedCurrentVersion),
    downloadUrl: apk.browser_download_url,
    fileName: apk.name,
    fileSize: typeof apk.size === 'number' ? apk.size : 0,
    latestVersion,
    publishedAt:
      typeof release.published_at === 'string' ? release.published_at : null,
    releaseUrl: typeof release.html_url === 'string' ? release.html_url : '',
  };
}
