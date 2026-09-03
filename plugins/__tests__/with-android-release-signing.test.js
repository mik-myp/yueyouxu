const {
  addReleaseSigning,
  configureReleaseGradleProperties,
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

  it('overrides the dynamic Expo packaging setting', () => {
    const generatedBuildGradle = `android {
    packagingOptions {
        jniLibs {
            def enableLegacyPackaging = findProperty('expo.useLegacyPackaging') ?: 'false'
            useLegacyPackaging enableLegacyPackaging.toBoolean()
        }
    }
}`;

    expect(enableLegacyPackaging(generatedBuildGradle)).toContain(
      'useLegacyPackaging true',
    );
  });
});

describe('configureReleaseGradleProperties', () => {
  it('targets arm64 and enables release compression', () => {
    const result = configureReleaseGradleProperties([
      { type: 'property', key: 'reactNativeArchitectures', value: 'x86' },
      { type: 'empty' },
    ]);

    expect(result).toEqual([
      { type: 'property', key: 'reactNativeArchitectures', value: 'arm64-v8a' },
      { type: 'empty' },
      {
        type: 'property',
        key: 'android.enableBundleCompression',
        value: 'true',
      },
      { type: 'property', key: 'expo.useLegacyPackaging', value: 'true' },
    ]);
  });
});
