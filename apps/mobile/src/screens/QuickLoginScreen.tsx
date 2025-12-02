import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface QuickLoginScreenProps {
  userEmail: string;
  userName?: string | null;
  userAvatar?: string | null;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (pin: string) => void;
  onUsePassword: () => void;
}

const logoSource = require('../../assets/replayicon.png');

export function QuickLoginScreen({
  userEmail,
  userName,
  userAvatar,
  isSubmitting,
  error,
  onSubmit,
  onUsePassword,
}: QuickLoginScreenProps) {
  const [pin, setPin] = React.useState('');
  const [avatarError, setAvatarError] = React.useState(false);

  const handlePinChange = (text: string) => {
    const numericText = text.replace(/\D/g, '').slice(0, 6);
    setPin(numericText);
  };

  const handleSubmit = () => {
    if (pin.length >= 4) {
      onSubmit(pin);
    }
  };

  const getAvatarUrl = () => {
    if (!userAvatar) return null;
    // Use API_URL from env or default to localhost
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
    return `${baseUrl}${userAvatar}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {/* User Avatar or Initial */}
              {userAvatar && !avatarError ? (
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: getAvatarUrl()! }}
                    style={styles.avatar}
                    onError={() => setAvatarError(true)}
                  />
                </View>
              ) : (
                <View style={styles.avatarInitial}>
                  <Text style={styles.initialText}>
                    {(userName || userEmail).charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.userInfo}>{userName || userEmail}</Text>
              {userName && <Text style={styles.email}>{userEmail}</Text>}
              <Text style={styles.subtitle}>Enter your PIN to continue</Text>
            </View>

            <View style={styles.fieldGroup}>
              <TextInput
                keyboardType="number-pad"
                secureTextEntry
                placeholder="••••"
                style={styles.pinInput}
                value={pin}
                onChangeText={handlePinChange}
                maxLength={6}
                autoFocus
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, (isSubmitting || pin.length < 4) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || pin.length < 4}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#2ef6fc', '#fc040e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {isSubmitting ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.buttonText}>Unlocking...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Unlock</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={onUsePassword}>
              <Text style={styles.secondaryAction}>Sign in with password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    alignItems: 'center',
    gap: 28,
  },
  brand: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  logoWrapper: {
    height: 64,
    width: 64,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 40,
    width: 40,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHeader: {
    gap: 8,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2ef6fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  initialText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  email: {
    fontSize: 14,
    color: '#64748b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  fieldGroup: {
    gap: 6,
  },
  pinInput: {
    height: 56,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    color: '#1a1a2e',
    backgroundColor: '#f8fafc',
  },
  error: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  secondaryAction: {
    fontSize: 14,
    color: '#2ef6fc',
    fontWeight: '600',
    textAlign: 'center',
  },
});
