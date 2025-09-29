const { getDefaultConfig } = require( 'expo/metro-config' );

const config = getDefaultConfig( __dirname );

// Exclude problematic packages from bundling
config.resolver.blockList = /node_modules\/react-native-config\/.*/;

module.exports = config;