import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TotpScreenProps {
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (token: string) => void;
  onBack?: () => void;
}

export function TotpScreen({ isSubmitting, error, onSubmit, onBack }: TotpScreenProps) {
  const [token, setToken] = React.useState('');

  const handleSubmit = () => {
    if (!token) {
      return;
    }
    onSubmit(token.trim());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Two-factor authentication</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code from your authenticator app.</Text>
          </View>

          <TextInput
            keyboardType="number-pad"
            placeholder="123456"
            value={token}
            onChangeText={setToken}
            maxLength={6}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#2ef6fc', '#fc040e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonInner}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {onBack ? (
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.secondaryAction}>Back to login</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Extra layer of security</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  wrapper: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    padding: 24,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardHeader: {
    gap: 4,
  },
  title: {
    fontSize: 22,
    color: '#0f172a',
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: 22,
    letterSpacing: 12,
    textAlign: 'center',
  },
  button: {
    borderRadius: 16,
  },
  buttonInner: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
  secondaryAction: {
    textAlign: 'center',
    color: '#475569',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
  },
});
