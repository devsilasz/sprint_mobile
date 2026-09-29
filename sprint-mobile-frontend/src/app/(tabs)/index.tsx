import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { HistoryItem } from '../../types/vehicle';
import { getHistory, describeHistoryItem } from '../../services/history';
import { Card } from '../../components/ui/Card';
import { ListItemCard } from '../../components/ui/ListItemCard';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Layout, Radius, Spacing, Typography } from '../../constants/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const [recentSearches, setRecentSearches] = useState<HistoryItem[]>([]);
  const [totalSearches, setTotalSearches] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getHistory(user?.email)
        .then(history => {
          setTotalSearches(history.length);
          setRecentSearches(history.slice(0, 2));
        })
        .catch(error => console.error('Erro ao carregar histórico na Home', error));
    }, [user?.email])
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.greeting, { color: theme.colors.onPrimary }]}>
          Olá, {user?.name || 'Usuário'}!
        </Text>
        <Text style={[styles.heroSubtitle, { color: theme.colors.onPrimary }]}>
          Bem-vindo ao sistema de Inteligência Competitiva.
        </Text>
        <View style={styles.statsContainer}>
          <Ionicons name="stats-chart" size={18} color={theme.colors.onPrimary} />
          <Text style={[styles.statsText, { color: theme.colors.onPrimary }]}>
            {totalSearches === 1 ? '1 item no seu histórico' : `${totalSearches} itens no seu histórico`}
          </Text>
        </View>
      </View>

      <SectionTitle>Acesso Rápido</SectionTitle>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search" size={Layout.iconSize} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Nova Busca</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => router.push('/history')}
        >
          <Ionicons name="time" size={Layout.iconSize} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Histórico</Text>
        </TouchableOpacity>
      </View>

      <SectionTitle>Veículo em Destaque</SectionTitle>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push({
          pathname: '/result/[id]',
          params: { id: 'Ford-Ranger', brand: 'Ford', model: 'Ranger', version: 'Raptor' }
        })}
      >
        <Card style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.highlightTitle, { color: theme.colors.primary }]}>Ford Ranger Raptor</Text>
              <Text style={[styles.highlightSubtitle, { color: theme.colors.textSecondary }]}>Alta Performance</Text>
            </View>
            <Ionicons name="star" size={24} color={theme.colors.secondary} />
          </View>
          <Text style={[styles.highlightDesc, { color: theme.colors.text }]}>
            A picape mais rápida e poderosa já vendida no Brasil. Conheça as especificações e veja como ela domina a categoria.
          </Text>
          <Text style={[styles.highlightLink, { color: theme.colors.primary }]}>Ver ficha técnica →</Text>
        </Card>
      </TouchableOpacity>

      {recentSearches.length > 0 && (
        <>
          <SectionTitle>Buscas Recentes</SectionTitle>
          <View style={styles.recentList}>
            {recentSearches.map((item, index) => {
              const { icon, title, subtitle, href } = describeHistoryItem(item);
              return (
                <ListItemCard
                  key={index}
                  icon={icon}
                  title={title}
                  subtitle={subtitle}
                  onPress={() => router.push(href)}
                />
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Layout.screenPadding,
    paddingBottom: Spacing.xxl,
  },
  hero: {
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.display,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.body,
    opacity: 0.9,
    marginBottom: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: Spacing.sm,
  },
  statsText: {
    ...Typography.label,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  actionText: {
    ...Typography.label,
  },
  highlightCard: {
    marginBottom: Spacing.xl,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  highlightTitle: {
    ...Typography.title,
  },
  highlightSubtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  highlightDesc: {
    ...Typography.body,
  },
  highlightLink: {
    ...Typography.label,
    marginTop: Spacing.md,
  },
  recentList: {
    gap: Spacing.md,
  },
});
