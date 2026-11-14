import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/PrimaryButton';
import SegmentedControl from '../../components/SegmentedControl';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../../constants/theme';

const ROLE_OPTIONS = [
  { id: 'customer', label: 'Player' },
  { id: 'owner', label: 'Turf Owner' },
];

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [quickLoadingRole, setQuickLoadingRole] = useState(null);

  function handleLogin() {
    setError('');
    if (!identifier.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    login({
      email: identifier.includes('@') ? identifier.trim() : undefined,
      phone: !identifier.includes('@') ? identifier.trim() : undefined,
      password,
      role,
    }).catch((err) => {
      setError(err?.message || 'Login failed. Please check your credentials.');
    });
  }

  function handleQuickLogin(demoEmail, demoPassword, demoRole) {
    setError('');
    setIdentifier(demoEmail);
    setPassword(demoPassword);
    setRole(demoRole === 'admin' ? 'customer' : demoRole);
    setQuickLoadingRole(demoRole);

    login({
      email: demoEmail,
      password: demoPassword,
      role: demoRole,
    }).catch((err) => {
      setError(err?.message || 'Login failed. Please try again.');
    }).finally(() => {
      setQuickLoadingRole(null);
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand block */}
          <View style={styles.brand}>
            <View style={styles.logoCircle}>
              <Ionicons name="football" size={36} color={COLORS.white} />
            </View>
            <Text style={styles.brandTitle}>SPORTZFY</Text>
            <Text style={styles.brandSub}>Book Pitches. Play Matches. Dominate.</Text>
          </View>

          {/* Quick 1-Tap Demo Logins */}
          <View style={styles.quickLoginCard}>
            <View style={styles.quickHeader}>
              <Ionicons name="flash" size={16} color={COLORS.primary} />
              <Text style={styles.quickHeaderTitle}>1-TAP QUICK DEMO LOGIN</Text>
            </View>
            <Text style={styles.quickHeaderSub}>
              Tap either profile below to sign in instantly without typing:
            </Text>

            <View style={styles.quickBtnRow}>
              {/* Player Button */}
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => handleQuickLogin('player@sportzfy.com', 'sportzfy123', 'customer')}
                disabled={loading}
                activeOpacity={0.7}
              >
                {quickLoadingRole === 'customer' ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <Text style={styles.quickEmoji}>⚽</Text>
                    <Text style={styles.quickRoleText}>Player</Text>
                    <Text style={styles.quickNameText}>Sakib</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Turf Owner Button */}
              <TouchableOpacity
                style={styles.quickBtn}
                onPress={() => handleQuickLogin('owner@sportzfy.com', 'sportzfy123', 'owner')}
                disabled={loading}
                activeOpacity={0.7}
              >
                {quickLoadingRole === 'owner' ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <Text style={styles.quickEmoji}>🏟️</Text>
                    <Text style={styles.quickRoleText}>Turf Owner</Text>
                    <Text style={styles.quickNameText}>Tariqul</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SIGN IN WITH ACCOUNT</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.label}>Email or Mobile Number</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="person-outline"
                size={18}
                color={COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="player@sportzfy.com"
                placeholderTextColor={COLORS.textPlaceholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            <Text style={styles.label}>Account Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textPlaceholder}
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPwd((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Signing in as</Text>
            <SegmentedControl options={ROLE_OPTIONS} value={role} onChange={setRole} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={{ height: SPACING.lg }} />

            <PrimaryButton
              title={loading && !quickLoadingRole ? 'Verifying...' : 'Sign In'}
              loading={loading && !quickLoadingRole}
              onPress={handleLogin}
            />

            <TouchableOpacity
              style={styles.signupRow}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.signupText}>
                New to Sportzfy?{' '}
                <Text style={styles.signupLink}>Create an account</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.legal}>
            By signing in you accept Sportzfy's Terms of Play & Privacy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  brand: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  brandTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: FONT_SIZE.xs + 1,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: FONT_WEIGHT.medium,
  },
  quickLoginCard: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryTint,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickHeaderTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  quickHeaderSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  quickBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryTint,
    ...SHADOWS.sm,
  },
  quickEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  quickRoleText: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primaryDark,
  },
  quickNameText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: FONT_SIZE.xs + 1,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  eyeBtn: {
    paddingLeft: SPACING.sm,
  },
  signupRow: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  signupText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontWeight: FONT_WEIGHT.medium,
  },
  legal: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },
});
