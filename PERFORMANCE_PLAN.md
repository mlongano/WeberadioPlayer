# 🔧 Performance Optimization Plan — WeBeRadioApp v5.2.3

> Generated: 2026-05-03  
> Based on: React Native Best Practices (Callstack)  
> Overall assessment: [ASSESSMENT.md](./ANALYSIS.md)

---

## Phase 1: CRITICAL (Immediate, 5 files)

**Effect:** Eliminate unnecessary re-renders & enable native minification.

### Fix #1.1 — Move `StyleSheet.create()` outside components

| File | Lines | Current State |
|------|-------|---------------|
| `src/components/Controls.tsx` | 25-42 | `StyleSheet.create` inside component body (no `useMemo`) |
| `src/components/TrackDetails.tsx` | 29-72 | `StyleSheet.create` inside component body (no `useMemo`) |
| `src/components/SeekBar.tsx` | 38-50 | `StyleSheet.create` inside component body (no `useMemo`) |
| `src/components/EpisodeCard.tsx` | 58 | `StyleSheet.create` inside component body (no `useMemo`) |
| `src/components/SplashScreen.tsx` | 37-45 | `StyleSheet.create` inside component body (no `useMemo`) |

**Action:** Move `const styles = StyleSheet.create({...})` to module scope in each file.
- For files that reference `theme.colors.*`: wrap with `useMemo(StyleSheet.create(...), [theme])`.

**Already correct** (leave as-is): `index.tsx`, `podcasts.tsx`, `news.tsx`, `explore.tsx`, `about.tsx`, `_layout.tsx` (tabs) — they already use `useMemo(StyleSheet.create(...))`.

---

### Fix #1.2 — Enable R8/Proguard minification for Android release builds

**File:** `app.json`

**Action:** In `plugins.expo-build-properties[1][1].android`:
```json
"enableProguardInReleaseBuilds": true,
"enableMinifyInReleaseBuilds": true
```

**Rationale:** No custom Android native code beyond standard RN libraries — default Expo Proguard rules should suffice. Expected APK/AAB size reduction: 20-30%.

**Validation:** After EAS build, compare AAB sizes with `build-1762016894742.aab` (the current one in root).

---

## Phase 2: HIGH (Same session, ~6 files)

**Effect:** Reduce bundle size ~30%, improve list scroll FPS, responsive search input.

### Fix #2.1 — Remove duplicate icon library

**Files:** `Controls.tsx`, `Header.tsx`, `VolumeControl.tsx`, `package.json`

`react-native-vector-icons` is only used in 3 files. `@expo/vector-icons` (already installed) provides the same icon sets:

| Current Import | Replacement |
|---------------|-------------|
| `react-native-vector-icons/MaterialIcons` | `@expo/vector-icons/MaterialIcons` |
| `react-native-vector-icons/MaterialCommunityIcons` | `@expo/vector-icons/MaterialCommunityIcons` |

**Action:**
1. Swap imports in `Controls.tsx`, `Header.tsx`, `VolumeControl.tsx`
2. Remove `react-native-vector-icons` from `package.json` dependencies
3. Remove `@types/react-native-vector-icons` from `devDependencies`
4. Run `yarn`

**Estimated bundle savings:** ~300KB.

---

### Fix #2.2 — Add `react-native-paper/babel` plugin

**File:** `babel.config.js`

`react-native-paper` v5.x has a Babel plugin that transforms barrel imports to direct imports at build time, eliminating dead code.

**Action:** Add `'react-native-paper/babel'` to the plugins array:
```js
plugins: [
  'react-native-paper/babel',
  // ... existing plugins
]
```

**Estimated bundle savings:** ~50KB.

---

### Fix #2.3 — Memoize `renderItem` functions in FlatLists

| File | Issue |
|------|-------|
| `app/(tabs)/explore.tsx` | `renderItem` defined inline (~line 106). Creates a new function on every parent render → all list items re-render. |
| `app/(tabs)/podcasts.tsx` | `handlePlay` (~line 25) is not wrapped in `useCallback`. |

**Action:**
- `explore.tsx`: wrap `renderItem` with `useCallback`
- `podcasts.tsx`: wrap `handlePlay` with `useCallback`

**Impact:** Smooth scrolling at ~45-54 FPS instead of potential frame drops with many items.

