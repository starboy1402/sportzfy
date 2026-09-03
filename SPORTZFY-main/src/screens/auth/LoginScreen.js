// LoginScreen — first screen a guest sees.
// Asks for email (or phone) + password, plus a role picker so the user can
// decide which app they want to enter (Customer / Turf Owner / Admin).
// All values are mocked — see AuthContext for the fake auth flow.

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '../../components/PrimaryButton';
import SegmentedControl from '../../components/SegmentedControl';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

// Only two roles ship for now. Admin role UI is deferred.
const ROLE_OPTIONS = [
  { id: 'customer', label: 'Customer' },
  { id: 'owner', label: 'Turf Owner' },
];

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();

  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');

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
      setError(err?.message || 'Login failed. Please try again.');
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
              <Ionicons name="football" size={36} color={COLORS.textOnPrimary} />
            </View>
            <Text style={styles.brandTitle}>Sportzfy</Text>
            <Text style={styles.brandSub}>Sign in to book & manage turfs</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Email or phone</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="person-outline"
                size={18}
                color={COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            <Text style={styles.label}>Password</Text>
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
                placeholderTextColor={COLORS.textMuted}
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
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Sign in as</Text>
            <SegmentedControl options={ROLE_OPTIONS} value={role} onChange={setRole} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={{ height: SPACING.lg }} />

            <PrimaryButton
              title={loading ? 'Signing in...' : 'Sign In'}
              loading={loading}
              onPress={handleLogin}
            />

            <TouchableOpacity
              style={styles.signupRow}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.signupText}>
                Don't have an account?{' '}
                <Text style={styles.signupLink}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.legal}>
            By continuing you agree to Sportzfy's Terms & Privacy.
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
    paddingTop: SPACING.xxl,
  },
  brand: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  brandTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  brandSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
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
    fontWeight: FONT_WEIGHT.semibold,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  legal: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
  },
});