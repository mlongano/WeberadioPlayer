# WeBe Radio Player — Quality Analysis

**Project**: WeBe Radio Player v5.2.2  
**Stack**: React Native 0.76.9 + Expo 52 + TypeScript (strict mode)  
**Date**: March 2026  

---

## Executive Summary

WeBe Radio Player is a cross-platform radio streaming and podcast app with a well-designed audio architecture. The codebase demonstrates strong architectural thinking — the AudioManager singleton with observer pattern, platform-aware playback (TrackPlayer on Android, Video on iOS), and the 3-tier cover art enrichment pipeline (iTunes → MusicBrainz → Discogs) are genuinely well-engineered.

However, the code quality surrounding this architecture had significant gaps: pervasive `any` types despite `strict: true` in tsconfig, commented-out error handling, race conditions in loading states, zero test coverage, and no user-facing error recovery. These have been addressed through a systematic 6-phase remediation.

**Quality Score: 4.4/10 → 7.3/10**

---

## Architecture Assessment

### Strengths (What's Done Well)

#### Audio Management — Excellent
- **AudioManager singleton** with observer pattern provides clean separation between audio control and UI updates
- **Platform abstraction** — same API (`playRadio()`, `playPodcast()`) works on both Android (TrackPlayer) and iOS (Video component)
- **Video ref management** for iOS — components register/unregister refs with AudioManager for centralized control
- **Source switching** between radio and podcasts with automatic notification metadata updates

#### ICY Metadata Pipeline — Excellent
- **Direct stream metadata extraction** via ICY protocol — no polling, no separate endpoints
- **Real-time parsing** of "Title - Artist - Year - Album" format from `Event.MetadataTimedReceived`
- **3-tier cover art enrichment**:
  - iTunes Search API (~200ms, no auth, best for mainstream)
  - MusicBrainz + Cover Art Archive (~800ms, no auth, good for indie/niche)
  - Discogs API (~1000ms, optional auth, excellent for rare/vinyl)
- **Smart caching**: LRU cache (100 songs, 24h expiry) + negative caching (1h for failed lookups)
- **Podcast protection**: ICY metadata ignored when `getActiveTrack()` URL ≠ radio stream URL

#### Strapi Integration — Good
- `strapiFetch` with automatic pagination (`allPages` mode)
- `flattenEpisode` transformer normalizes nested Strapi response into clean `Episode` objects
- Configured for public read access — no auth token needed

#### Project Configuration — Good
- `strict: true` in tsconfig
- Path aliases (`@/*`)
- EAS Build configured (`eas.json` with dev + production profiles)
- Expo Doctor exclusions for known-incompatible packages

### Weaknesses Found (Pre-Remediation)

#### Type Safety — Score: 3/10
- ~30 occurrences of `any` across 14 files despite `strict: true`
- `strapiFetch` accepted and returned `any` everywhere — the entire API layer was untyped
- `flattenEpisode` callbacks were all `any`
- Component props used `any` (e.g., `theme?: any` in AlbumArt, no props interface in HeroHeader)
- Screen state was `useState<any[]>` across all 4 data screens

#### Error Handling — Score: 3/10
- **`checkStatus(response)` was commented out** in `localFetch` — HTTP errors (401, 404, 500) silently passed through
- In the `allPages` branch, `checkStatus()` was called on **parsed JSON objects** instead of Response objects — wrong type, would have thrown on valid responses
- **Redundant `Promise.all`** on already-resolved data
- **No user-facing error UI** — network failures showed blank screens
- **Race conditions**: `setLoading(false)` outside `finally` blocks — loading spinner stuck on error

#### Testing — Score: 1/10
- Only 1 pre-existing test (`StyledText-test.js`) — a snapshot test that's broken due to `react-test-renderer` version mismatch (v19 vs React 18)
- Zero tests for business logic, data transformers, or services
- `@types/jest` not installed — no TypeScript support in test files

#### Dead Code & Dependencies
- `useAudioControls.ts` hook — zero imports anywhere, fully dead
- `socket.io-client` in package.json — CHANGELOG v5.2.0 says "Completely removed Socket.IO connection" but the dependency was never cleaned up
- `install` package accidentally added to dependencies (npm artifact)
- Duplicate `ListHeaderComponent` in news.tsx FlatList
- Missing `keyExtractor` on FlatLists (React key warnings)

