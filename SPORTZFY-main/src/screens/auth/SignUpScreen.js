// SignUpScreen — multi-field register form. The role picker decides
// which app shell the new user lands in (Customer / Turf Owner / Admin).
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

export default function SignUpScreen({ navigation }) {
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');

  function handleRegister() {
    setError('');
    if (!name.trim()) {
      setError('Please tell us your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    register({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
      role,
    }).catch((err) => {
      setError(err?.message || 'Sign up failed. Please try again.');
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
          {/* Top bar with back */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Create account</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Field
              label="Full name"
              icon="person-outline"
              placeholder="Your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Field
              label="Phone"
              icon="call-outline"
              placeholder="+880 1XXX-XXXXXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Field
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

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
                placeholder="At least 6 characters"
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

            <Text style={styles.label}>I am signing up as</Text>
            <SegmentedControl options={ROLE_OPTIONS} value={role} onChange={setRole} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={{ height: SPACING.lg }} />

            <PrimaryButton
              title={loading ? 'Creating account...' : 'Create Account'}
              loading={loading}
              onPress={handleRegister}
            />

            <TouchableOpacity
              style={styles.loginRow}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Reusable text field row.
function Field({ label, icon, ...inputProps }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons
          name={icon}
          size={18}
          color={COLORS.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
          {...inputProps}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
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
  loginRow: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  loginText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});