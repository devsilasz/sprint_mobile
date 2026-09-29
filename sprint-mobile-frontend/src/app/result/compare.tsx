import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { VehicleResponse } from '../../types/vehicle';
import { fetchVehicle } from '../../services/api';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorFeedback } from '../../components/ui/ErrorFeedback';
import { displayValue, isUnavailable, mergeSpecifications } from '../../utils/specifications';
import { buildComparisonReport, sharePdf } from '../../utils/pdf';
import { Layout, Radius, Spacing, Typography } from '../../constants/theme';

export default function CompareScreen() {
  const params = useLocalSearchParams<{
    v1Brand: string; v1Model: string; v1Version: string;
    v2Brand: string; v2Model: string; v2Version: string;
  }>();

  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<{ v1: VehicleResponse | null; v2: VehicleResponse | null }>({
    queryKey: ['compare', params.v1Brand, params.v1Model, params.v1Version, params.v2Brand, params.v2Model, params.v2Version],
    queryFn: async () => {
      const [v1, v2] = await Promise.all([
        fetchVehicle({ brand: params.v1Brand || '', model: params.v1Model || '', version: params.v1Version || '' }),
        fetchVehicle({ brand: params.v2Brand || '', model: params.v2Model || '', version: params.v2Version || '' }),
      ]);
      return { v1, v2 };
    }
  });

  if (isLoading) {
    return <LoadingScreen message="Preparando comparação..." />;
  }

  if (isError || !data?.v1 || !data?.v2) {
    return <ErrorFeedback message="Erro ao carregar dados de comparação." onRetry={refetch} />;
  }

  const { v1, v2 } = data;
  const merged = mergeSpecifications(v1.specifications, v2.specifications);

  const exportToPDF = async () => {
    setIsExporting(true);
    await sharePdf(buildComparisonReport(v1, v2, merged), 'Exportar Comparação');
    setIsExporting(false);
  };

  const renderValue = (value: string | undefined, columnStyle: object) => {
    const missing = isUnavailable(value);
    return (
      <View style={[
        columnStyle,
        { borderRightColor: theme.colors.border },
        missing && { backgroundColor: theme.colors.errorMuted },
      ]}>
        <Text style={[
          styles.value,
          { color: missing ? theme.colors.error : theme.colors.text },
          missing && styles.unavailable,
        ]}>
          {displayValue(value)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{
        title: 'Comparativo',
        headerRight: () => (
          <TouchableOpacity
            onPress={exportToPDF}
            disabled={isExporting}
            accessibilityLabel="Exportar comparação em PDF"
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

      <View style={[styles.headerRow, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.col1, { borderRightColor: theme.colors.border }]}>
          <Text style={[styles.headerText, { color: theme.colors.textSecondary }]}>Atributo Técnico</Text>
        </View>
        <View style={[styles.col2, { borderRightColor: theme.colors.border }]}>
          <Text style={[styles.headerText, styles.center, { color: theme.colors.primary }]} numberOfLines={2}>{v1.brand} {v1.model}</Text>
          <Text style={[styles.headerVersion, { color: theme.colors.textSecondary }]} numberOfLines={1}>{v1.version}</Text>
        </View>
        <View style={styles.col3}>
          <Text style={[styles.headerText, styles.center, { color: theme.colors.primary }]} numberOfLines={2}>{v2.brand} {v2.model}</Text>
          <Text style={[styles.headerVersion, { color: theme.colors.textSecondary }]} numberOfLines={1}>{v2.version}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {merged.map((cat, idx) => (
          <View key={idx} style={[styles.categoryContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            <View style={[styles.categoryHeader, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.categoryTitle, { color: theme.colors.onPrimary }]}>{cat.categoryName}</Text>
            </View>

            {cat.items.map((item, itemIdx) => (
              <View
                key={itemIdx}
                style={[
                  styles.row,
                  { borderBottomColor: theme.colors.border },
                  itemIdx === cat.items.length - 1 && styles.lastRow,
                ]}
              >
                <View style={[styles.col1, { borderRightColor: theme.colors.border }]}>
                  <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{item.label}</Text>
                </View>
                {renderValue(item.v1Value, styles.col2)}
                {renderValue(item.v2Value, styles.col3)}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { textAlign: 'center' },
  headerRow: { flexDirection: 'row', paddingVertical: Spacing.md, borderBottomWidth: 1, alignItems: 'center' },
  headerText: { ...Typography.label },
  headerVersion: { ...Typography.caption, fontSize: 11, textAlign: 'center', marginTop: 2 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  categoryContainer: { borderWidth: 1, borderRadius: Radius.md, marginBottom: Spacing.lg, overflow: 'hidden' },
  categoryHeader: { paddingVertical: Spacing.sm + 2, alignItems: 'center' },
  categoryTitle: { ...Typography.label },
  row: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'stretch' },
  lastRow: { borderBottomWidth: 0 },
  col1: { flex: 1.2, padding: Spacing.sm + 2, borderRightWidth: StyleSheet.hairlineWidth, justifyContent: 'center' },
  col2: { flex: 1, padding: Spacing.sm + 2, borderRightWidth: StyleSheet.hairlineWidth, justifyContent: 'center', alignItems: 'center' },
  col3: { flex: 1, padding: Spacing.sm + 2, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600' },
  value: { fontSize: 13, textAlign: 'center' },
  unavailable: { fontStyle: 'italic' },
});
