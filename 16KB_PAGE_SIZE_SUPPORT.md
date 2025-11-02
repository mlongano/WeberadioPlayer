# Android 16 KB Memory Page Size Support

This configuration ensures your app supports 16 KB memory page sizes as required by Google Play for Android 15+ starting November 1, 2025.

## Changes Made

### 1. App Configuration (`app.json`)

- Added `expo-build-properties` plugin with Android-specific configurations
- Set `compileSdkVersion`, `targetSdkVersion` to 35 (Android 15)
- Enabled `supportLargeHeap` for better memory management
- Configured `enableSeparateBuildPerCPUArchitecture: false` and `universalApk: false` for 16 KB page size support

### 2. EAS Build Configuration (`eas.json`)

- Added `ANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON` environment variable to all build variants
- Configured Android builds to use the latest image with proper SDK versions

### 3. Build Hook (`hooks/prebuild.sh`)

- Created a prebuild script that sets necessary environment variables
- Ensures CMake builds with 16 KB page size support

## Required Dependencies

✅ **Already installed**: `expo-build-properties` (v1.0.9) is already in your package.json dependencies.

## Building for Production

To build your app with 16 KB page size support:

```bash
# Build for production
eas build --platform android --profile production

# Or build locally (if you have Android SDK setup)
npx expo run:android --variant release
```

## Verification

After building, you can verify 16 KB support by:

1. Uploading your APK/AAB to Google Play Console
2. Checking the "App bundle explorer" section
3. Looking for "16 KB page size support" indicator

## Key Technical Details

### Memory Page Sizes

- Traditional Android devices use 4 KB memory pages
- Some newer devices (especially ARM64) use 16 KB pages for better performance
- Apps must be built with specific flags to support both page sizes

### CMake Configuration

- `ANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON` enables flexible page size support
- This flag is passed to the native build system during compilation
- React Native's CMake scripts will automatically handle the rest

### SDK Requirements

- Minimum `compileSdkVersion`: 35 (Android 15)
- Minimum `targetSdkVersion`: 35 (Android 15)
- Build Tools: 35.0.0 or higher

## Troubleshooting

### If build fails with CMake errors

1. Clear build cache: `eas build --platform android --profile production --clear-cache`
2. Ensure Android SDK 35 is installed on build servers (handled by EAS)

### If app crashes on 16 KB devices

1. Check native dependencies for 16 KB compatibility
2. Review memory allocation patterns in native modules
3. Test on devices with 16 KB page sizes (newer ARM64 devices)

## Native Dependencies Compatibility

Most React Native modules should work with 16 KB pages, but some may need updates:

- `react-native-track-player`: Should be compatible with latest versions
- `react-native-video`: Should be compatible with latest versions
- Custom native modules: May need verification

## Timeline

- **Deadline**: November 1, 2025
- **Affected**: All app updates targeting Android 15+
- **Requirement**: Must support 16 KB memory page sizes

## References

- [Google Play Console Documentation](https://developer.android.com/guide/practices/page-sizes)
- [Expo Build Properties Documentation](https://docs.expo.dev/versions/latest/sdk/build-properties/)
- [React Native Android Build Configuration](https://reactnative.dev/docs/android-building-from-source)
