import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Layout, Radius, Spacing, Typography } from '../../constants/theme';

interface ListItemCardProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  trailing?: 'chevron' | 'checkbox' | 'none';
  onPress?: () => void;
  style?: ViewStyle;
}

// Item de lista padrão do app (histórico, buscas recentes e resultados).
export function ListItemCard({
  title,
  subtitle,
  icon,
  selected = false,
  trailing = 'chevron',
  onPress,
  style,
}: ListItemCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
        },
        style,
      ]}
    >
      {icon && (
        <View style={[styles.iconWrapper, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Ionicons name={icon} size={Layout.iconSize} color={theme.colors.primary} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing === 'chevron' && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
      {trailing === 'checkbox' && (
        <Ionicons
          name={selected ? 'checkbox' : 'square-outline'}
          size={24}
          color={selected ? theme.colors.primary : theme.colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.subtitle,
  },
  subtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
});