#### Performance
- `StyleSheet.create()` called inside render functions on all screens (recreated every render)
- `Fuse.js` instance recreated on every render in explore.tsx
- No `useMemo`/`useCallback` for expensive operations

#### Accessibility — Score: 2/10
- No `accessibilityLabel` on any interactive component
- No `accessibilityRole` annotations
- No `accessibilityHint` for non-obvious actions

#### Documentation Drift
- README showed `metadata?: any` in AudioSource interface (code was already typed)
- README used deprecated `npx expo build` commands (project uses EAS Build)
- Component structure tree incomplete — missing 15+ components
- Radio Paradise mentioned as "alternative stream" but not present in code
- CHANGELOG version table missing v5.2.1 entry

---

## Remediation Summary

### Phase 1: Token Removal ✅
Removed `EXPO_PUBLIC_STRAPI_API_TOKEN` from 6 files — the Strapi API uses public read access and doesn't need authentication.

| File | Change |
|------|--------|
| `src/utils/config.ts` | Removed `STRAPI_API_TOKEN` property |
| `src/api/fetch.ts` | Removed unused `headers` const with Bearer token |
| `src/utils/errorHandling.ts` | Removed token from env var check array |
| `eas.json` | Removed token from dev + prod env blocks |
| `README.md` | Removed token from env vars documentation |
| `.env.example` | Removed token line from template |

### Phase 2: Race Conditions ✅
Moved `setLoading(false)` into `finally` blocks on all 4 data screens.

| File | Fix |
|------|-----|
| `app/(tabs)/ascolta.tsx` | `setIsLoading(false)` → `finally` block |
| `app/(tabs)/news.tsx` | `setLoading(false)` → `finally` block |
| `app/(tabs)/explore.tsx` | `setLoading(false)` → `finally` block |
| `app/(tabs)/podcasts.tsx` | `setLoading(false)` → `finally` block |

### Phase 3: Bug Fixes + Dead Code + Performance ✅

| File | Change |
|------|--------|
| `news.tsx` | Removed duplicate `ListHeaderComponent`; added `keyExtractor` + `ItemSeparatorComponent`; removed 4 unused styles |
| `explore.tsx` | Memoized Fuse.js options + instance with `useMemo` |
| All screens | Wrapped `StyleSheet.create()` in `useMemo` |
| `src/hooks/useAudioControls.ts` | **Deleted** — dead code, zero imports |
| `package.json` | Removed accidental `install` package |

### Phase 4: Error UI ✅

Created `src/components/ErrorMessage.tsx` — reusable error component with warning icon, Italian error message, and "Riprova" retry button using `react-native-paper`.

Added error states with retry to all 4 data screens:
- `ascolta.tsx`: Error state + `ErrorMessage` + `useCallback` for fetch
- `news.tsx`: Same pattern
- `explore.tsx`: Same pattern
- `podcasts.tsx`: Same pattern + wrapped `schoolsFetchAllBasic()` in try/catch

### Phase 5: Accessibility ✅
Added `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` across 18 files (15 components + 4 screens). All labels in Italian to match the app's user-facing language.

### Phase 6A: Replace `any` Types ✅
Replaced all ~30 `any` occurrences across 14 files with proper TypeScript types.

**New types created in `src/api/types.ts`:**
- `StrapiQuery` — `Record<string, unknown>` for query objects
- `StrapiResponse<T>` — generic Strapi list response wrapper
- `TagQuery` — tag entries `{ id: number; attributes: { name: string } }`
- `PostAttributes` / `PostQuery` — news post types
- `SchoolLastEpisode` — podcasts screen data type

**Type fixes in existing types:**
- `PodcastQuery.schools`: Changed from `Attributes<School[]>` to `Attributes<SchoolQuery[]>` (Strapi returns wrapped format)
- `EpisodeAttributes.tags`: Changed from `Attributes<string[]>` to `Attributes<TagQuery[]>` (actual response structure)
- `AudioSource.metadata`: `any` → `Record<string, string>`

