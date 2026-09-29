import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { HistoryItem } from '../../types/vehicle';
import { getHistory, describeHistoryItem } from '../../services/history';
import { ListItemCard } from '../../components/ui/ListItemCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { CustomButton } from '../../components/ui/CustomButton';
import { Layout, Spacing } from '../../constants/theme';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHistory(user?.email)
        .then(setHistory)
        .catch(error => console.error('Erro ao carregar histórico', error));
    }, [user?.email])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={history}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="Nenhum histórico encontrado"
            description="Suas buscas, fichas técnicas e comparações aparecerão aqui."
          >
            <CustomButton title="Fazer uma busca" onPress={() => router.push('/search')} />
          </EmptyState>
        }
        renderItem={({ item }) => {
          const { icon, title, subtitle, href } = describeHistoryItem(item);
          return (
            <ListItemCard
              icon={icon}
              title={title}
              subtitle={subtitle}
              onPress={() => router.push(href)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: Layout.screenPadding,
    gap: Spacing.md,
  },
});
