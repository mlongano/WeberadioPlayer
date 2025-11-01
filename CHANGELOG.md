# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.1.0] - 2025-11-01

### 🎵 Added

- **Unified AudioManager**: Single cross-platform audio management system
- **iOS Video Integration**: AudioManager now controls Video components on iOS
- **Video Ref Management**: Automatic registration and cleanup of Video component references
- **Enhanced iOS Streaming**: Improved Video component configuration for streaming audio
- **Cross-Platform Consistency**: Same AudioManager API works on Android and iOS

### 🔧 Changed

- **AudioManager Architecture**: Extended to handle both TrackPlayer (Android) and Video components (iOS)
- **iOS Playback Control**: Replaced separate Video implementations with unified AudioManager control
- **Video Component Configuration**: Enhanced with proper headers, buffering, and error handling
- **State Management**: Unified audio state synchronization across platforms

### 🐛 Fixed

- **iOS Audio Playback**: Resolved separate implementation issues with unified AudioManager
- **Cross-Platform Audio**: Fixed inconsistent audio behavior between Android and iOS
- **Video Component Errors**: Improved error handling and logging for iOS streaming
- **Memory Management**: Better cleanup of Video component references

### 📚 Documentation

- **README Updates**: Comprehensive AudioManager documentation with iOS integration details
- **iOS Streaming Guide**: Added troubleshooting section for MediaToolbox errors
- **Cross-Platform Architecture**: Detailed explanation of unified audio system

### 🔨 Technical Improvements

- **TypeScript**: Enhanced type safety for Video component integration
- **Error Handling**: Comprehensive logging for audio playback issues
- **Performance**: Optimized Video component configuration for streaming
- **Code Organization**: Cleaner separation of platform-specific implementations

## [5.0.3] - 2025-10-XX

### Added

- Live radio streaming with real-time metadata
- Podcast episode playback
- Background audio playback
- Notification panel controls

### Changed

- Improved audio focus management
- Enhanced notification metadata updates

### Fixed

- TrackPlayer notification control issues
- Audio source switching conflicts

## [5.0.0] - 2025-09-XX

### Initial Features

- Initial React Native app with Expo
- Basic audio playback functionality
- Cross-platform Android and iOS support

### Migration Changes

- Migrated from previous implementation
- Updated to latest React Native and Expo versions

---

## Types of changes

- `🎵 Added` for new features
- `🔧 Changed` for changes in existing functionality
- `🐛 Fixed` for any bug fixes
- `🗑️ Removed` for now removed features
- `🚨 Breaking` for breaking changes
- `📚 Documentation` for documentation updates
- `🔨 Technical Improvements` for technical enhancements

## Version History

| Version | Date       | Description                              |
|---------|------------|------------------------------------------|
| 5.1.0   | 2025-11-01 | Unified AudioManager with cross-platform support |
| 5.0.3   | 2025-10-XX | Enhanced audio controls and notifications     |
| 5.0.0   | 2025-09-XX | Initial React Native implementation          |

---

For more detailed information about each release, check the [GitHub releases](https://github.com/mlongano/WeberadioPlayer/releases) page.
