# ReplayHub Mobile App

Native iOS and Android wrapper for the ReplayHub esports operations platform. Built with Expo and React Native.

## Features

- **Native Authentication** - Login screen with secure credential storage
- **2FA Support** - Built-in TOTP verification flow
- **WebView Integration** - Seamless transition to full web dashboard
- **Session Management** - Shared cookies between native and web contexts
- **Auto-Login** - Optional credential persistence with device keychain/keystore
- **Settings Menu** - Clear credentials, reload, and logout controls

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Environment Variables

Create a `.env` file in this directory:

```env
EXPO_PUBLIC_API_URL=https://api.replayhub.app/api
EXPO_PUBLIC_WEB_APP_URL=https://app.replayhub.app
```

For local development:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_WEB_APP_URL=http://localhost:3000
```

## Building for Production

### Android

```bash
# Development build
npm run android

# Production build (requires EAS)
eas build -p android --profile production
```

### iOS

```bash
# Development build (macOS only)
npm run ios

# Production build (requires EAS and Apple Developer account)
eas build -p ios --profile production
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── api/              # API client functions
│   │   └── auth.ts       # Authentication endpoints
│   ├── components/       # React Native components
│   │   ├── LoadingScreen.tsx
│   │   └── WebAppShell.tsx
│   ├── constants/        # Configuration constants
│   │   └── env.ts        # Environment variables
│   ├── screens/          # Full-screen views
│   │   ├── LoginScreen.tsx
│   │   └── TotpScreen.tsx
│   ├── storage/          # Local storage utilities
│   │   └── credentials.ts
│   └── App.tsx           # Main app logic
├── assets/               # Icons and images
├── android/              # Android native code
├── app.config.ts         # Expo configuration
├── App.tsx               # Entry point
└── package.json
```

## Authentication Flow

1. **Boot** → Check for saved credentials in SecureStore
2. **Auto-Login** → Attempt login if credentials found
3. **Manual Login** → Show native login screen if needed
4. **2FA** → Verify TOTP if enabled for user
5. **WebView** → Load web dashboard with shared session cookie
6. **Persistence** → Store credentials if "Remember Me" is checked

## Configuration

### Identifiers

Update these in `app.config.ts` before publishing:

- **iOS**: `ios.bundleIdentifier` → `com.yourcompany.replayhub`
- **Android**: `android.package` → `com.yourcompany.replayhub`

### Permissions

- **iOS**: Camera permission for avatar uploads (already configured)
- **Android**: Camera permission automatically included

## Architecture

The mobile app uses a **hybrid approach**:

- Native authentication screens for optimal UX and credential security
- WebView for the main dashboard to share codebase with web app
- Session cookies shared between native and WebView contexts
- Secure credential storage using OS-level keychains

This approach provides:

- ✅ Native-feeling login experience
- ✅ Secure credential storage
- ✅ No code duplication for dashboard UI
- ✅ Automatic updates (web content)
- ✅ Fast time-to-market

## Troubleshooting

### Metro bundler issues

```bash
# Clear Metro cache
npx expo start --clear
```

### Android build errors

```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

### iOS build errors

```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..
```

## Documentation

See [`docs/mobile-app.md`](../../docs/mobile-app.md) for detailed setup instructions, environment configuration, and store deployment guide.

## Tech Stack

- **Framework**: Expo (~54.0)
- **Runtime**: React Native (0.81)
- **Language**: TypeScript (5.9)
- **Storage**: expo-secure-store
- **WebView**: react-native-webview
- **UI**: React Native core components

## License

Proprietary - ReplayHub Platform