**Files modified:**
- `src/api/fetch.ts` — ~15 `any` replaced (params, returns, callbacks)
- `src/utils/helpers.ts` — 3 `any` replaced (`reduce` accumulator, date options, cover attributes)
- `src/services/AudioManager.ts` — `metadata?: Record<string, string>`
- `src/services/IcecastMetadataService.ts` — Discogs callback typed with inline interface
- `src/components/HeroHeader.tsx` — Created `HeroHeaderProps` interface
- `src/components/AlbumArt.tsx` — Removed unused `theme?: any` prop
- `src/components/RandomEpisode.tsx` — Props → `EpisodeQuery[]`; state → `Episode | null`
- `src/components/HiddenAudioPlayer.tsx` — Created `MetadataItem` and `TimedMetadataEvent` interfaces
- All 4 screen files — `useState<any[]>` → proper types (`EpisodeQuery[]`, `PostQuery[]`, `SchoolLastEpisode[]`)

**Intentionally kept:** `as any` casts in `PlaybackService.ts` — necessary workaround for TrackPlayer v5 nightly alpha API surface that isn't fully typed.

### Phase 6B: Fix `checkStatus` ✅

| Change | Detail |
|--------|--------|
| Uncommented `checkStatus(response)` | In `localFetch`, after `fetch()` and before `response.json()` |
| Removed wrong `checkStatus` call | In `allPages` branch — was called on parsed JSON objects instead of Response objects |
| Removed redundant `Promise.all` | `const dataAll = await Promise.all(responses)` — `responses` was already resolved data |
| Fixed data concatenation | Uses `responses.map((data: { data: unknown[] }) => data.data)` directly |

### Phase 6C: Unit Tests ✅
Created 29 tests across 3 files, all passing:

| File | Tests | Coverage |
|------|-------|----------|
| `src/utils/__tests__/helpers.test.ts` | 16 | `zip` (3), `clamp` (5), `getFriendlyDate` (2), `getCover` (3), `fixEncoding` (3) |
| `src/services/__tests__/IcecastMetadataService.test.ts` | 8 | `parseIcyTitle` (5), listener notification (2), cover cache behavior (1) |
| `src/api/__tests__/fetch.test.ts` | 5 | `flattenEpisode` with valid data, missing fields, empty tags/schools |

### Phase 7: Documentation Fixes ✅

| File | Change |
|------|--------|
| `README.md` | Fixed `metadata?: any` → `Record<string, string>` in AudioSource example |
| `README.md` | Fixed `event: any` → proper typed callback in TrackPlayer example |
| `README.md` | Replaced deprecated `expo build` → `eas build` commands |
| `README.md` | Updated component structure tree (was 6 files, now 25+) |
| `README.md` | Removed "Radio Paradise" reference (not present in codebase) |
| `CHANGELOG.md` | Added v5.2.1 to version history table |

---

## Updated Quality Scorecard

| Area | Before | After | Notes |
|------|--------|-------|-------|
| Architecture | 9/10 | 9/10 | Was already excellent |
| Type Safety | 3/10 | 8/10 | ~30 `any` eliminated; only intentional `as any` in PlaybackService remain |
| Error Handling | 3/10 | 8/10 | `checkStatus` fixed, error UI on all screens, `finally` blocks |
| Testing | 1/10 | 5/10 | 29 new pure-function tests; no component/integration tests yet |
| Accessibility | 2/10 | 7/10 | Labels on all interactive elements; Italian localization |
| Performance | 5/10 | 7/10 | Memoized styles + Fuse.js; removed dead code |
| Documentation | 8/10 | 9/10 | Fixed stale examples, deprecated commands, and incomplete structure |
| Dependencies | 5/10 | 6/10 | Removed `install` package; `socket.io-client` still present |
| **Overall** | **4.4/10** | **7.3/10** | |

---

## Remaining Recommendations

### High Priority

1. **Remove `socket.io-client`** from `package.json` — it's listed in dependencies but imported nowhere. CHANGELOG v5.2.0 explicitly states "Completely removed Socket.IO connection". Run `npm uninstall socket.io-client`.

2. **Fix `react-test-renderer` version mismatch** — installed version 19.1.1, but the project uses React 18.3.1. This breaks the pre-existing `StyledText-test.js`. Fix: `npm i --save-dev react-test-renderer@18.3.1 --legacy-peer-deps`.

