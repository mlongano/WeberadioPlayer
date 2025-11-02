# Version Code Auto-Increment Guide

## ✅ EAS Build Auto-Increment (Now Configured)

Your `eas.json` now includes `"autoIncrement": "versionCode"` for all Android profiles.

### How it works:
- EAS automatically increments the `versionCode` on each build
- Reads the current value from `app.json`
- Increments by 1 for each build
- Updates the built app with the new version code
- **Does NOT modify your local `app.json`**

### Current Configuration:
```json
"android": {
  "autoIncrement": "versionCode"
}
```

### Available Options:
- `"versionCode"` - Auto-increment Android version code
- `"buildNumber"` - Auto-increment iOS build number
- `"version"` - Auto-increment app version (e.g., 5.0.3 → 5.0.4)
- `true` - Auto-increment both versionCode and buildNumber

## Alternative Methods

### Option 2: NPM Script with Package
```bash
# Install version management package
npm install -D standard-version

# Add to package.json scripts:
"scripts": {
  "version:patch": "standard-version --release-as patch",
  "version:minor": "standard-version --release-as minor",
  "version:major": "standard-version --release-as major"
}

# Usage:
npm run version:patch  # 5.0.3 → 5.0.4
```

### Option 3: Custom Shell Script
Create `scripts/increment-version.sh`:
```bash
#!/bin/bash

# Read current versionCode
CURRENT=$(grep -o '"versionCode": [0-9]*' app.json | grep -o '[0-9]*')
NEW=$((CURRENT + 1))

# Update app.json
sed -i '' "s/\"versionCode\": $CURRENT/\"versionCode\": $NEW/" app.json

echo "Version code updated: $CURRENT → $NEW"
```

### Option 4: Node.js Script
Create `scripts/bump-version.js`:
```javascript
const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Increment versionCode
appJson.expo.android.versionCode += 1;

// Optionally increment version
const version = appJson.expo.version.split('.');
version[2] = parseInt(version[2]) + 1;
appJson.expo.version = version.join('.');

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log(`Updated to version ${appJson.expo.version} (${appJson.expo.android.versionCode})`);
```

## Current Workflow with Auto-Increment

### Build Commands:
```bash
# Development build - versionCode will auto-increment
eas build --platform android --profile development

# Preview build - versionCode will auto-increment
eas build --platform android --profile preview

# Production build - versionCode will auto-increment
eas build --platform android --profile production
```

### What happens:
1. EAS reads `versionCode: 11` from your `app.json`
2. Automatically increments to `12` for the build
3. Your `app.json` stays at `11` (unchanged)
4. Next build will use `12` and increment to `13`

## Benefits of EAS Auto-Increment:
✅ **No manual editing** required
✅ **Automatic on every build**
✅ **Prevents version conflicts**
✅ **Works across team members**
✅ **Consistent incrementing**

## Best Practices:
1. **Use EAS auto-increment** for automated builds
2. **Manually increment** only when needed for local testing
3. **Keep version names semantic** (5.0.3, 5.1.0, 6.0.0)
4. **Document major version changes** in release notes

Your setup is now fully automated! 🎉