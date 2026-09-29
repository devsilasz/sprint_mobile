import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, Typography } from '../../constants/theme';
import { CustomButton } from './CustomButton';

interface ErrorFeedbackProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorFeedback({ message, onRetry }: ErrorFeedbackProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.errorMuted }]}>
        <Ionicons name="cloud-offline-outline" size={40} color={theme.colors.error} />
      </View>
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message}
      </Text>
      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        Verifique sua conexão e se o servidor da API está em execução.
      </Text>
      {onRetry && (
        <CustomButton
          title="Tentar Novamente"
          onPress={onRetry}
          variant="outline"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  message: {
    ...Typography.subtitle,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  hint: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});
