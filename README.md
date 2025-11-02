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

The app uses a sophisticated multi-layered architecture to handle audio playback and metadata enrichment seamlessly across both Android and iOS platforms:

#### Core Components

**AudioManager** (`src/services/AudioManager.ts`)

- Central coordinator for all audio playback operations
- Manages source switching between radio and podcasts
- Provides observer pattern for real-time updates
- **Unified cross-platform support**: TrackPlayer for Android, Video components for iOS
- **Video ref management**: Registers and controls Video components on iOS
- **Platform-aware playback**: Automatic detection and appropriate audio implementation

**IcecastMetadataService** (`src/services/IcecastMetadataService.ts`)

- **Direct ICY metadata extraction** from the live stream
- **Real-time metadata parsing** from TrackPlayer events
- **Automatic cover art enrichment** from iTunes and MusicBrainz APIs
- **Smart caching** to minimize API calls and improve performance
- **Always in sync** with the actual playing stream (no polling delays)

#### Metadata Flow Architecture

```text
Live Stream (https://stream.webe.radio/live)
          ↓ [ICY Protocol - metadata every 16KB]
TrackPlayer (Android) / Video Component (iOS)
          ↓ [Event.MetadataTimedReceived]
          ↓ [Check: TrackPlayer.getActiveTrack() === radio URL?]
          ├─→ NO: Ignore (playing podcast)
          └─→ YES: Process ICY metadata
          ↓ [Extract: event.metadata[0].title]
          ↓ [Raw: "Title - Artist - Year - Album"]
IcecastMetadataService.processIcyMetadata()
          ↓ [Parse metadata parts]
          ├─→ iTunes API (primary, <200ms)
          └─→ MusicBrainz API (fallback)
          ↓ [Cache cover (LRU 100 songs)]
          ↓ [Notify all listeners via Observer pattern]
useSongMetadata Hook
          ↓ [Update state: songMetadata, cover]
UI Components
          ↓ [Check: currentSource.type?]
          ├─→ 'podcast'/'episode': Show currentSource metadata
          └─→ 'radio'/null: Show songMetadata (ICY enriched)
Display (AlbumArt, TrackDetails, Notification)
```

#### Key Advantages

✅ **Stream-Synced Metadata**: Metadata comes directly from the playing stream, not a separate endpoint
✅ **No Polling Delays**: Real-time updates as TrackPlayer emits ICY events (every 16KB of audio)
✅ **Play/Pause Safe**: Metadata only updates when audio is actually playing
✅ **Raw Metadata Access**: Uses `MetadataTimedReceived` to get unparsed ICY data
✅ **Smart Cover Fetching**: Automatic enrichment with album artwork from iTunes/MusicBrainz
✅ **Efficient Caching**: Covers cached for up to 100 songs to minimize API calls
✅ **Live UI Updates**: Components use hook state directly, not stale cached objects
✅ **Podcast Protection**: ICY metadata ignored when playing podcasts to prevent interference
✅ **Smart Source Switching**: UI automatically displays correct metadata based on audio source type
✅ **Zero External Dependencies**: All metadata comes directly from ICY stream, no external services required

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
│   ├── AudioManager.ts           # Central audio coordination
│   ├── IcecastMetadataService.ts # ICY metadata parsing & cover fetching
│   └── PlaybackService.ts        # Background service for Android
├── api/
│   └── fetch.ts                  # Strapi API integration
└── utils/
    └── config.ts                 # App configuration

app/
├── _layout.tsx                   # Root layout with TrackPlayer setup
├── hooks/
│   └── useSongMetadata.ts        # Metadata hook with ICY enrichment
├── (tabs)/
│   ├── index.tsx                 # Main radio player with ICY listener
│   ├── podcasts.tsx              # Podcast browser & player
│   └── [other tabs]
└── components/
    ├── Controls.tsx              # Play/pause controls
    ├── TrackDetails.tsx          # Song/episode info display
    └── AlbumArt.tsx              # Cover art display
```

## 🎵 Audio Sources

### Radio Streaming

- **WeBe Radio**: Live stream at `https://stream.webe.radio/live`
  - **ICY metadata protocol** embedded in stream
  - **Real-time song updates** via TrackPlayer events
  - **Automatic cover art** fetched from iTunes/MusicBrainz APIs
  - **Format**: "Title - Artist - Year - Album"
- **Radio Paradise**: Alternative radio stream
- Dynamic metadata updates in notification panel

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

### ICY Metadata Processing

The app automatically listens for ICY metadata from the stream and enriches it with cover art on both platforms:

#### Android (TrackPlayer)

