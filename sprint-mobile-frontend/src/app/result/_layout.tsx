import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../hooks/useTheme';
import { useHeaderOptions } from '../../hooks/useHeaderOptions';

export default function ResultLayout() {
  const { theme } = useTheme();
  const headerOptions = useHeaderOptions();

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{
        ...headerOptions,
        headerBackTitle: 'Voltar',
        contentStyle: { backgroundColor: theme.colors.background }
      }}>
        <Stack.Screen name="list" options={{ title: 'Resultados da Busca' }} />
        <Stack.Screen name="[id]" options={{ title: 'Ficha Técnica' }} />
        <Stack.Screen name="compare" options={{ title: 'Comparativo' }} />
      </Stack>
    </>
  );
}