3. **Add component tests** — current test coverage only covers pure functions. Key candidates:
   - `ErrorMessage` component (render + retry callback)
   - `Controls` component (play/pause state toggling)
   - Screen-level tests with mocked API responses

### Medium Priority

4. **`react-native-vector-icons` type mismatch** — `Icon` and `Icon.Button` cause "cannot be used as JSX component" LSP errors in `Controls.tsx`, `VolumeControl.tsx`, and `Header.tsx`. This is a known issue with `@types/react-native-vector-icons` vs React 18. Options:
   - Update `@types/react-native-vector-icons` when a compatible version is released
   - Switch to `@expo/vector-icons` (already installed) for type-compatible alternatives

5. **Replace `@rneui/base` + `@rneui/themed`** — these RC packages (v4.0.0-rc.8) have conflicting peer dependencies (`@rneui/themed` wants `@rneui/base@4.0.0-rc.7` but `@rneui/base@4.0.0-rc.8` is installed). This forces `--legacy-peer-deps` on every npm install. Consider:
   - Pinning both to `4.0.0-rc.7`
   - Migrating to `react-native-paper` (already used for `ErrorMessage`)
   - Waiting for stable v4 release

6. **Consider ESLint configuration** — `eslint@^9.35.0` is installed but no `.eslintrc` or `eslint.config.js` found. Adding a basic config would catch issues at dev time.

### Low Priority

7. **TrackPlayer v5 stable** — currently using a nightly build (`5.0.0-alpha0-nightly-359af5a...`) due to a bug in stable. The `as any` casts in `PlaybackService.ts` are an accepted consequence. Monitor for a stable v5 release with the fix.

8. **Negative cache tuning** — IcecastMetadataService uses 1h negative cache for failed cover lookups. For a radio station playing the same rotation, this is fine. If the catalog grows significantly, consider making this configurable.

9. **`expo-web-browser`** — listed in dependencies. Verify it's actually used or remove.

---

## Pre-existing Issues (Not Caused by Remediation)

These issues existed before the quality audit and were intentionally not modified:

1. **`react-native-vector-icons` JSX type errors** in Controls.tsx, VolumeControl.tsx, Header.tsx — known React 18 type compatibility issue
2. **`StyledText-test.js` failure** — `react-test-renderer` v19 incompatible with React 18
3. **TrackPlayer nightly `as any` casts** — intentional, stable version had a bug affecting the app
4. **`socket.io-client` in dependencies** — orphaned dependency, not imported anywhere
5. **`@rneui` peer dependency conflict** — requires `--legacy-peer-deps` flag

---

## Files Modified During Remediation

### New Files Created
- `src/components/ErrorMessage.tsx`
- `src/utils/__tests__/helpers.test.ts`
- `src/services/__tests__/IcecastMetadataService.test.ts`
- `src/api/__tests__/fetch.test.ts`
- `ANALYSIS.md`

### Files Deleted
- `src/hooks/useAudioControls.ts` (dead code)

### Files Modified
| File | Phases |
|------|--------|
| `src/api/types.ts` | 6A |
| `src/api/fetch.ts` | 1, 6A, 6B |
| `src/utils/config.ts` | 1 |
| `src/utils/errorHandling.ts` | 1 |
| `src/utils/helpers.ts` | 6A |
| `src/services/AudioManager.ts` | 6A |
| `src/services/IcecastMetadataService.ts` | 6A |
| `src/components/HeroHeader.tsx` | 5, 6A |
| `src/components/AlbumArt.tsx` | 5, 6A |
| `src/components/RandomEpisode.tsx` | 5, 6A |
| `src/components/HiddenAudioPlayer.tsx` | 5, 6A |
| `src/components/Controls.tsx` | 5 |
| `src/components/VolumeControl.tsx` | 5 |
| `src/components/VolumeBar.tsx` | 5 |
| `src/components/SeekBar.tsx` | 5 |
| `src/components/TrackDetails.tsx` | 5 |
| `src/components/Header.tsx` | 5 |
| `src/components/TopBar.tsx` | 5 |
| `src/components/Logo.tsx` | 5 |
| `src/components/ArticleCard.tsx` | 5 |
| `src/components/EpisodeCard.tsx` | 5 |
| `src/components/LoadingSpinner.tsx` | 5 |
| `app/(tabs)/index.tsx` | 3, 5, 6A |
| `app/(tabs)/ascolta.tsx` | 2, 4, 5, 6A |
| `app/(tabs)/news.tsx` | 2, 3, 4, 5, 6A |
| `app/(tabs)/explore.tsx` | 2, 3, 4, 5, 6A |
| `app/(tabs)/podcasts.tsx` | 2, 4, 5, 6A |
| `app/(tabs)/about.tsx` | 3 |
| `eas.json` | 1 |
| `.env.example` | 1 |
| `README.md` | 1, 7 |
| `CHANGELOG.md` | 7 |
| `package.json` | 3, 6C |

