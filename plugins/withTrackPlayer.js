const { withMainApplication, withAndroidManifest } = require('@expo/config-plugins');

/**
 * Config plugin to configure react-native-track-player for proper notification support
 */
const withTrackPlayer = (config) => {
  // Add MusicService initialization to MainApplication
  config = withMainApplication(config, (config) => {
    const mainApplication = config.modResults;
    let { contents } = mainApplication;

    // Add import for MusicService if not already present
    if (!contents.includes('import com.doublesymmetry.trackplayer.service.MusicService')) {
      // Find all import statements and add after the last one
      const importLines = contents.split('\n').filter(line => line.trim().startsWith('import '));
      if (importLines.length > 0) {
        const lastImportLine = importLines[importLines.length - 1];
        const lastImportIndex = contents.lastIndexOf(lastImportLine) + lastImportLine.length;
        contents = contents.slice(0, lastImportIndex) + '\nimport com.doublesymmetry.trackplayer.service.MusicService' + contents.slice(lastImportIndex);
      }
    }

    // Add service initialization if not already present
    if (!contents.includes('startService(android.content.Intent(this, MusicService::class.java))')) {
      // Find super.onCreate() and add after it
      const superOnCreateIndex = contents.indexOf('super.onCreate()');
      if (superOnCreateIndex !== -1) {
        const insertIndex = contents.indexOf('\n', superOnCreateIndex) + 1;
        const serviceInitCode = `    // Initialize TrackPlayer service early for notification support
    try {
      startService(android.content.Intent(this, MusicService::class.java))
    } catch (e: Exception) {
      android.util.Log.e("MainApplication", "Error starting MusicService", e)
    }
`;
        contents = contents.slice(0, insertIndex) + serviceInitCode + contents.slice(insertIndex);
      }
    }

    mainApplication.contents = contents;
    return config;
  });

  // Configure AndroidManifest for TrackPlayer
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];

    // Add MediaButtonReceiver if not already present
    const hasMediaButtonReceiver = application.receiver?.some(
      r => r.$['android:name'] === 'androidx.media.session.MediaButtonReceiver'
    );

    if (!hasMediaButtonReceiver) {
      if (!application.receiver) {
        application.receiver = [];
      }
      application.receiver.push({
        $: {
          'android:name': 'androidx.media.session.MediaButtonReceiver',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.MEDIA_BUTTON' } }],
          },
        ],
      });
    }

    // Add MusicService declaration if not already present
    const hasMusicService = application.service?.some(
      s => s.$['android:name'] === 'com.doublesymmetry.trackplayer.service.MusicService'
    );

    if (!hasMusicService) {
      if (!application.service) {
        application.service = [];
      }
      application.service.push({
        $: {
          'android:name': 'com.doublesymmetry.trackplayer.service.MusicService',
          'android:exported': 'true',
          'android:enabled': 'true',
          'android:foregroundServiceType': 'mediaPlayback',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.intent.action.MEDIA_BUTTON' } },
              { $: { 'android:name': 'androidx.media3.session.MediaSessionService' } },
            ],
          },
        ],
      });
    }

    return config;
  });

  return config;
};

module.exports = withTrackPlayer;
