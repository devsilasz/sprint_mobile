import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../hooks/useTheme';
import { VehicleResponse, SpecificationCategory } from '../../types/vehicle';
import { fetchVehicle } from '../../services/api';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorFeedback } from '../../components/ui/ErrorFeedback';
import { Card } from '../../components/ui/Card';
import { displayValue, isUnavailable } from '../../utils/specifications';
import { buildVehicleReport, sharePdf } from '../../utils/pdf';
import { Layout, Radius, Spacing, Typography } from '../../constants/theme';

export default function ResultScreen() {
  const { brand, model, version, equipments } = useLocalSearchParams<{
    id: string; brand: string; model: string; version: string; equipments?: string;
  }>();

  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<VehicleResponse | null>({
    queryKey: ['vehicle', brand, model, version, equipments],
    queryFn: () => fetchVehicle({ brand: brand || '', model: model || '', version: version || '', equipments }),
  });

  if (isLoading) {
    return <LoadingScreen message={`Buscando especificações do ${model}...`} />;
  }

  if (isError || !data) {
    return <ErrorFeedback message="Ocorreu um erro ao carregar as especificações." onRetry={refetch} />;
  }

  const exportToPDF = async () => {
    setIsExporting(true);
    await sharePdf(buildVehicleReport(data, equipments), `Exportar Ficha - ${data.model}`);
    setIsExporting(false);
  };

  const missingCount = data.specifications.reduce(
    (total, cat) => total + cat.items.filter(item => isUnavailable(item.value)).length,
    0,
  );

  const renderCategory = ({ item }: { item: SpecificationCategory }) => (
    <Card style={styles.categoryContainer}>
      <View style={[styles.categoryHeader, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.categoryTitle, { color: theme.colors.onPrimary }]}>{item.categoryName}</Text>
      </View>
      <View style={styles.categoryItems}>
        {item.items.map((spec, index) => {
          const unavailable = isUnavailable(spec.value);
          return (
            <View
              key={index}
              style={[
                styles.itemContainer,
                { borderBottomColor: theme.colors.border },
                index === item.items.length - 1 && styles.lastItem,
              ]}
            >
              <Text style={[styles.itemLabel, { color: theme.colors.textSecondary }]}>{spec.label}</Text>
              <Text style={[
                styles.itemValue,
                { color: unavailable ? theme.colors.error : theme.colors.text },
                unavailable && styles.unavailable,
              ]}>
                {displayValue(spec.value)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{
        title: `${data.brand} ${data.model}`,
        headerRight: () => (
          <TouchableOpacity
            onPress={exportToPDF}
            disabled={isExporting}
            accessibilityLabel="Exportar ficha técnica em PDF"
            hitSlop={12}
          >
            {isExporting ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Ionicons name="share-outline" size={Layout.iconSize} color={theme.colors.onPrimary} />
            )}
          </TouchableOpacity>
        )
      }} />

      <FlatList
        data={data.specifications}
        keyExtractor={(item) => item.categoryName}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.versionTitle, { color: theme.colors.text }]}>{data.version || version}</Text>
            {equipments ? (
              <Text style={[styles.equipments, { color: theme.colors.textSecondary }]}>Extras: {equipments}</Text>
            ) : null}
            {missingCount > 0 && (
              <View style={[styles.missingBadge, { backgroundColor: theme.colors.errorMuted }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
                <Text style={[styles.missingText, { color: theme.colors.error }]}>
                  {missingCount} {missingCount === 1 ? 'item não disponível' : 'itens não disponíveis'}
                </Text>
              </View>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: Spacing.xs,
  },
  versionTitle: {
    ...Typography.title,
  },
  equipments: {
    ...Typography.caption,
  },
  missingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
  },
  missingText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  listContainer: {
    padding: Layout.screenPadding,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  categoryContainer: {
    padding: 0,
    overflow: 'hidden',
  },
  categoryHeader: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  categoryTitle: {
    ...Typography.subtitle,
    fontSize: 16,
  },
  categoryItems: {
    paddingHorizontal: Spacing.lg,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLabel: {
    ...Typography.caption,
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  unavailable: {
    fontStyle: 'italic',
    fontWeight: '400',
  },
});
