# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.2.0] - 2025-11-02

### 🎵 Added

- **IcecastMetadataService**: New service for processing ICY stream metadata
- **Direct Stream Metadata**: Extract metadata directly from live audio stream (ICY protocol)
- **Automatic Cover Art Enrichment**: Fetch album artwork from iTunes and MusicBrainz APIs
- **Smart Cover Caching**: Cache up to 100 album covers to minimize API calls
- **Real-time Metadata Updates**: ICY metadata events trigger immediate UI updates
- **iTunes API Integration**: Primary fast cover art source (<200ms response)
- **MusicBrainz/Cover Art Archive**: Fallback cover art source for better coverage
- **Image Cache-Busting**: Added `key` prop to force Image re-renders on cover changes
- **Source Type Detection**: UI now correctly switches between podcast and radio metadata based on `currentSource.type`

### 🔧 Changed

- **Metadata Architecture**: Switched from Socket.IO polling to direct ICY stream metadata
- **Metadata Event**: Now uses `Event.MetadataTimedReceived` from TrackPlayer for raw ICY data
- **Metadata Extraction**: Directly reads `event.metadata[0].title` for unparsed "Title - Artist - Year - Album" string
- **useSongMetadata Hook**: Refactored to listen to enriched ICY metadata from IcecastMetadataService only
- **Metadata Parsing**: Enhanced to handle "Title - Artist - Year - Album" format from stream
- **UI Component Logic**: Conditionally displays podcast metadata or radio metadata based on audio source type
- **ICY Listener Filter**: Only processes ICY metadata when actively playing radio stream URL

### 🐛 Fixed

- **Stream Sync Issues**: Metadata now always matches the actually playing song
- **Play/Pause Delays**: Eliminated metadata lag when pausing/resuming stream
- **Endpoint Sync Problems**: No more out-of-sync issues from polling separate endpoints
- **Notification Metadata**: Fixed metadata switching between radio and podcast sources
- **Cover Art Loading**: Improved reliability with caching and fallback sources
- **Timing Issues**: Removed `currentSource` check that was blocking metadata processing
- **UI Update Problems**: Fixed stale data by using live hook state instead of cached AudioSource object
- **Image Caching**: Added `key={url}` to force Image component updates when cover changes
- **Listener Notifications**: Fixed IcecastMetadataService properly notifying registered listeners
- **Podcast Metadata Interference**: ICY metadata now ignored when playing podcasts via `TrackPlayer.getActiveTrack()` check
- **UI Metadata Switching**: UI correctly shows podcast data when playing episodes, radio data when streaming

### ⚡ Performance Improvements

- **Reduced API Calls**: Cover art caching prevents repeated lookups for same songs
- **Faster Cover Loading**: iTunes API typically responds in <200ms
- **Eliminated Polling**: No more periodic status endpoint requests
- **Memory Optimization**: LRU cache with 100-song limit
- **Event-Driven Updates**: Only processes metadata when stream actually changes

### 📚 Documentation

- **README Updates**: Complete documentation of new ICY metadata architecture
- **Architecture Diagrams**: Visual flow from stream to UI components
- **API Integration Guide**: Examples for iTunes and MusicBrainz cover fetching
- **Metadata Flow Documentation**: Step-by-step metadata processing explanation
- **Testing Scripts**: Added `test-icy-metadata.js` for stream metadata verification
- **Debugging Guide**: Comprehensive logging for troubleshooting metadata issues

### 🔨 Technical Improvements

- **TypeScript**: Full type safety for IcecastMetadataService
- **Error Handling**: Graceful fallbacks for missing cover art with try-catch blocks
- **Code Organization**: Separated metadata enrichment from audio playback logic
- **Platform Support**: Works seamlessly on both Android (tested) and iOS
- **Observer Pattern**: Multiple listeners can subscribe to enriched metadata updates
- **Comprehensive Logging**: Added detailed console logs for debugging metadata flow

### 🗑️ Removed

- **Status Endpoint Polling**: No longer polls `/status-json.xsl`
- **Metadata Sync Delays**: Eliminated artificial polling intervals
- **Redundant Metadata Paths**: Streamlined to single source of truth (ICY stream)
- **Event.MetadataCommonReceived**: Switched to `MetadataTimedReceived` for raw metadata access
- **Socket.IO Dependency**: Completely removed Socket.IO connection (was used for listener counts)

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

| Version | Date       | Description                                      |
|---------|------------|--------------------------------------------------|
| 5.2.0   | 2025-11-02 | ICY metadata architecture with cover enrichment  |
| 5.1.0   | 2025-11-01 | Unified AudioManager with cross-platform support |
| 5.0.3   | 2025-10-XX | Enhanced audio controls and notifications        |
| 5.0.0   | 2025-09-XX | Initial React Native implementation              |

---

For more detailed information about each release, check the [GitHub releases](https://github.com/mlongano/WeberadioPlayer/releases) page.
