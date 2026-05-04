## [5.2.4] - 2026-05-04

### ⚡ Performance

- **R8/Proguard enabled**: Android release builds now minified and optimized (-20-30% APK size)
- **StyleSheet optimization**: Moved StyleSheet.create outside component render bodies to eliminate unnecessary re-creations
- **List rendering**: Memoized FlatList renderItem functions to reduce re-renders during scroll
- **Search responsiveness**: Deferred Fuse.js search with useDeferredValue for lag-free text input
- **Bundle tree-shaking**: Added react-native-paper/babel plugin to eliminate dead code from bundle
- **Production console logs**: Stripped informational console.log calls from production builds
- **Dimensions hook**: Replaced static Dimensions.get with useWindowDimensions for correct orientation handling

### 📦 Bundle Size

- **Removed react-native-vector-icons**: Replaced with @expo/vector-icons (already installed, -300KB)
- **Removed @rneui/base + @rneui/themed**: Unused dependencies eliminated (-200KB)
- **Markdown styles memoized**: Prevented unnecessary re-renders on Markdown components

### 🐛 Fixed

- **ColorSchemeName typing**: Narrowed useColorScheme return type to 'light' | 'dark'
- **Strapi v5 types**: Fixed ArticleCard and test mocks using old v4 { data: { attributes } } format
- **Possibly-undefined guards**: Added nullish coalescing for Config.STRAPI_URL_BASE and optional chains

### 🔧 Changed

- **Dependencies aligned**: react-native-screens downgraded to ~4.23.0 to match Expo SDK 55

## [5.2.3] - 2026-04-XX
- Various fixes and Expo SDK 55 migration

## Store Release Notes

### English

**What's New in v5.2.4**

• Performance boost: the app starts faster, scrolls smoother, and uses less storage space
• Reduced app size by ~30% on Android with native code optimization
• Search is now more responsive when typing
• Fixed orientation handling for album artwork
• General stability improvements and dependency updates

### Italiano

**Novità nella v5.2.4**

• Miglioramenti delle prestazioni: l'app si avvia più velocemente, lo scorrimento è più fluido e occupa meno spazio
• Riduzione delle dimensioni dell'app del ~30% su Android con ottimizzazione del codice nativo
• La ricerca è ora più reattiva durante la digitazione
• Corretta la gestione dell'orientamento per la copertina dell'album
• Miglioramenti generali della stabilità e aggiornamento delle dipendenze

