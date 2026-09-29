export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  errorMuted: string;
  success: string;
}

export interface Theme {
  type: ThemeType;
  colors: ThemeColors;
}
