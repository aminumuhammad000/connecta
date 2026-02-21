import { useColorScheme } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const palette = {
  primary: '#FD6730',
  secondary: '#FF8F6B',
  accent: '#7C3AED', // Violet accent for premium feel
  backgroundLight: '#FFFFFF',
  backgroundDark: '#121212',
  cardLight: '#FFFFFF',
  cardDark: '#1E1E1E',
  textLight: '#111827',
  textDark: '#E5E7EB',
  subtextLight: '#6B7280',
  subtextDark: '#9CA3AF',
  borderLight: '#E5E7EB',
  borderDark: '#374151',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const gradients = {
  primary: ['#FD6730', '#FF8F6B'] as const,
  dark: ['#121212', '#1E1E1E'] as const,
  light: ['#FFFFFF', '#F7F8FC'] as const,
  glass: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)'] as const,
  glassDark: ['rgba(30,30,30,0.8)', 'rgba(30,30,30,0.4)'] as const,
};

export function useThemeColors() {
  try {
    const { isDark } = useTheme();
    return getThemeColors(isDark);
  } catch {
    const scheme = useColorScheme();
    return getThemeColors(scheme === 'dark');
  }
}

function getThemeColors(isDark: boolean) {
  return {
    isDark,
    background: isDark ? palette.backgroundDark : palette.backgroundLight,
    card: isDark ? palette.cardDark : palette.cardLight,
    text: isDark ? palette.textDark : palette.textLight,
    subtext: isDark ? palette.subtextDark : palette.subtextLight,
    border: isDark ? palette.borderDark : palette.borderLight,
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    error: palette.error,
    success: palette.success,
    gradients: isDark ? { ...gradients, background: gradients.dark } : { ...gradients, background: gradients.light },
    shadows: {
      small: {
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: 3,
        elevation: 2,
      },
      medium: {
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.4 : 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: isDark ? '#000' : palette.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.5 : 0.15,
        shadowRadius: 20,
        elevation: 10,
      },
    }
  };
}