---

## App Store Rejection — Guideline 2.3.10

### What Happened

Version 5.2.1 (buildNumber 2.2.0) was rejected by Apple on November 4, 2025 under **Guideline 2.3.10 - Performance: Accurate Metadata**.

> *"The app or metadata includes information about third-party platforms that may not be relevant for App Store users."*

**Cause**: The "What's New" text submitted in App Store Connect contained references to Android (e.g., "TrackPlayer for Android", "Background service for Android", "cross-platform" mentions). Apple requires iOS submissions to focus exclusively on the iOS experience.

### Resolution

The rejection is a **metadata-only issue** — no code changes are required for compliance. The fix is to revise the "What's New" text in App Store Connect before resubmitting.

**Rule of thumb for Apple "What's New" text**: Never mention Android, Google Play, TrackPlayer background service, cross-platform, or any non-iOS platform. Describe only what iOS users experience.

---

## Submitting v5.2.2 to the App Store

### Version Numbers (as configured)

| Field | Value | Location |
|-------|-------|----------|
| `expo.version` | `5.2.2` | `app.json` — app display version |
| `expo.ios.buildNumber` | `2.3.0` | `app.json` — iOS build number (bumped from 2.2.0) |
| `expo.android.versionCode` | `23` (auto-incremented by EAS) | `app.json` + `eas.json` |

### Step-by-Step

#### 1. Build the iOS binary

```bash
eas build --platform ios --profile production
```

This will:
- Use the `production` profile from `eas.json`
- Build with version `5.2.2` and buildNumber `2.3.0`
- Sign with your Apple Distribution certificate (managed by EAS)
- Upload the build artifact to Expo's servers

Wait for the build to complete (check status at https://expo.dev or via `eas build:list`).

#### 2. Submit to App Store Connect

```bash
eas submit --platform ios --latest
```

Or if you want to submit a specific build:

```bash
eas submit --platform ios --id <build-id>
```

This uploads the `.ipa` to App Store Connect via the App Store Connect API.

#### 3. Complete the submission in App Store Connect

1. Go to **[App Store Connect](https://appstoreconnect.apple.com)** → your app
2. The new build (`5.2.2`, build `2.3.0`) should appear under **TestFlight** and be available to select for a new release
3. Create a **new version** `5.2.2` (or edit the rejected version if App Store Connect allows updating)
4. **Select the new build** (`2.3.0`)
5. **Fill in "What's New"** — use iOS-only language, for example:

> - Improved error handling with retry option on all screens
> - Enhanced VoiceOver accessibility
> - Stability and performance improvements
> - Fixed volume control for podcast playback
> - Fixed SeekBar progress for episodes

6. **Do NOT mention**: Android, TrackPlayer, cross-platform, background service, Google Play
7. **Submit for Review**

#### 4. (Optional) Build and submit in one step

```bash
eas build --platform ios --profile production --auto-submit
```

This builds and automatically submits to App Store Connect when the build completes.

### Checklist Before Submitting

- [x] `app.json` version bumped to `5.2.2`
- [x] `app.json` iOS buildNumber bumped to `2.3.0`
- [x] `package.json` version matches (`5.2.2`)
- [x] CHANGELOG updated with v5.2.2 entry
- [ ] Run `npx jest` — confirm all tests pass
- [ ] Run `eas build --platform ios --profile production`
- [ ] Run `eas submit --platform ios --latest`
- [ ] In App Store Connect: write iOS-only "What's New" text
- [ ] Submit for App Review
