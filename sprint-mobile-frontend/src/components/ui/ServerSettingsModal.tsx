import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { DEFAULT_API_URL, getApiUrl, saveApiUrl, testApiUrl } from '../../services/api';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { CustomInput } from './CustomInput';
import { CustomButton } from './CustomButton';

interface ServerSettingsModalProps {
  visible: boolean;
  onClose: (savedUrl?: string) => void;
}

type Status = 'idle' | 'testing' | 'ok' | 'fail';

// Permite apontar o app para qualquer backend sem gerar um novo APK
// (ex.: IP da máquina na rede Wi-Fi ou 10.0.2.2 no emulador Android).
export function ServerSettingsModal({ visible, onClose }: ServerSettingsModalProps) {
  const { theme } = useTheme();
  const [url, setUrl] = useState(getApiUrl());
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (visible) {
      setUrl(getApiUrl());
      setStatus('idle');
    }
  }, [visible]);

  const handleTest = async () => {
    setStatus('testing');
    setStatus((await testApiUrl(url)) ? 'ok' : 'fail');
  };

  const handleSave = async () => {
    onClose(await saveApiUrl(url));
  };

  const statusInfo: Record<Exclude<Status, 'idle'>, { icon: keyof typeof Ionicons.glyphMap; color: string; text: string }> = {
    testing: { icon: 'sync-outline', color: theme.colors.textSecondary, text: 'Testando conexão...' },
    ok: { icon: 'checkmark-circle', color: theme.colors.success, text: 'Servidor encontrado!' },
    fail: { icon: 'close-circle', color: theme.colors.error, text: 'Sem resposta. Verifique o endereço e se o backend está rodando.' },
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onClose()}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => onClose()} />
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.titleRow}>
            <Ionicons name="server-outline" size={22} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>Servidor da API</Text>
          </View>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Informe o endereço exibido no terminal do backend. No emulador Android use http://10.0.2.2:3000.
          </Text>

          <CustomInput
            label="Endereço"
            value={url}
            onChangeText={(text) => { setUrl(text); setStatus('idle'); }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="http://192.168.0.10:3000"
          />

          {status !== 'idle' && (
            <View style={styles.status}>
              <Ionicons name={statusInfo[status].icon} size={18} color={statusInfo[status].color} />
              <Text style={[styles.statusText, { color: statusInfo[status].color }]}>{statusInfo[status].text}</Text>
            </View>
          )}

          <View style={styles.actions}>
            <CustomButton title="Testar" variant="outline" onPress={handleTest} loading={status === 'testing'} style={styles.action} />
            <CustomButton title="Salvar" onPress={handleSave} style={styles.action} />
          </View>
          <Pressable onPress={() => { setUrl(DEFAULT_API_URL); setStatus('idle'); }} style={styles.reset}>
            <Text style={[styles.resetText, { color: theme.colors.primary }]}>Restaurar padrão ({DEFAULT_API_URL})</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.title,
  },
  description: {
    ...Typography.caption,
    marginBottom: Spacing.lg,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusText: {
    ...Typography.caption,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  action: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  reset: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  resetText: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
