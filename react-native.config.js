module.exports = {
  dependencies: {
    'react-native-config': {
      platforms: {
        android: null, // disable Android platform auto linking
        ios: null, // disable iOS platform auto linking
      },
    },
  },
  // Completely exclude react-native-config from autolinking
  project: {
    android: {
      unstable_reactLegacyComponentNames: [ 'react-native-config' ],
    },
  },
};