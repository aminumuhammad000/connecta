import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';

type AlertType = 'info' | 'success' | 'error';

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
          <View pointerEvents="box-none" style={{ paddingTop: insets.top + 12 }}>
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                  shadowColor: '#000',
                  transform: [{ translateY }],
                  marginHorizontal: 12,
                },
              ]}
            >
              <Pressable onPress={hide} style={{ flex: 1 }}>
                <Text style={[styles.title, { color: type === 'info' ? c.text : '#fff' }]}>{payload.title}</Text>
                {payload.message ? (
                  <Text style={[styles.message, { color: type === 'info' ? c.subtext : '#fff' }]}>{payload.message}</Text>
                ) : null}
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
});
