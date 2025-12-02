import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginScreenProps {
  initialValues?: Partial<LoginFormValues>;
  isSubmitting: boolean;
  error?: string | null;
  debugMessage?: string | null;
  onSubmit: (values: LoginFormValues) => void;
  onClearStorage?: () => void;
}

const logoSource = require('../../assets/replayicon.png');

export function LoginScreen({
  initialValues,
  isSubmitting,
  error,
  debugMessage,
  onSubmit,
  onClearStorage,
}: LoginScreenProps) {
  const [email, setEmail] = React.useState(initialValues?.email ?? '');
  const [password, setPassword] = React.useState(initialValues?.password ?? '');
  const [rememberMe, setRememberMe] = React.useState(initialValues?.rememberMe ?? true);

  React.useEffect(() => {
    if (initialValues) {
      if (typeof initialValues.email === 'string') {
        setEmail(initialValues.email);
      }
      if (typeof initialValues.password === 'string') {
        setPassword(initialValues.password);
      }
      if (typeof initialValues.rememberMe === 'boolean') {
        setRememberMe(initialValues.rememberMe);
      }
    }
  }, [initialValues]);

  const handleSubmit = () => {
    if (!email || !password) {
      return;
    }
    onSubmit({ email, password, rememberMe });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <View style={styles.brand}>
            <View style={styles.logoWrapper}>
              <Image source={logoSource} style={styles.logo} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.brandTitle}>ReplayHub</Text>
              <Text style={styles.brandSubtitle}>Operations platform for modern esports</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to access your account</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@org.gg"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                secureTextEntry
                placeholder="••••••••"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.rememberToggle}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Switch value={rememberMe} onValueChange={setRememberMe} />
                <View>
                  <Text style={styles.rememberLabel}>Remember me</Text>
                  <Text style={styles.rememberHint}>Keeps you signed in on this device</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgot}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {debugMessage ? <Text style={styles.debug}>{debugMessage}</Text> : null}

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
                style={styles.buttonGradient}
              >
                {isSubmitting ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.buttonText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Sign in</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {onClearStorage ? (
              <TouchableOpacity onPress={onClearStorage}>
                <Text style={styles.secondaryAction}>Clear saved credentials</Text>
              </TouchableOpacity>
            ) : null}
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
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardHeader: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    fontSize: 15,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  rememberToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  forgot: {
    color: '#0ea5e9',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  rememberLabel: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 13,
  },
  rememberHint: {
    color: '#94a3b8',
    fontSize: 12,
  },
  button: {
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonGradient: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    padding: 10,
  },
  secondaryAction: {
    marginTop: 10,
    textAlign: 'center',
    color: '#94a3b8',
  },
  debug: {
    color: '#0f766e',
    fontSize: 11,
  },
});
