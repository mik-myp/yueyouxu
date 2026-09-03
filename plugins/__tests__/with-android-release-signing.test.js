const {
  addReleaseSigning,
  enableLegacyPackaging,
} = require('../with-android-release-signing');

const buildGradle = `android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.debug
        }
    }
}`;

describe('withAndroidReleaseSigning', () => {
  it('adds environment-backed release credentials without changing debug signing', () => {
    const result = addReleaseSigning(buildGradle);

    expect(result).toContain(
      'def yueyouxuReleaseKeystorePath = System.getenv("ANDROID_KEYSTORE_PATH")',
    );
    expect(result).toContain(
      'storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")',
    );
    expect(result).toContain('keyAlias System.getenv("ANDROID_KEY_ALIAS")');
    expect(result).toContain(
      'keyPassword System.getenv("ANDROID_KEY_PASSWORD")',
    );
    expect(result).toContain(
      'debug {\n            signingConfig signingConfigs.debug',
    );
    expect(result).toContain(
      'release {\n            signingConfig signingConfigs.release',
    );
  });

  it('is idempotent', () => {
    const once = addReleaseSigning(buildGradle);
    expect(addReleaseSigning(once)).toBe(once);
  });
});

describe('enableLegacyPackaging', () => {
  it('enables compressed JNI packaging in the Android block', () => {
    const result = enableLegacyPackaging(buildGradle);

    expect(result).toContain(
      'packagingOptions {\n        jniLibs {\n            useLegacyPackaging true',
    );
  });

  it('is idempotent', () => {
    const once = enableLegacyPackaging(buildGradle);
    expect(enableLegacyPackaging(once)).toBe(once);
  });
});
