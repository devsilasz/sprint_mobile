import { ThemeColors } from '../types/theme';

// Design tokens da aplicação. Todas as telas e componentes devem consumir
// cores, espaçamentos, raios e tipografia a partir deste arquivo para manter
// a identidade visual consistente (paleta inspirada no azul Ford).

export const lightColors: ThemeColors = {
  background: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F8',
  primary: '#003478',
  onPrimary: '#FFFFFF',
  secondary: '#F59E0B',
  text: '#0F172A',
  textSecondary: '#5B6475',
  border: '#DDE3EC',
  error: '#C62828',
  errorMuted: '#FDECEC',
  success: '#2E7D32',
};

export const darkColors: ThemeColors = {
  background: '#0B1220',
  surface: '#151E2E',
  surfaceMuted: '#1D2940',
  // Azul mais claro no modo escuro para manter contraste de textos e ícones
  // sobre fundos escuros (o #003478 fica ilegível sobre #151E2E).
  primary: '#3D7BE0',
  onPrimary: '#FFFFFF',
  secondary: '#F59E0B',
  text: '#F1F5F9',
  textSecondary: '#A3AEC2',
  border: '#27344D',
  error: '#EF5350',
  errorMuted: '#3A1C1F',
  success: '#66BB6A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const Typography = {
  display: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  title: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  subtitle: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
};

export const Layout = {
  screenPadding: Spacing.lg,
  controlHeight: 52,
  iconSize: 22,
} as const;
