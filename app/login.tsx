import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, Dimensions, StatusBar, ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring, withSequence,
  interpolate, Easing, runOnJS, FadeInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { RoleCard } from '../components/ui/RoleCard';
import { PinInput } from '../components/ui/PinInput';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useAuthStore } from '../store/authStore';
import { ROLE_LABELS } from '../constants/auth';
import { Colors, Radius, Spacing, Shadow } from '../constants/theme';
import type { AppRole } from '../types';

const { width } = Dimensions.get('window');

const ROLE_CFG: Record<AppRole, { accent: readonly [string, string]; icon: React.ComponentProps<typeof Feather>['name'] }> = {
  user:  { accent: [Colors.teal, '#138070'],   icon: 'compass' },
  admin: { accent: [Colors.purple, '#5248A0'], icon: 'shield'  },
};

type Step = 'role' | 'pin';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const login = useAuthStore(s => s.login);

  const [step, setStep]       = useState<Step>('role');
  const [selected, setSelected] = useState<AppRole>('user');
  const [pin, setPin]         = useState('');
  const [error, setError]     = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const heroOp = useSharedValue(0);
  const formY  = useSharedValue(40);

  useEffect(() => {
    heroOp.value = withTiming(1, { duration: 600 });
    formY.value  = withDelay(300, withSpring(0, { stiffness: 100, damping: 16 }));
  }, []);

  useEffect(() => {
    setPin('');
    setError(false);
    setErrorMsg('');
  }, [selected, step]);

  const heroAnim = useAnimatedStyle(() => ({ opacity: heroOp.value }));
  const formAnim = useAnimatedStyle(() => ({
    opacity: heroOp.value,
    transform: [{ translateY: formY.value }],
  }));

  const navigate = () => router.replace('/(tabs)');

  const handleLogin = (code?: string) => {
    const finalCode = code ?? pin;
    if (finalCode.length < 4) return;

    setLoading(true);
    const result = login(selected, finalCode);

    if (!result.ok) {
      setError(true);
      setErrorMsg(result.error ?? 'Code incorrect');
      setPin('');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      navigate();
    }, 400);
  };

  const goToPin = () => {
    formY.value = withSequence(
      withTiming(20, { duration: 150 }),
      withTiming(0,  { duration: 300, easing: Easing.out(Easing.cubic) })
    );
    setStep('pin');
  };

  const cfg = ROLE_CFG[selected];
  const labels = ROLE_LABELS[selected];

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" />

      {/* Fond décoratif */}
      <LinearGradient
        colors={['#FFF8F6', '#FFFFFF', '#F0FAF8']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.blob, styles.blobOrange]} />
      <View style={[styles.blob, styles.blobTeal]} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={styles.logoRing}>
            <LinearGradient colors={[`${Colors.orange}20`, `${Colors.teal}10`]} style={styles.logoGrad}>
              <Image source={require('../assets/archibo-logo.png')} style={styles.logo} resizeMode="contain" />
            </LinearGradient>
          </View>
          <Text style={styles.brand}>
            <Text style={{ color: Colors.orange }}>ARCHI</Text>
            <Text style={{ color: Colors.navy }}>BO.</Text>
          </Text>
          <Text style={styles.tagline}>Connexion sécurisée · Studio Tunis</Text>
        </Animated.View>

        {/* Formulaire */}
        <Animated.View style={[styles.form, formAnim]}>
          {step === 'role' ? (
            <>
              <Text style={styles.stepTitle}>Choisissez votre espace</Text>
              <Text style={styles.stepSub}>Sélectionnez votre profil pour accéder à l'interface dédiée</Text>

              <View style={styles.cards}>
                {(['user', 'admin'] as AppRole[]).map((r, i) => (
                  <RoleCard
                    key={r}
                    role={r}
                    title={ROLE_LABELS[r].title}
                    subtitle={ROLE_LABELS[r].subtitle}
                    icon={ROLE_CFG[r].icon}
                    selected={selected === r}
                    onPress={() => setSelected(r)}
                    accent={ROLE_CFG[r].accent}
                    delay={i * 80}
                  />
                ))}
              </View>

              <AnimatedButton
                label="Continuer"
                onPress={goToPin}
                variant="primary"
                size="lg"
                iconRight="arrow-right"
                fullWidth
                premium
              />
            </>
          ) : (
            <>
              <TouchableBack onPress={() => setStep('role')} />

              <View style={[styles.pinHeader, { borderColor: `${cfg.accent[0]}30` }]}>
                <LinearGradient colors={[`${cfg.accent[0]}25`, `${cfg.accent[1]}10`]} style={styles.pinIconWrap}>
                  <Feather name={cfg.icon} size={22} color={cfg.accent[0]} />
                </LinearGradient>
                <View>
                  <Text style={styles.pinTitle}>{labels.title}</Text>
                  <Text style={styles.pinSub}>Entrez votre code d'accès à 4 chiffres</Text>
                </View>
              </View>

              <PinInput
                value={pin}
                onChange={(v) => { setPin(v); setError(false); setErrorMsg(''); }}
                error={error}
                onComplete={handleLogin}
              />

              {errorMsg ? (
                <Animated.View entering={FadeInDown.duration(200)} style={styles.errorBox}>
                  <Feather name="alert-circle" size={14} color={Colors.urgent} />
                  <Text style={styles.errorTxt}>{errorMsg}</Text>
                </Animated.View>
              ) : (
                <Text style={styles.hint}>
                  Code maquette · Terrain <Text style={styles.hintCode}>7426</Text> · Direction <Text style={styles.hintCode}>7752</Text>
                </Text>
              )}

              <AnimatedButton
                label={loading ? 'Vérification…' : 'Accéder à l\'espace'}
                onPress={() => handleLogin()}
                variant={selected === 'admin' ? 'secondary' : 'teal'}
                size="lg"
                icon="lock"
                iconRight="arrow-right"
                fullWidth
                premium
                disabled={pin.length < 4}
                loading={loading}
              />
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function TouchableBack({ onPress }: { onPress: () => void }) {
  return (
    <AnimatedButton
      label="Retour"
      onPress={onPress}
      variant="ghost"
      size="sm"
      icon="arrow-left"
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['2xl'] },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.45,
  },
  blobOrange: {
    width: width * 0.7, height: width * 0.7,
    backgroundColor: `${Colors.orange}12`,
    top: -width * 0.2, right: -width * 0.25,
  },
  blobTeal: {
    width: width * 0.5, height: width * 0.5,
    backgroundColor: `${Colors.teal}10`,
    bottom: 80, left: -width * 0.15,
  },
  hero: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  logoRing: { ...Shadow.lg, borderRadius: 80, marginBottom: Spacing.md },
  logoGrad: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: `${Colors.orange}20`,
  },
  logo: { width: 80, height: 80 },
  brand: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  tagline: {
    color: Colors.textMuted, fontSize: 11, fontWeight: '600',
    letterSpacing: 2, textTransform: 'uppercase', marginTop: 4,
  },
  form: { gap: Spacing.lg },
  stepTitle: {
    fontSize: 22, fontWeight: '800', color: Colors.textPrimary,
    letterSpacing: -0.5, textAlign: 'center',
  },
  stepSub: {
    fontSize: 13, color: Colors.textMuted, textAlign: 'center',
    lineHeight: 20, marginTop: -8,
  },
  cards: { gap: 12 },
  pinHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: Radius.xl, borderWidth: 1,
    backgroundColor: Colors.card, ...Shadow.sm,
  },
  pinIconWrap: {
    width: 48, height: 48, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  pinTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  pinSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  hint: {
    textAlign: 'center', fontSize: 11, color: Colors.textDisabled, lineHeight: 18,
  },
  hintCode: {
    fontWeight: '800', color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.urgentDim, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.urgentBorder,
  },
  errorTxt: { color: Colors.urgent, fontSize: 13, fontWeight: '600' },
});
