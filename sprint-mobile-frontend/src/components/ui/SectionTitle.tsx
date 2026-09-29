import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, Typography } from '../../constants/theme';

export function SectionTitle({ style, ...rest }: TextProps) {
  const { theme } = useTheme();
  return <Text style={[styles.title, { color: theme.colors.text }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: {
    ...Typography.subtitle,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
});
