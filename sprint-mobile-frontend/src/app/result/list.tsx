import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { VehicleResponse } from '../../types/vehicle';
import { fetchVehicles } from '../../services/api';
import { addToHistory } from '../../services/history';
import { CustomButton } from '../../components/ui/CustomButton';
import { ListItemCard } from '../../components/ui/ListItemCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorFeedback } from '../../components/ui/ErrorFeedback';
import { Layout, Spacing, Typography } from '../../constants/theme';

const MAX_SELECTION = 2;

const isSameVehicle = (a: VehicleResponse, b: VehicleResponse) =>
  a.brand === b.brand && a.model === b.model && a.version === b.version;

export default function ResultListScreen() {
  const params = useLocalSearchParams<{ brand: string; model: string; version: string; equipments?: string }>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [selected, setSelected] = useState<VehicleResponse[]>([]);

  const { data, isLoading, isError, refetch } = useQuery<VehicleResponse[]>({
    queryKey: ['vehicles', params.brand, params.model, params.version, params.equipments],
    queryFn: () => fetchVehicles({
      brand: params.brand || '',
      model: params.model || '',
      version: params.version || '',
      equipments: params.equipments,
    }),
  });

  const toggleSelection = (vehicle: VehicleResponse) => {
    if (selected.some(v => isSameVehicle(v, vehicle))) {
      setSelected(selected.filter(v => !isSameVehicle(v, vehicle)));
    } else if (selected.length < MAX_SELECTION) {
      setSelected([...selected, vehicle]);
    } else {
      // Com dois já selecionados, substitui o mais antigo pelo novo.
      setSelected([selected[1], vehicle]);
    }
  };

  const handleAction = () => {
    if (selected.length === 1) {
      const v = selected[0];
      addToHistory(user?.email, {
        type: 'vehicle',
        id: `${v.brand}-${v.model}`,
        brand: v.brand,
        model: v.model,
        version: v.version || '',
      });

      router.push({
        pathname: '/result/[id]',
        params: { id: `${v.brand}-${v.model}`, brand: v.brand, model: v.model, version: v.version || '' }
      });
    } else if (selected.length === 2) {
      const [v1, v2] = selected;
      const comparison = {
        v1Brand: v1.brand,
        v1Model: v1.model,
        v1Version: v1.version || '',
        v2Brand: v2.brand,
        v2Model: v2.model,
        v2Version: v2.version || ''
      };
      addToHistory(user?.email, { type: 'comparison', ...comparison });

      router.push({ pathname: '/result/compare', params: comparison });
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Buscando veículos..." />;
  }

  if (isError || !data) {
    return <ErrorFeedback message="Erro ao carregar os dados." onRetry={refetch} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={data}
        contentContainerStyle={[styles.list, selected.length > 0 && styles.listWithFooter]}
        keyExtractor={(item, index) => `${item.brand}-${item.model}-${item.version}-${index}`}
        ListHeaderComponent={data.length > 0 ? (
          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            {data.length} {data.length === 1 ? 'veículo encontrado' : 'veículos encontrados'}. Selecione 1 para ver a ficha técnica ou 2 para comparar lado a lado.
          </Text>
        ) : null}
        renderItem={({ item }) => (
          <ListItemCard
            icon="car-sport-outline"
            title={`${item.brand} ${item.model}`}
            subtitle={item.version}
            trailing="checkbox"
            selected={selected.some(v => isSameVehicle(v, item))}
            onPress={() => toggleSelection(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="Nenhum veículo encontrado"
            description="Tente remover alguns equipamentos ou usar termos mais genéricos."
          >
            <CustomButton title="Refazer busca" variant="outline" onPress={() => router.back()} />
          </EmptyState>
        }
      />

      {selected.length > 0 && (
        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <CustomButton
            title={selected.length === 1 ? 'Visualizar Ficha Técnica' : 'Comparar Lado a Lado'}
            onPress={handleAction}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Layout.screenPadding, gap: Spacing.md },
  listWithFooter: { paddingBottom: 110 },
  hint: { ...Typography.caption, marginBottom: Spacing.xs },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, paddingBottom: Spacing.xl, borderTopWidth: 1 }
});
