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

The app uses a sophisticated **AudioManager** architecture to handle multiple audio sources seamlessly:

#### Core Components

**AudioManager** (`src/services/AudioManager.ts`)

- Central coordinator for all audio playback operations
- Manages source switching between radio and podcasts
- Provides observer pattern for real-time updates
- Handles platform-specific implementations (TrackPlayer for Android, Video for iOS)

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

### Android (TrackPlayer v5)

- Background service for persistent playback
- Notification controls (play/pause/skip)
- Live metadata updates
- Proper audio focus management

### iOS (react-native-video)

- Background audio support
- Native video component for audio playback
- Platform-specific optimizations

### Cross-Platform Features

- Unified AudioManager interface
- Platform detection and conditional logic
- Shared UI components with platform adaptations

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

### Source Switching Conflicts

- **Problem**: Multiple audio sources interfering
- **Solution**: AudioManager with reset() before new playback
- **Result**: Clean transitions between radio and podcasts

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
