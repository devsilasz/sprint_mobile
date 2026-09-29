import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { CustomInput } from '../../components/ui/CustomInput';
import { CustomButton } from '../../components/ui/CustomButton';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { addToHistory } from '../../services/history';
import { Radius, Spacing, Typography } from '../../constants/theme';

const PREDEFINED_EQUIPMENTS = [
  'SYNC 4',
  'Câmera 360',
  'Painel Digital',
  'Piloto Automático Adaptativo',
  'Frenagem autônoma',
  'Android Auto',
  'CarPlay',
  'Tração 4x4',
  'Motor V8',
  'Fox Live Valve',
  'Amortecedores KYB',
  'Uconnect 5'
];

export default function SearchScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [version, setVersion] = useState('');
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [customEquipment, setCustomEquipment] = useState('');

  const toggleEquipment = (term: string) => {
    setSelectedEquipments(prev =>
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
  };

  const clearForm = () => {
    setBrand('');
    setModel('');
    setVersion('');
    setSelectedEquipments([]);
    setCustomEquipment('');
  };

  const hasFilters = !!(brand || model || version || customEquipment || selectedEquipments.length);

  const handleSearch = () => {
    const trimmedBrand = brand.trim();
    const trimmedModel = model.trim();
    const trimmedVersion = version.trim();

    const allEquips = [...selectedEquipments];
    if (customEquipment.trim()) {
      allEquips.push(customEquipment.trim());
    }
    const equipmentsValue = allEquips.join(', ');

    if (trimmedBrand || trimmedModel || trimmedVersion) {
      addToHistory(user?.email, {
        type: 'search',
        brand: trimmedBrand,
        model: trimmedModel,
        version: trimmedVersion,
        equipments: equipmentsValue,
      });
    }

    router.push({
      pathname: '/result/list',
      params: { brand: trimmedBrand, model: trimmedModel, version: trimmedVersion, equipments: equipmentsValue }
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.intro, { color: theme.colors.textSecondary }]}>
          Preencha um ou mais campos. Deixe tudo em branco para listar todos os veículos da base.
        </Text>

        <CustomInput
          label="Marca"
          placeholder="Ex: Ford"
          value={brand}
          onChangeText={setBrand}
        />
        <CustomInput
          label="Modelo"
          placeholder="Ex: Ranger"
          value={model}
          onChangeText={setModel}
        />
        <CustomInput
          label="Versão"
          placeholder="Ex: Raptor 3.0 V6"
          value={version}
          onChangeText={setVersion}
        />

        <SectionTitle>Equipamentos e Tecnologia (Opcional)</SectionTitle>
        <View style={styles.chipsContainer}>
          {PREDEFINED_EQUIPMENTS.map(item => {
            const isSelected = selectedEquipments.includes(item);
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                onPress={() => toggleEquipment(item)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  }
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color={theme.colors.onPrimary} style={styles.chipIcon} />
                )}
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? theme.colors.onPrimary : theme.colors.textSecondary,
                      fontWeight: isSelected ? '600' : '400',
                    }
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <CustomInput
          label="Outro Equipamento"
          placeholder="Ex: Teto Solar, Rodas 20"
          value={customEquipment}
          onChangeText={setCustomEquipment}
        />

        <CustomButton
          title="Buscar Especificações"
          onPress={handleSearch}
          style={styles.button}
        />
        {hasFilters && (
          <CustomButton
            title="Limpar Filtros"
            variant="outline"
            onPress={clearForm}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl + Spacing.lg,
  },
  intro: {
    ...Typography.caption,
    marginBottom: Spacing.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: Spacing.xs,
  },
  chipText: {
    fontSize: 14,
  },
  button: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
});
