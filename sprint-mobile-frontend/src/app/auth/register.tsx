import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomButton } from '../../components/ui/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Spacing, Typography } from '../../constants/theme';
import { api } from '../../services/api';
import { ServerLink } from '../../components/ui/ServerLink';
import { getErrorMessage } from '../../utils/errors';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    let isValid = true;
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name) {
      newErrors.name = 'O nome é obrigatório';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'O e-mail é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Digite um e-mail válido';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'A senha é obrigatória';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.post('/api/auth/register', { name, email, password });
      Alert.alert('Sucesso', 'Conta criada! Faça login para continuar.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: unknown) {
      Alert.alert('Erro no Cadastro', getErrorMessage(error, 'Não foi possível criar a conta.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="car-sport" size={32} color={theme.colors.onPrimary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Cadastro</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Crie sua conta na plataforma corporativa
          </Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="Nome Completo"
            placeholder="Digite seu nome"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors(prev => ({ ...prev, name: undefined }));
            }}
            errorMessage={errors.name}
          />

          <CustomInput
            label="E-mail Corporativo"
            placeholder="Seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: undefined }));
            }}
            errorMessage={errors.email}
          />

          <CustomInput
            label="Senha"
            placeholder="Crie uma senha forte"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: undefined }));
            }}
            errorMessage={errors.password}
          />

          <CustomButton
            title="Criar Conta"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />

          <CustomButton
            title="Já tem conta? Faça Login"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>

        <ServerLink />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.display,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
  },
  form: {
    gap: Spacing.sm,
  },
  registerButton: {
    marginTop: Spacing.sm,
  },
});
