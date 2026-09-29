import { useTheme } from './useTheme';

// Opções de cabeçalho compartilhadas entre as pilhas de navegação,
// garantindo o mesmo visual (barra azul da marca) em todas as telas.
export const useHeaderOptions = () => {
  const { theme } = useTheme();

  return {
    headerStyle: { backgroundColor: theme.colors.primary },
    headerTintColor: theme.colors.onPrimary,
    headerTitleStyle: { fontWeight: '700' as const },
    headerShadowVisible: false,
  };
};