```typescript
// Automatic setup in index.tsx - uses Event.MetadataTimedReceived
TrackPlayer.addEventListener(
  Event.MetadataTimedReceived,
  async (event: any) => {
    // Only process if playing the radio stream (not podcasts)
    const currentTrack = await TrackPlayer.getActiveTrack();
    const isRadioStream = currentTrack?.url === 'https://stream.webe.radio/live';

    if (!isRadioStream) {
      return; // Ignore ICY metadata when playing podcasts
    }

    // Extract raw ICY metadata: "Title - Artist - Year - Album"
    if (event.metadata && Array.isArray(event.metadata) && event.metadata.length > 0) {
      const rawTitle = event.metadata[0].title;

      if (rawTitle && rawTitle !== 'WeBe Radio') {
        // Parse and enrich metadata with cover art
        const enrichedMetadata = await icecastMetadataService.processIcyMetadata(rawTitle);

        // Update notification with cover art
        await TrackPlayer.updateNowPlayingMetadata({
          title: enrichedMetadata.title,
          artist: enrichedMetadata.artist,
          album: enrichedMetadata.album,
          artwork: enrichedMetadata.coverUrl,
        });
      }
    }
  }
);
```

#### iOS (Video Component)

```typescript
// iOS uses react-native-video's onTimedMetadata callback
<Video
  source={{
    uri: 'https://stream.webe.radio/live',
    headers: {
      'Icy-MetaData': '1', // Enable ICY metadata
    },
  }}
  onTimedMetadata={async (metadata) => {
    // Extract StreamTitle from metadata array
    const streamTitleItem = metadata.metadata.find(
      (item) => item.identifier === 'icy/StreamTitle'
    );

    if (streamTitleItem && streamTitleItem.value !== 'WeBe Radio') {
      // Parse and enrich metadata with cover art
      const enrichedMetadata = await icecastMetadataService.processIcyMetadata(
        streamTitleItem.value
      );

      // UI updates automatically via IcecastMetadataService listener
    }
  }}
/>
```**Key Implementation Details:**

- **Android**: Uses `Event.MetadataTimedReceived` from TrackPlayer to get raw unparsed ICY metadata
- **iOS**: Uses `onTimedMetadata` callback from react-native-video to receive ICY metadata
- **Metadata Extraction**:
  - Android: `event.metadata[0].title`
  - iOS: Find item with `identifier === 'icy/StreamTitle'`
- **Source Detection**: Checks if playing radio stream vs podcast to avoid metadata interference
- **Filters**: Ignores station name "WeBe Radio" to avoid processing non-song metadata
- **Format**: "Title - Artist - Year - Album" (e.g., "Jump - Van Halen - 2022 - 1984")
- **Enrichment**: IcecastMetadataService handles parsing and cover art enrichment
- **Cross-Platform**: Same unified processing for both platforms via observer pattern

### UI Metadata Switching

The UI automatically switches between podcast and radio metadata:

```typescript
// In index.tsx - conditional rendering based on source type
<AlbumArt
  url={(currentSource?.type === 'podcast' || currentSource?.type === 'episode')
    ? (currentSource.artwork || cover)
    : cover}
/>
<TrackDetails
  title={(currentSource?.type === 'podcast' || currentSource?.type === 'episode')
    ? currentSource.title
    : (songMetadata.title || 'WeBe Radio')}
  artist={(currentSource?.type === 'podcast' || currentSource?.type === 'episode')
    ? currentSource.artist
    : (songMetadata.artist || 'WeBe Radio')}
  // ... album and year follow same pattern
/>
```

This ensures:

- **Podcasts**: Display static metadata from `currentSource` (title, artist, artwork from episode)
- **Radio**: Display live ICY metadata from `songMetadata` (enriched with album covers)
- **Seamless switching**: No metadata interference when changing between sources

### Custom Metadata Enrichment

You can also manually process ICY metadata:

```typescript
import { icecastMetadataService } from '../src/services/IcecastMetadataService';

// Parse ICY title and fetch cover art
const icyTitle = "Cosa mi manchi a fare - Calcutta - 2016 - Mainstream";
const metadata = await icecastMetadataService.processIcyMetadata(icyTitle);

console.log(metadata);
// {
//   title: "Cosa mi manchi a fare",
//   artist: "Calcutta",
//   year: "2016",
//   album: "Mainstream",
//   coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music/...",
//   listeners: 0
// }
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

### TrackPlayer Setup

- Android manifest permissions configured
- Background service registered
- Notification channels set up

## 📋 API Integration

### Strapi CMS

- Podcast episodes and metadata
- Hero images and content
- School/podcaster information

### ICY Metadata Stream

- **Primary metadata source**: Direct from audio stream
- Real-time song information (title, artist, year, album)
- No external server dependencies
- Automatic metadata extraction every 16KB of audio

### Cover Art APIs

- **iTunes Search API**: Primary cover art source (fast, no authentication required)
- **MusicBrainz + Cover Art Archive**: Fallback for additional coverage
- Smart caching system (LRU, 100 songs)

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
