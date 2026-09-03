const GITHUB_LATEST_RELEASE_URL =
  'https://api.github.com/repos/mik-myp/yueyouxu/releases/latest';
const GITHUB_RELEASE_PAGE_URL =
  'https://github.com/mik-myp/yueyouxu/releases/latest';
const GITHUB_RELEASE_ASSETS_URL =
  'https://github.com/mik-myp/yueyouxu/releases/expanded_assets';

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

function releaseTagFromUrl(value: string): string | null {
  try {
    const url = new URL(value, 'https://github.com');
    const match = url.pathname.match(
      /^\/mik-myp\/yueyouxu\/releases\/tag\/(v?[0-9]+\.[0-9]+\.[0-9]+(?:[-+][^/]+)?)$/i,
    );
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function extractReleaseTag(page: string): string | null {
  const candidates = [
    page.match(
      /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i,
    )?.[1],
    page.match(/href=["']([^"']*\/releases\/tag\/v?[0-9.]+[^"']*)["']/i)?.[1],
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const tag = releaseTagFromUrl(candidate);
    if (tag) return tag;
  }
  return null;
}

function extractApkUrl(page: string, tag: string): string | null {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = page.match(
    new RegExp(
      `href=["']((?:https:\\/\\/github\\.com)?\\/mik-myp\\/yueyouxu\\/releases\\/download\\/${escapedTag}\\/[^"'<>\\s]+\\.apk)["']`,
      'i',
    ),
  );
  if (!match) return null;
  const url = match[1].startsWith('https://')
    ? match[1]
    : `https://github.com${match[1]}`;
  if (!isGithubDownloadUrl(url)) return null;
  return url.replace(/&amp;/g, '&');
}

async function checkViaReleasePage(
  currentVersion: string,
  fetchImpl: typeof fetch,
): Promise<AndroidReleaseUpdate> {
  let pageResponse: Response;
  try {
    pageResponse = await fetchImpl(GITHUB_RELEASE_PAGE_URL, {
      headers: { Accept: 'text/html' },
    });
  } catch {
    throw new UpdateCheckError('request-failed', 'Unable to reach GitHub');
  }
  if (pageResponse.status === 404) {
    throw new UpdateCheckError('not-found', 'No public release is available');
  }
  if (!pageResponse.ok) {
    throw new UpdateCheckError(
      'request-failed',
      `GitHub returned ${pageResponse.status}`,
    );
  }

  const page =
    typeof pageResponse.text === 'function' ? await pageResponse.text() : '';
  const latestTag =
    (typeof pageResponse.url === 'string' &&
      releaseTagFromUrl(pageResponse.url)) ||
    extractReleaseTag(page);
  if (!latestTag) {
    throw new UpdateCheckError('invalid-release', 'Release tag is missing');
  }

  let assetsResponse: Response;
  try {
    assetsResponse = await fetchImpl(
      `${GITHUB_RELEASE_ASSETS_URL}/${encodeURIComponent(latestTag)}`,
      { headers: { Accept: 'text/html' } },
    );
  } catch {
    throw new UpdateCheckError('request-failed', 'Unable to reach GitHub');
  }
  if (!assetsResponse.ok) {
    throw new UpdateCheckError(
      'request-failed',
      `GitHub returned ${assetsResponse.status}`,
    );
  }
  const assetPage =
    typeof assetsResponse.text === 'function'
      ? await assetsResponse.text()
      : '';
  const downloadUrl = extractApkUrl(assetPage, latestTag);
  if (!downloadUrl) {
    throw new UpdateCheckError(
      'missing-apk',
      'Release has no trusted APK asset',
    );
  }

  const latestVersion = normalizeVersion(latestTag);
  const normalizedCurrentVersion = normalizeVersion(currentVersion);
  if (!latestVersion || !normalizedCurrentVersion) {
    throw new UpdateCheckError('invalid-release', 'Release version is invalid');
  }
  return {
    available: isNewerVersion(latestVersion, normalizedCurrentVersion),
    downloadUrl,
    fileName: decodeURIComponent(downloadUrl.split('/').pop() ?? 'update.apk'),
    fileSize: 0,
    latestVersion,
    publishedAt: null,
    releaseUrl: `https://github.com/mik-myp/yueyouxu/releases/tag/${latestTag}`,
  };
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
    return checkViaReleasePage(currentVersion, fetchImpl);
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
