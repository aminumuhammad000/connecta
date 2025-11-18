import { useColorScheme } from 'react-native';

export const palette = {
  primary: '#FD6730',
  backgroundLight: '#F7F8FC',
  backgroundDark: '#121212',
  cardLight: '#FFFFFF',
  cardDark: '#1E1E1E',
  textLight: '#111827',
  textDark: '#E5E7EB',
  subtextLight: '#6B7280',
  subtextDark: '#9CA3AF',
  borderLight: '#E5E7EB',
  borderDark: '#374151',
};

export function useThemeColors() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    isDark,
    background: isDark ? palette.backgroundDark : palette.backgroundLight,
    card: isDark ? palette.cardDark : palette.cardLight,
    text: isDark ? palette.textDark : palette.textLight,
    subtext: isDark ? palette.subtextDark : palette.subtextLight,
    border: isDark ? palette.borderDark : palette.borderLight,
    primary: palette.primary,
  };
}
