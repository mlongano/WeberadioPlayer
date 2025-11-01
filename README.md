# WeBe Radio Player

A cross-platform React Native radio player app built with Expo, featuring live radio streaming, podcast playback, and comprehensive audio management.

## 🚀 Features

- **Live Radio Streaming**: Stream WeBe Radio with real-time song metadata
- **Podcast Support**: Play episodes from various schools/podcasters
- **Cross-Platform**: Native Android and iOS support
- **Background Playback**: Continue listening with notification controls
- **Dynamic Notifications**: Notification panel updates with current track info
- **Unified Audio Management**: Centralized system for handling multiple audio sources

## 🏗️ Architecture

### Audio Management System

The app uses a sophisticated **AudioManager** architecture to handle multiple audio sources seamlessly across both Android and iOS platforms:

#### Core Components

**AudioManager** (`src/services/AudioManager.ts`)

- Central coordinator for all audio playback operations
- Manages source switching between radio and podcasts
- Provides observer pattern for real-time updates
- **Unified cross-platform support**: TrackPlayer for Android, Video components for iOS
- **Video ref management**: Registers and controls Video components on iOS
- **Platform-aware playback**: Automatic detection and appropriate audio implementation

#### AudioSource Interface

```typescript
interface AudioSource {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  type: 'radio' | 'podcast' | 'episode';
  metadata?: any;
  isLiveStream?: boolean;
}
```

#### Key Features

##### 🔄 Source Switching

- Seamless transitions between radio streams and podcasts
- Automatic notification metadata updates
- State synchronization across all components

##### 📱 Notification Panel Management

- **Radio Mode**: Shows live song metadata with album art
- **Podcast Mode**: Displays episode title, school name, and cover
- **Real-time Updates**: Metadata refreshes as content changes

##### 🎯 Smart State Management

- Observer pattern keeps all UI components in sync
- Platform-aware playback (TrackPlayer vs Video component)
- Unified play/pause controls across different sources
- **Cross-platform consistency**: Same API and behavior on Android and iOS

### Component Structure

```bash
src/
├── services/
│   ├── AudioManager.ts      # Central audio coordination
│   └── PlaybackService.ts   # Background service for Android
├── api/
│   └── fetch.ts            # Strapi API integration
└── utils/
    └── config.ts           # App configuration

app/
├── _layout.tsx             # Root layout with TrackPlayer setup
├── (tabs)/
│   ├── index.tsx           # Main radio player
│   ├── podcasts.tsx        # Podcast browser & player
│   └── [other tabs]
└── components/
    ├── Controls.tsx        # Play/pause controls
    ├── TrackDetails.tsx    # Song/episode info display
    └── AlbumArt.tsx        # Cover art display
```

## 🎵 Audio Sources

### Radio Streaming

- **WeBe Radio**: Live stream with real-time metadata via Socket.IO
- **Radio Paradise**: Alternative radio stream
- Dynamic metadata updates notification panel

### Podcast Episodes

- Fetched from Strapi CMS
- Organized by schools/podcasters
- Full playback controls with seek bar

## 🔧 Technical Implementation

### Unified AudioManager Architecture

The AudioManager provides a single API for audio playback across both platforms:

#### Android Implementation (TrackPlayer v5)

- Background service for persistent playback
- Notification controls (play/pause/skip)
- Live metadata updates
- Proper audio focus management

#### iOS Streaming Considerations

iOS uses the Video component for audio playback, which may show MediaToolbox warnings for streaming audio. These are typically non-critical and don't affect functionality:

- **ICY Protocol Warnings**: Expected for streams with metadata (like WeBe Radio)
- **AAC Codec Warnings**: May appear for AAC-encoded streams (like Radio Paradise)
- **HLS Streaming Warnings**: Can occur with adaptive bitrate streams

The app is configured with optimized Video component settings for streaming audio.

#### Cross-Platform Features

- **Unified API**: Same `audioManager.playRadio()` and `audioManager.playPodcast()` calls work on both platforms
- **Video Ref Management**: Components register Video refs with AudioManager for iOS control
- **Platform Detection**: Automatic selection of appropriate audio implementation
- **State Synchronization**: Consistent `isPlaying()` and `currentSource` across platforms

## 📱 Usage

### Playing Radio

```typescript
import { audioManager } from '../src/services/AudioManager';

const radioSource = {
  id: 'webe-radio',
  url: 'https://stream.webe.radio/live',
  title: 'WeBe Radio',
  artist: 'WeBe Radio',
  type: 'radio',
  isLiveStream: true
};

await audioManager.playRadio(radioSource);
```

### Playing Podcasts

```typescript
const podcastSource = {
  id: 'episode-123',
  url: 'https://api.webe.radio/uploads/episode.mp3',
  title: 'Episode Title',
  artist: 'School Name',
  artwork: 'https://api.webe.radio/uploads/cover.jpg',
  type: 'podcast'
};

await audioManager.playPodcast(podcastSource);
```

### iOS Video Component Registration

For iOS, components must register their Video refs with AudioManager:

```typescript
// In component useEffect
useEffect(() => {
  if (Platform.OS === 'ios') {
    audioManager.registerVideoRef('unique-video-id', videoRef.current);
  }
  return () => {
    if (Platform.OS === 'ios') {
      audioManager.unregisterVideoRef('unique-video-id');
    }
  };
}, []);
```

### Listening for Changes

```typescript
useEffect(() => {
  const unsubscribe = audioManager.onSourceChange((source) => {
    // Update UI based on current source
    setCurrentTrack(source);
  });
  return unsubscribe;
}, []);
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Building for Production

```bash
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios
```

## 🔧 Configuration

### Environment Variables

- `EXPO_PUBLIC_STRAPI_URL`: Strapi CMS API URL
- `EXPO_PUBLIC_SOCKET_URL`: Socket.IO server for metadata

### TrackPlayer Setup

- Android manifest permissions configured
- Background service registered
- Notification channels set up

## 📋 API Integration

### Strapi CMS

- Podcast episodes and metadata
- Hero images and content
- School/podcaster information

### Socket.IO

- Real-time song metadata for radio streams
- Live listener counts
- Current track information

## 🐛 Known Issues & Solutions

### TrackPlayer v5 Notification Issues

- **Problem**: Notification controls not working
- **Solution**: Dual event listeners (background service + main app)
- **Fallback**: String-based event names for compatibility

### iOS MediaToolbox Errors

The following MediaToolbox errors are expected when playing streaming audio on iOS and don't affect functionality:

- `err=-12640 (ICY PUMP)`: ICY metadata protocol warnings
- `err=-15514 (HLS-FASB)`: HLS streaming protocol warnings
- `err=-12864 (FigFilePlayer)`: Audio codec negotiation warnings
- `err=-16020 (Fig)`: Audio format detection warnings

These occur because iOS Video component expects standard video formats, but we're using it for streaming audio. The errors are logged but playback continues normally.

### Cross-Platform AudioManager Integration ✅ RESOLVED

- **Previous Problem**: AudioManager only worked on Android, iOS used separate Video implementations
- **Solution**: Extended AudioManager with Video ref management for unified iOS support
- **Result**: Single AudioManager API works across both Android and iOS platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across platforms
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- WeBe Radio for the streaming service
- React Native Track Player community
- Expo team for the amazing development platform
