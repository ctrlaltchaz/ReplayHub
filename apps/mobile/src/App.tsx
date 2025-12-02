import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  UniversalLoginResponse,
  checkQuickLoginAvailable,
  fetchSessionProfile,
  loginWithEmail,
  logoutSession,
  verifyQuickLoginPin,
  verifyTotpCode,
} from './api/auth';
import { LoadingScreen } from './components/LoadingScreen';
import { WebAppShell } from './components/WebAppShell';
import { WEB_APP_URL } from './constants/env';
import { LoginFormValues, LoginScreen } from './screens/LoginScreen';
import { QuickLoginScreen } from './screens/QuickLoginScreen';
import { TotpScreen } from './screens/TotpScreen';
import {
  clearCredentials,
  loadCredentials,
  loadQuickLoginEmail,
  saveCredentials,
  saveQuickLoginEmail,
} from './storage/credentials';

const LOAD_MESSAGE = 'Checking saved credentials';

type Stage = 'loading' | 'quickLogin' | 'login' | 'totp' | 'web';

export default function App() {
  const [stage, setStage] = React.useState<Stage>('loading');
  const [loginPending, setLoginPending] = React.useState(false);
  const [quickLoginPending, setQuickLoginPending] = React.useState(false);
  const [totpPending, setTotpPending] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [quickLoginError, setQuickLoginError] = React.useState<string | null>(null);
  const [totpError, setTotpError] = React.useState<string | null>(null);
  const [debugMessage, setDebugMessage] = React.useState<string | null>(null);
  const [initialValues, setInitialValues] = React.useState<Partial<LoginFormValues>>();
  const [pendingCreds, setPendingCreds] = React.useState<LoginFormValues | null>(null);
  const [quickLoginEmail, setQuickLoginEmail] = React.useState<string | null>(null);
  const [quickLoginName, setQuickLoginName] = React.useState<string | null>(null);
  const [quickLoginAvatar, setQuickLoginAvatar] = React.useState<string | null>(null);
  const [pendingLoginResponse, setPendingLoginResponse] =
    React.useState<UniversalLoginResponse | null>(null);
  const [webKey, setWebKey] = React.useState(0);
  const [webUrl, setWebUrl] = React.useState(WEB_APP_URL);
  const [webReady, setWebReady] = React.useState(false);
  const webOpacity = React.useRef(new Animated.Value(0)).current;
  const [settingsVisible, setSettingsVisible] = React.useState(false);

  const resolveLandingPath = React.useCallback((response?: UniversalLoginResponse | null) => {
    if (!response) {
      return '/';
    }

    const memberships = response.user?.memberships ?? [];
    const globalOrgs =
      response.user?.globalOrganisations ?? response.globalUser?.organizations ?? [];
    const hasGlobalAccount = response.user?.hasGlobalAccount ?? Boolean(response.globalUser);
    const isGlobalAdmin =
      response.user?.isGlobalAdmin ?? response.globalUser?.isGlobalAdmin ?? false;

    if (hasGlobalAccount && globalOrgs.length === 0 && memberships.length === 0) {
      return '/admin/get-started';
    }

    if (isGlobalAdmin) {
      return '/admin/control-center';
    }

    const activeMembership = memberships.find(membership => membership.isActive) ?? memberships[0];
    if (activeMembership?.tenantSlug) {
      return `/org/${activeMembership.tenantSlug}/dashboard`;
    }

    if (globalOrgs.length === 1) {
      return `/org/${globalOrgs[0].slug}/overview`;
    }

    if (memberships.length > 1 || globalOrgs.length > 1) {
      return '/org/select';
    }

    return '/admin/overview';
  }, []);

  const finalizeAuth = React.useCallback(
    async (values: LoginFormValues, response?: UniversalLoginResponse | null) => {
      if (values.rememberMe) {
        await saveCredentials(values);
      } else {
        await clearCredentials();
      }

      try {
        await fetchSessionProfile();
      } catch (error) {
        console.warn('Session fetch failed after login', error);
      }

      const landingPath = resolveLandingPath(response ?? pendingLoginResponse);
      setWebUrl(`${WEB_APP_URL}${landingPath}`);
      setWebReady(false);
      webOpacity.setValue(0);

      setPendingCreds(null);
      setPendingLoginResponse(null);
      setStage('web');
      setWebKey(prev => prev + 1);
    },
    [WEB_APP_URL, pendingLoginResponse, resolveLandingPath, webOpacity]
  );

  const attemptLogin = React.useCallback(
    async (values: LoginFormValues, silent = false) => {
      if (!silent) {
        setLoginPending(true);
        setLoginError(null);
      }

      try {
        const response = await loginWithEmail(values.email, values.password, values.rememberMe);
        setDebugMessage(null);
        setPendingCreds(values);

        if (response.requiresTotp) {
          setPendingLoginResponse(response);
          setStage('totp');
          return response;
        }

        await finalizeAuth(values, response);
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to sign in';
        setDebugMessage(error instanceof Error ? (error.stack ?? error.message) : 'Unknown error');
        if (!silent) {
          setLoginError(message);
        } else {
          setLoginError('Saved credentials are no longer valid. Please sign in again.');
        }
        setStage('login');
        throw error;
      } finally {
        if (!silent) {
          setLoginPending(false);
        }
      }
    },
    [finalizeAuth]
  );

  const handleTotpSubmit = React.useCallback(
    async (token: string) => {
      if (!pendingCreds || !pendingLoginResponse) {
        return;
      }

      setTotpPending(true);
      setTotpError(null);

      try {
        const userType: 'global' | 'org' =
          pendingLoginResponse.user?.hasGlobalAccount || pendingLoginResponse.userType === 'global'
            ? 'global'
            : 'org';
        const tenantSlug = pendingLoginResponse.user?.memberships?.[0]?.tenantSlug;
        const result = await verifyTotpCode({ token, userType, tenantSlug });
        setDebugMessage(null);
        await finalizeAuth(pendingCreds, result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to verify authentication code';
        setTotpError(message);
        setDebugMessage(error instanceof Error ? (error.stack ?? error.message) : 'Unknown error');
      } finally {
        setTotpPending(false);
      }
    },
    [pendingCreds, pendingLoginResponse, finalizeAuth]
  );

  const handleQuickLoginSubmit = React.useCallback(
    async (pin: string) => {
      if (!quickLoginEmail) return;

      setQuickLoginPending(true);
      setQuickLoginError(null);

      try {
        const response = await verifyQuickLoginPin(quickLoginEmail, pin);
        await saveQuickLoginEmail(quickLoginEmail);
        await finalizeAuth({ email: quickLoginEmail, password: '', rememberMe: true }, response);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid PIN';
        setQuickLoginError(message);
      } finally {
        setQuickLoginPending(false);
      }
    },
    [quickLoginEmail, finalizeAuth]
  );

  const handleLogout = React.useCallback(async () => {
    try {
      await logoutSession();
    } catch (error) {
      console.warn('Failed to logout session', error);
    }
    await clearCredentials();
    setPendingCreds(null);
    setPendingLoginResponse(null);
    setStage('login');
  }, []);

  const handleClearStorage = React.useCallback(async () => {
    await clearCredentials();
    Alert.alert('Credentials removed', 'Saved credentials were deleted from this device.');
  }, []);

  React.useEffect(() => {
    const bootstrap = async () => {
      // Check for Quick Login first
      const savedEmail = await loadQuickLoginEmail();
      if (savedEmail) {
        try {
          const quickLoginCheck = await checkQuickLoginAvailable(savedEmail);
          if (quickLoginCheck.available && quickLoginCheck.user) {
            setQuickLoginEmail(savedEmail);
            setQuickLoginName(quickLoginCheck.user.name || null);
            setQuickLoginAvatar(quickLoginCheck.user.avatar || null);
            setStage('quickLogin');
            return;
          }
        } catch (error) {
          console.warn('Quick login check failed', error);
        }
      }

      // Fall back to saved credentials
      const stored = await loadCredentials();
      if (stored) {
        const defaults: LoginFormValues = {
          email: stored.email,
          password: stored.password,
          rememberMe: stored.rememberMe,
        };
        setInitialValues(defaults);
        try {
          await attemptLogin(defaults, true);
          return;
        } catch {
          // Fall back to manual login if automatic login fails
        }
      }
      setStage('login');
    };

    bootstrap();
  }, [attemptLogin]);

  let content = null;

  if (stage === 'loading') {
    content = <LoadingScreen message={LOAD_MESSAGE} />;
  } else if (stage === 'quickLogin') {
    content = (
      <QuickLoginScreen
        userEmail={quickLoginEmail!}
        userName={quickLoginName}
        userAvatar={quickLoginAvatar}
        isSubmitting={quickLoginPending}
        error={quickLoginError}
        onSubmit={handleQuickLoginSubmit}
        onUsePassword={() => setStage('login')}
      />
    );
  } else if (stage === 'login') {
    content = (
      <LoginScreen
        initialValues={initialValues}
        isSubmitting={loginPending}
        error={loginError}
        debugMessage={debugMessage}
        onSubmit={values => attemptLogin(values)}
        onClearStorage={handleClearStorage}
      />
    );
  } else if (stage === 'totp') {
    content = (
      <TotpScreen
        isSubmitting={totpPending}
        error={totpError}
        onSubmit={handleTotpSubmit}
        onBack={() => setStage('login')}
      />
    );
  } else {
    content = (
      <>
        <Animated.View style={{ flex: 1, opacity: webOpacity }}>
          <WebAppShell
            key={webKey}
            url={webUrl}
            onLogout={handleLogout}
            onReload={() => {
              setWebReady(false);
              webOpacity.setValue(0);
              setWebKey(prev => prev + 1);
            }}
            onLoaded={() => {
              setWebReady(true);
              Animated.timing(webOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }).start();
            }}
            onOpenSettings={() => setSettingsVisible(true)}
          />
        </Animated.View>
        {!webReady ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <LoadingScreen message="Loading dashboard..." light />
          </View>
        ) : null}
        <SettingsModal
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          onClearCredentials={handleClearStorage}
          onLogout={() => {
            setSettingsVisible(false);
            handleLogout();
          }}
        />
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {content}
    </View>
  );
}

function SettingsModal({
  visible,
  onClose,
  onClearCredentials,
  onLogout,
}: {
  visible: boolean;
  onClose: () => void;
  onClearCredentials: () => void;
  onLogout: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.settingsOverlay}>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Mobile App Settings</Text>
          <Text style={styles.settingsSubtitle}>Manage local preferences</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              onClearCredentials();
              onClose();
            }}
          >
            <Text style={styles.settingsButtonText}>Clear saved credentials</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              onLogout();
            }}
          >
            <Text style={styles.settingsButtonText}>Sign out everywhere</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,5,0.8)',
  },
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  settingsCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  settingsTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
  },
  settingsSubtitle: {
    color: '#64748b',
  },
  settingsButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 16,
  },
  settingsButtonText: {
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
  },
  closeButtonText: {
    color: '#64748b',
    textAlign: 'center',
  },
});
