import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getApiUrl } from '../../services/api';
import { Spacing, Typography } from '../../constants/theme';
import { ServerSettingsModal } from './ServerSettingsModal';

// Atalho discreto nas telas de autenticação para configurar o servidor da API.
export function ServerLink() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState(getApiUrl());

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.link}
        accessibilityRole="button"
        accessibilityLabel="Configurar servidor da API"
      >
        <Ionicons name="server-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={[styles.text, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          Servidor: {url}
        </Text>
        <Text style={[styles.text, styles.action, { color: theme.colors.primary }]}>Alterar</Text>
      </Pressable>
      <ServerSettingsModal
        visible={visible}
        onClose={(saved) => {
          setVisible(false);
          if (saved) setUrl(saved);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  text: {
    ...Typography.caption,
    flexShrink: 1,
  },
  action: {
    fontWeight: '700',
  },
});
