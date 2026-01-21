import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

type AlertType = 'info' | 'success' | 'error' | 'warning';

type AlertPayload = {
  title: string;
  message?: string;
  type?: AlertType;
  durationMs?: number;
};

type Ctx = {
  showAlert: (p: AlertPayload) => void;
};

const InAppAlertContext = createContext<Ctx | undefined>(undefined);

export function useInAppAlert() {
  const ctx = useContext(InAppAlertContext);
  if (!ctx) throw new Error('useInAppAlert must be used within InAppAlertProvider');
  return ctx;
}

export function InAppAlertProvider({ children }: { children: React.ReactNode }) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [payload, setPayload] = useState<AlertPayload | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const colors = useMemo(() => ({
    info: { bg: c.isDark ? '#111827' : '#FFFFFF', border: c.border },
    success: { bg: '#10B981', border: '#059669' },
    error: { bg: '#EF4444', border: '#DC2626' },
    warning: { bg: '#F59E0B', border: '#D97706' },
  }), [c]);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      setPayload(null);
    });
  }, [opacity, translateY]);

  const showAlert = useCallback((p: AlertPayload) => {
    console.log('📢 Showing alert:', p);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPayload(p);
    setVisible(true);
    translateY.setValue(-100);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();

    const duration = p.durationMs ?? 3000;
    timerRef.current = setTimeout(hide, duration);
  }, [hide, opacity, translateY]);

  const type: AlertType = payload?.type ?? 'info';
  const palette = colors[type];

  return (
    <InAppAlertContext.Provider value={{ showAlert }}>
      {children}
      {visible && payload && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFill,
            { opacity },
          ]}
        >
          <View pointerEvents="box-none" style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : (c.isDark ? '#1F2937' : '#FFFFFF'),
                  borderLeftWidth: 4,
                  borderLeftColor: type === 'success' ? '#059669' : type === 'error' ? '#DC2626' : type === 'warning' ? '#D97706' : c.primary,
                  borderColor: type === 'info' ? c.border : 'transparent',
                  shadowColor: '#000',
                  transform: [{ translateY }],
                },
              ]}
            >
              <Pressable onPress={hide} style={styles.content}>
                <View style={styles.iconContainer}>
                  {type === 'success' && (
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    </View>
                  )}
                  {type === 'error' && (
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Ionicons name="close-circle" size={24} color="#FFFFFF" />
                    </View>
                  )}
                  {type === 'warning' && (
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                      <Ionicons name="warning" size={24} color="#FFFFFF" />
                    </View>
                  )}
                  {type === 'info' && (
                    <View style={[styles.iconCircle, { backgroundColor: c.primary + '20' }]}>
                      <Ionicons name="information-circle" size={24} color={c.primary} />
                    </View>
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.title, { color: type === 'info' ? c.text : '#FFFFFF' }]}>
                    {payload.title}
                  </Text>
                  {payload.message ? (
                    <Text style={[styles.message, { color: type === 'info' ? c.subtext : 'rgba(255,255,255,0.9)' }]}>
                      {payload.message}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.closeButton}>
                  <Ionicons
                    name="close"
                    size={20}
                    color={type === 'info' ? c.subtext : 'rgba(255,255,255,0.8)'}
                  />
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      )}
    </InAppAlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 70,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.25)',
    elevation: 10,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  message: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