---

### Fix #2.4 — Add `useDeferredValue` to Fuse.js search

**File:** `app/(tabs)/explore.tsx`

Fuse.js search runs synchronously on every keystroke, blocking the JS thread when typing.

**Action:**
```tsx
const deferredQuery = useDeferredValue(searchQuery);
const fusePosts = deferredQuery.length > 0
  ? fuse.search(deferredQuery).map(r => r.item)
  : episodes;
```

**Impact:** Input stays responsive even with large episode lists. Already using React 19.2, which supports this natively.

---

## Phase 3: MEDIUM (Follow-up, ~4 files)

**Effect:** Fix correctness issues, reduce debug overhead, small re-render improvements.

### Fix #3.1 — Replace static `Dimensions` with `useWindowDimensions`

**File:** `src/components/AlbumArt.tsx`

Module-level `Dimensions.get('window')` doesn't update on orientation change → incorrect sizing on rotation.

**Action:** Replace with `useWindowDimensions()` inside the component body.

---

### Fix #3.2 — Strip production console logs

**Files affected (9):**
- `src/services/PlaybackService.ts` (6 logs)
- `src/services/IcecastMetadataService.ts` (8 logs)
- `src/services/AudioManager.ts` (1 log)
- `src/hooks/useSongMetadata.ts` (7 logs)
- `src/api/fetch.ts` (1 guard already using `__DEV__`, 1 commented)
- `src/components/EpisodeCard.tsx` (1 console.log)
- `src/utils/helpers.ts` (1 console.warn)
- `src/components/HiddenAudioPlayer.tsx` (1 console.log)
- `src/components/RandomEpisode.tsx` (2 commented, 1 console.warn)

**Action:**
- Remove informational `console.log` statements or guard with `if (__DEV__)`.
- Keep `console.warn` and `console.error` only for recoverable/serious error paths.

---

### Fix #3.3 — Memoize Markdown styles

**Files:** `EpisodeCard.tsx`, `ArticleCard.tsx`, `explore.tsx` / `podcasts.tsx`

The same Markdown `style` object appears in 4 places with `theme.colors.background` / `theme.colors.onBackground`. This creates a new object on every render, causing the `Markdown` component to re-render.

**Action:** Wrap Markdown `style` prop with `useMemo` in each component.

---

### Fix #3.4 — Verify bundle size improvements

**Action:**
```bash
npx react-native bundle --entry-file index.js --bundle-output /tmp/bundle.js \
  --platform ios --dev false --minify true
ls -lh /tmp/bundle.js

# Compare with previous baseline
```

---

## Summary

| # | Fix | Priority | Files | Impact |
|---|-----|----------|-------|--------|
| 1.1 | StyleSheet outside components | **CRITICAL** | 5 | FPS + re-render reduction |
| 1.2 | Enable R8/Proguard | **CRITICAL** | 1 | APK -20-30% |
| 2.1 | Remove duplicate icon lib | HIGH | 3+1 | Bundle -300KB |
| 2.2 | react-native-paper/babel | HIGH | 1 | Bundle -50KB |
| 2.3 | Memoize renderItem | HIGH | 2 | List scroll FPS |
| 2.4 | useDeferredValue for search | HIGH | 1 | Search responsiveness |
| 3.1 | useWindowDimensions | MEDIUM | 1 | Orientation bug fix |
| 3.2 | Strip console.logs | MEDIUM | ~9 | JS thread overhead |
| 3.3 | Memoize Markdown styles | MEDIUM | ~3 | Re-render reduction |
| 3.4 | Verify bundle size | MEDIUM | - | Validation |

---

## Guardrails

1. **NONE of the component files need `useMemo(StyleSheet.create(...))` changed** — the screen files (`index.tsx`, `podcasts.tsx`, `news.tsx`, `explore.tsx`, `about.tsx`) already correctly use `useMemo`.
2. **Do not touch `colorScheme`/theme state management** — the current singleton `AudioManager` + `useSyncExternalStore` pattern is correct and performant.
3. **No new dependencies** — `useDeferredValue` is built into React 19.2, `@expo/vector-icons` is already installed, and `react-native-paper/babel` ships with the library.

## Attribution

Based on Callstack's "Ultimate Guide to React Native Optimization".
