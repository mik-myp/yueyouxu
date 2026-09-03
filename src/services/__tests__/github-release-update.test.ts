import {
  checkForAndroidUpdate,
  isNewerVersion,
  normalizeVersion,
  UpdateCheckError,
} from '@/services/github-release-update';

const apkAsset = {
  browser_download_url:
    'https://github.com/mik-myp/yueyouxu/releases/download/v0.2.0/yueyouxu-v0.2.0.apk',
  name: 'yueyouxu-v0.2.0.apk',
  size: 24_000_000,
};

function githubResponse(body: unknown, status = 200): Response {
  return {
    json: jest.fn().mockResolvedValue(body),
    ok: status >= 200 && status < 300,
    status,
  } as unknown as Response;
}

describe('GitHub Android release updates', () => {
  it('normalizes release tags and compares semantic versions', () => {
    expect(normalizeVersion('v0.2.0')).toBe('0.2.0');
    expect(isNewerVersion('v0.2.0', '0.1.9')).toBe(true);
    expect(isNewerVersion('v0.1.0', '0.1.0')).toBe(false);
    expect(isNewerVersion('invalid', '0.1.0')).toBe(false);
  });

  it('returns the trusted APK when a newer release exists', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      githubResponse({
        assets: [apkAsset],
        html_url: 'https://github.com/mik-myp/yueyouxu/releases/tag/v0.2.0',
        published_at: '2026-09-02T08:00:00Z',
        tag_name: 'v0.2.0',
      }),
    );

    await expect(checkForAndroidUpdate('0.1.0', fetchImpl)).resolves.toEqual({
      available: true,
      downloadUrl: apkAsset.browser_download_url,
      fileName: apkAsset.name,
      fileSize: apkAsset.size,
      latestVersion: '0.2.0',
      publishedAt: '2026-09-02T08:00:00Z',
      releaseUrl: 'https://github.com/mik-myp/yueyouxu/releases/tag/v0.2.0',
    });
  });

  it('reports when the installed version is current', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        githubResponse({ assets: [apkAsset], tag_name: 'v0.2.0' }),
      );
    const result = await checkForAndroidUpdate('0.2.0', fetchImpl);
    expect(result.available).toBe(false);
  });

  it('rejects releases without an APK from the expected repository', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      githubResponse({
        assets: [
          {
            ...apkAsset,
            browser_download_url: 'https://example.com/untrusted.apk',
          },
        ],
        tag_name: 'v0.2.0',
      }),
    );

    await expect(
      checkForAndroidUpdate('0.1.0', fetchImpl),
    ).rejects.toMatchObject<Partial<UpdateCheckError>>({ code: 'missing-apk' });
  });

  it('distinguishes a missing public release from a request failure', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(githubResponse({}, 404));
    await expect(
      checkForAndroidUpdate('0.1.0', fetchImpl),
    ).rejects.toMatchObject<Partial<UpdateCheckError>>({ code: 'not-found' });
  });

  it('falls back to the public release page when the API is rate limited', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(githubResponse({}, 403))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('<html>latest release</html>'),
        url: 'https://github.com/mik-myp/yueyouxu/releases/tag/v0.2.0',
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest
          .fn()
          .mockResolvedValue(
            '<a href="/mik-myp/yueyouxu/releases/download/v0.2.0/yueyouxu-v0.2.0.apk">APK</a>',
          ),
      });

    await expect(checkForAndroidUpdate('0.1.0', fetchImpl)).resolves.toEqual({
      available: true,
      downloadUrl: apkAsset.browser_download_url,
      fileName: apkAsset.name,
      fileSize: 0,
      latestVersion: '0.2.0',
      publishedAt: null,
      releaseUrl: 'https://github.com/mik-myp/yueyouxu/releases/tag/v0.2.0',
    });
  });

  it('reports a network failure without exposing fetch details', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('offline'));
    await expect(
      checkForAndroidUpdate('0.1.0', fetchImpl),
    ).rejects.toMatchObject<Partial<UpdateCheckError>>({
      code: 'request-failed',
      message: 'Unable to reach GitHub',
    });
  });

  it('aborts an update request after fifteen seconds', async () => {
    jest.useFakeTimers();
    const fetchImpl = jest.fn().mockImplementation(
      (_input: Parameters<typeof fetch>[0], init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new Error('aborted')),
          );
        }),
    );

    const assertion = expect(
      checkForAndroidUpdate('0.1.0', fetchImpl),
    ).rejects.toMatchObject<Partial<UpdateCheckError>>({
      code: 'request-failed',
    });
    await jest.advanceTimersByTimeAsync(15_000);
    await assertion;
    jest.useRealTimers();
  });
});
