#!/bin/bash

# Build hook to ensure 16 KB page size support for Android 15+
echo "Configuring 16 KB page size support..."

# Set environment variables for CMake build
export ANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON

# Ensure we're targeting the correct SDK versions
export ANDROID_COMPILE_SDK_VERSION=35
export ANDROID_TARGET_SDK_VERSION=35
export ANDROID_BUILD_TOOLS_VERSION=35.0.0

# Enable large heap for better memory management with 16 KB pages
export ANDROID_LARGE_HEAP=true

echo "16 KB page size support configuration completed"