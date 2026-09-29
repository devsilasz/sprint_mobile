import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { CustomButton } from '../../components/ui/CustomButton';
import { Card } from '../../components/ui/Card';
import { clearHistory } from '../../services/history';
import { getApiUrl } from '../../services/api';
import { ServerSettingsModal } from '../../components/ui/ServerSettingsModal';
import { Layout, Spacing, Typography } from '../../constants/theme';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [apiUrl, setApiUrl] = useState(getApiUrl());

  useEffect(() => {
    const loadProfileImage = async () => {
      const key = `@app_profile_img_${user?.email || 'default'}`;
      const img = await AsyncStorage.getItem(key);
      if (img) setProfileImage(img);
    };
    loadProfileImage();
  }, [user?.email]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão Recusada', 'Você precisa permitir o acesso à galeria para mudar a foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      const key = `@app_profile_img_${user?.email || 'default'}`;
      await AsyncStorage.setItem(key, uri);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico de buscas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory(user?.email);
              Alert.alert('Sucesso', 'Histórico limpo com sucesso.');
            } catch (error) {
              console.error('Erro ao limpar histórico:', error);
              Alert.alert('Erro', 'Não foi possível limpar o histórico.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Sair do Sistema', 'Deseja realmente encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage} accessibilityLabel="Alterar foto de perfil">
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.profileInitial, { color: theme.colors.onPrimary }]}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={[styles.editIconBadge, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.background }]}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.profileName, { color: theme.colors.text }]}>{user?.name || 'Usuário'}</Text>
        <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>{user?.email || ''}</Text>
      </View>

      <Card style={styles.section}>
        <View style={styles.row}>
          <View style={styles.rowLabel}>
            <Ionicons name="moon-outline" size={Layout.iconSize} color={theme.colors.primary} />
            <Text style={[styles.label, { color: theme.colors.text }]}>Modo Escuro</Text>
          </View>
          <Switch
            value={theme.type === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
          <View style={styles.rowLabel}>
            <Ionicons name="trash-outline" size={Layout.iconSize} color={theme.colors.primary} />
            <Text style={[styles.label, { color: theme.colors.text }]}>Limpar Histórico</Text>
          </View>
          <CustomButton
            title="Limpar"
            variant="outline"
            onPress={handleClearHistory}
            style={styles.smallButton}
          />
        </View>
        <TouchableOpacity
          style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}
          onPress={() => setServerModalVisible(true)}
        >
          <View style={[styles.rowLabel, { flex: 1 }]}>
            <Ionicons name="server-outline" size={Layout.iconSize} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Servidor da API</Text>
              <Text style={[styles.rowHint, { color: theme.colors.textSecondary }]} numberOfLines={1}>{apiUrl}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </Card>

      <ServerSettingsModal
        visible={serverModalVisible}
        onClose={(saved) => {
          setServerModalVisible(false);
          if (saved) setApiUrl(saved);
        }}
      />

      <CustomButton
        title="Sair do Sistema"
        variant="danger"
        onPress={handleLogout}
      />

      <Text style={[styles.footer, { color: theme.colors.textSecondary }]}>
        Inteligência Competitiva · versão {Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  profileName: {
    ...Typography.title,
    marginTop: Spacing.md,
  },
  profileEmail: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  section: {
    padding: 0,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  label: {
    ...Typography.body,
    fontWeight: '500',
  },
  rowHint: {
    ...Typography.caption,
    marginTop: 2,
  },
  smallButton: {
    height: 40,
    paddingHorizontal: Spacing.lg,
  },
  footer: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
