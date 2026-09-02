const { withAppBuildGradle } = require('expo/config-plugins');

const KEYSTORE_VARIABLE = 'yueyouxuReleaseKeystorePath';

function addReleaseSigning(contents) {
  if (contents.includes(KEYSTORE_VARIABLE)) return contents;

  const signingConfigsMarker = '    signingConfigs {\n';
  const signingConfigsIndex = contents.indexOf(signingConfigsMarker);
  if (signingConfigsIndex < 0) {
    throw new Error('Android signingConfigs block was not found');
  }

  const releaseBlockIndex = contents.indexOf(
    '        release {',
    signingConfigsIndex,
  );
  const debugSigningLine = '            signingConfig signingConfigs.debug';
  const releaseSigningIndex = contents.indexOf(
    debugSigningLine,
    releaseBlockIndex,
  );
  if (releaseBlockIndex < 0 || releaseSigningIndex < 0) {
    throw new Error('Android release signing configuration was not found');
  }

  const releaseConfig = [
    `    def ${KEYSTORE_VARIABLE} = System.getenv("ANDROID_KEYSTORE_PATH")`,
    '    signingConfigs {',
    '        release {',
    `            if (${KEYSTORE_VARIABLE}) {`,
    `                storeFile file(${KEYSTORE_VARIABLE})`,
    '                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")',
    '                keyAlias System.getenv("ANDROID_KEY_ALIAS")',
    '                keyPassword System.getenv("ANDROID_KEY_PASSWORD")',
    '            }',
    '        }',
    '',
  ].join('\n');

  const withReleaseConfig =
    contents.slice(0, signingConfigsIndex) +
    releaseConfig +
    contents.slice(signingConfigsIndex + signingConfigsMarker.length);

  const adjustedReleaseSigningIndex =
    releaseSigningIndex + releaseConfig.length - signingConfigsMarker.length;
  return (
    withReleaseConfig.slice(0, adjustedReleaseSigningIndex) +
    '            signingConfig signingConfigs.release' +
    withReleaseConfig.slice(
      adjustedReleaseSigningIndex + debugSigningLine.length,
    )
  );
}

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    if (gradleConfig.modResults.language !== 'groovy') {
      throw new Error('Android release signing requires a Groovy build.gradle');
    }
    gradleConfig.modResults.contents = addReleaseSigning(
      gradleConfig.modResults.contents,
    );
    return gradleConfig;
  });
};

module.exports.addReleaseSigning = addReleaseSigning;
