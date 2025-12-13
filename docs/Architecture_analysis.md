# WeBe Radio Player - Architecture Analysis

## 1. Executive Summary
The application is a React Native project built with **Expo** and **Expo Router**. It serves as a radio player for WeBe Radio, featuring live streaming, podcast playback, and news.

The core technology stack includes:
-   **Framework:** React Native (Expo)
-   **Navigation:** Expo Router (File-based routing)
-   **Audio (Android):** `react-native-track-player`
-   **Audio (iOS):** `react-native-video` (Workaround)
-   **UI:** `react-native-paper`
-   **Metadata:** Custom `IcecastMetadataService` fetching from iTunes/MusicBrainz/Discogs.

## 2. Architecture Overview

### Navigation & Structure
The app uses **Expo Router**, which is a modern, file-based routing system. The structure is logical:
-   `app/_layout.tsx`: Root provider setup (Theme, Audio Service registration).
-   `app/(tabs)`: Main tab navigation.
-   `src/services`: Core business logic (Audio, Metadata).

### Audio Engine (Critical)
The audio implementation is **split by platform**:
-   **Android** uses `react-native-track-player`, which is the industry standard for audio apps. It runs in a background service (`PlaybackService.ts`) and handles media controls natively.
-   **iOS** uses `react-native-video` as a hidden video element to play audio. This is explicitly noted in the code as a workaround due to issues with `react-native-track-player` v5 alpha on iOS.

### Data & Metadata
-   **Stream Metadata:** For Android, it listens to `Event.MetadataTimedReceived`. For iOS, it listens to `onTimedMetadata` from the video component.
-   **Enrichment:** `IcecastMetadataService` takes the raw stream title and fetches high-quality cover art from external APIs. This is a robust feature that improves the user experience.

## 3. Weaknesses & Risks

### 🔴 Critical: Dual Audio Implementation
The most significant weakness is the divergent audio implementation.
-   **Maintenance Nightmare:** You have to maintain two separate logic paths for playing, pausing, volume control, and metadata updates.
-   **Inconsistent Behavior:** Background playback, lock screen controls, and audio interruptions (phone calls) may behave differently on iOS vs. Android.
-   **Code Duplication:** `app/(tabs)/index.tsx` contains duplicate logic to handle both `TrackPlayer` events and `Video` callbacks.

### 🟠 High: Monolithic UI Components
The main screen (`app/(tabs)/index.tsx`) is doing too much:
-   It manages UI rendering.
-   It handles low-level audio setup.
-   It listens for platform-specific metadata events.
-   It manages local state that duplicates the service state.

### 🟡 Medium: Hardcoded Configuration
Stream URLs (e.g., `https://stream.webe.radio/live`) are hardcoded directly in the component files. This makes it harder to manage different environments (dev/prod) or update stream URLs without a code change.

### 🟡 Medium: Custom State Management
The `AudioManager` uses a custom listener pattern (`listeners.push(callback)`). While functional, it doesn't integrate as smoothly with React's lifecycle as a library like **Zustand** or **Context**, potentially leading to "tearing" or updates not triggering re-renders if not wired up perfectly (as seen in the manual `useState` syncing in `index.tsx`).

## 4. Areas for Improvement

### 1. Unify Audio Architecture
**Goal:** Use `react-native-track-player` for BOTH platforms.
-   **Action:** Investigate the specific issues with v5 alpha on iOS. If they are resolved in a newer beta or stable release, upgrade and remove `react-native-video`.
-   **Fallback:** If `react-native-video` must stay, **abstract it completely** within `AudioManager`. The UI should never import `react-native-video` or know it exists. `AudioManager` should expose a unified API (`play`, `pause`, `onMetadata`) that handles the platform switching internally.

### 2. Refactor `index.tsx` (Custom Hooks)
**Goal:** Clean up the main screen.
-   **Action:** Create a `useRadioPlayer` hook.
    ```typescript
    // Example usage
    const { isPlaying, currentTrack, metadata, togglePlay } = useRadioPlayer();
    ```
-   This hook would contain all the `useEffect` logic for initializing the player, listening to events, and handling platform differences.

### 3. Centralize Configuration
**Goal:** Remove hardcoded strings.
-   **Action:** Use **Environment Variables** (`.env`).
    -   Move stream URLs and API keys to `.env`.
    -   Update `.env.example` to document these required variables.
    -   Access them via `process.env` or Expo's `extra` config.

### 4. Improve State Management
**Goal:** Single source of truth with modern React patterns.
-   **Current Issue:** The current pattern requires components to manually subscribe/unsubscribe in `useEffect` and maintain their own local `useState` copy of the data. This leads to boilerplate code and potential synchronization bugs ("tearing").
-   **Action:** Implement `useSyncExternalStore`.
    -   **What it is:** A built-in React hook designed specifically for reading from external data sources (like your `AudioManager`).
    -   **Why it's better:**
        1.  **Automatic Updates:** It handles the subscription logic internally. You just pass it a `subscribe` function and a `getSnapshot` function.
        2.  **No Boilerplate:** Components just call `const state = useAudioStore()` and get the latest data. No `useEffect` or `useState` needed in the component.
        3.  **Consistency:** It guarantees the UI always displays the correct state, even during concurrent rendering updates.

## 5. Conclusion
The app works but is built on a fragile foundation regarding iOS audio. The priority should be **unifying the audio engine** or at least **encapsulating the complexity** so it doesn't leak into the UI layer. This will make the app much more stable and easier to maintain in the future.

## 6. Post-Refactor Analysis (Current State)

Following the refactoring process, the project state has significantly improved:

### ✅ Resolved: Dual Audio Implementation
While the underlying libraries (`react-native-track-player` and `react-native-video`) remain different for Android and iOS, the **complexity is now fully encapsulated** within `AudioManager`.
-   **Unified API:** The UI interacts with a single `playRadio` / `playPodcast` API.
-   **Hidden Complexity:** The `HiddenAudioPlayer` component handles the iOS workaround transparently.
-   **No Duplication:** `index.tsx` no longer contains platform-specific audio logic.

### ✅ Resolved: Monolithic UI
The main screen `app/(tabs)/index.tsx` has been drastically simplified.
-   **Separation of Concerns:** Audio logic is moved to `useRadioPlayer` hook.
-   **Cleaner Code:** The component focuses purely on rendering the UI.

### ✅ Resolved: Hardcoded Configuration
-   **Environment Variables:** Stream URLs are now loaded from `.env` via `src/utils/config.ts`.
-   **Flexibility:** Changing streams no longer requires code edits.

### ✅ Resolved: State Management
-   **Modern Patterns:** `AudioManager` now uses `useSyncExternalStore`.
-   **Reliability:** This eliminates the risk of "tearing" and ensures the UI is always in sync with the audio state without manual subscriptions.

### Remaining Work
-   **Testing:** Thorough testing on physical iOS devices is still required to ensure the `HiddenAudioPlayer` behaves correctly in background mode and during interruptions.
-   **ICY Metadata:** The metadata logic for Android is still slightly coupled to `index.tsx` (via the event listener setup). This could be further moved into a service or hook in the future, but it is acceptable for now.
