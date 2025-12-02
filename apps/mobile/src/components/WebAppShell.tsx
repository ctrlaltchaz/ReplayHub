import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

interface WebAppShellProps {
  url: string;
  onLogout?: () => void;
  onReload?: () => void;
  onLoaded?: () => void;
  onOpenSettings?: () => void;
}

const logoSource = require('../../assets/replayicon.png');

export function WebAppShell({
  url,
  onLogout,
  onReload,
  onLoaded,
  onOpenSettings,
}: WebAppShellProps) {
  const webViewRef = React.useRef<WebView>(null);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <LinearGradient
          colors={['#2ef6fc', '#fc040e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}
        >
          <View style={styles.topTitleWrapper}>
            <Image source={logoSource} style={styles.topLogo} resizeMode="contain" />
            <Text style={styles.topBarTitle}>ReplayHub Mobile</Text>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.topButton} onPress={() => onReload?.()}>
              <Text style={styles.topButtonText}>Reload</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topButton} onPress={() => onOpenSettings?.()}>
              <Text style={styles.topButtonText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topButton} onPress={() => onLogout?.()}>
              <Text style={styles.topButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.webContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webView}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            startInLoadingState
            pullToRefreshEnabled
            allowsBackForwardNavigationGestures
            onLoadEnd={() => onLoaded?.()}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505',
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#050505',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  topBarTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  topTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topLogo: {
    height: 20,
    width: 20,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  topButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
  },
});
