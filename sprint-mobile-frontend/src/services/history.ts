import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href } from 'expo-router';
import { HistoryItem } from '../types/vehicle';

const MAX_HISTORY_ITEMS = 10;

const getHistoryKey = (email?: string) => `@app_history_${email || 'default'}`;

const isSameVehicle = (
  a: { brand?: string; model?: string; version?: string },
  b: { brand?: string; model?: string; version?: string },
) => a.brand === b.brand && a.model === b.model && a.version === b.version;

const isSameEntry = (a: HistoryItem, b: HistoryItem) => {
  const typeA = a.type || 'search';
  const typeB = b.type || 'search';
  if (typeA !== typeB) return false;

  if (typeA === 'search') {
    return isSameVehicle(a, b) && a.equipments === b.equipments;
  }
  if (typeA === 'vehicle') {
    return isSameVehicle(a, b);
  }

  const a1 = { brand: a.v1Brand, model: a.v1Model, version: a.v1Version };
  const a2 = { brand: a.v2Brand, model: a.v2Model, version: a.v2Version };
  const b1 = { brand: b.v1Brand, model: b.v1Model, version: b.v1Version };
  const b2 = { brand: b.v2Brand, model: b.v2Model, version: b.v2Version };
  return (isSameVehicle(a1, b1) && isSameVehicle(a2, b2)) || (isSameVehicle(a1, b2) && isSameVehicle(a2, b1));
};

export const getHistory = async (email?: string): Promise<HistoryItem[]> => {
  const stored = await AsyncStorage.getItem(getHistoryKey(email));
  return stored ? JSON.parse(stored) : [];
};

export const addToHistory = async (email: string | undefined, entry: HistoryItem) => {
  try {
    const history = await getHistory(email);
    const filtered = history.filter(item => !isSameEntry(item, entry));
    filtered.unshift(entry);
    await AsyncStorage.setItem(getHistoryKey(email), JSON.stringify(filtered.slice(0, MAX_HISTORY_ITEMS)));
  } catch (error) {
    console.error('Erro ao salvar histórico', error);
  }
};

export const clearHistory = async (email?: string) => {
  await AsyncStorage.removeItem(getHistoryKey(email));
};

export type HistoryIcon = 'search-outline' | 'car-outline' | 'swap-horizontal-outline';

export interface HistoryDisplay {
  icon: HistoryIcon;
  title: string;
  subtitle: string;
  href: Href;
}

// Converte um item do histórico em textos de exibição e na rota correspondente,
// usado tanto na Home quanto na tela de Histórico.
export const describeHistoryItem = (item: HistoryItem): HistoryDisplay => {
  const itemType = item.type || 'search';

  if (itemType === 'vehicle') {
    return {
      icon: 'car-outline',
      title: `Ficha: ${item.brand} ${item.model}`,
      subtitle: item.version || 'Sem versão',
      href: {
        pathname: '/result/[id]',
        params: {
          id: item.id || `${item.brand}-${item.model}`,
          brand: item.brand || '',
          model: item.model || '',
          version: item.version || '',
        },
      },
    };
  }

  if (itemType === 'comparison') {
    return {
      icon: 'swap-horizontal-outline',
      title: 'Comparação',
      subtitle: `${item.v1Brand} ${item.v1Model} vs ${item.v2Brand} ${item.v2Model}`,
      href: {
        pathname: '/result/compare',
        params: {
          v1Brand: item.v1Brand || '',
          v1Model: item.v1Model || '',
          v1Version: item.v1Version || '',
          v2Brand: item.v2Brand || '',
          v2Model: item.v2Model || '',
          v2Version: item.v2Version || '',
        },
      },
    };
  }

  const titleParts = [item.brand, item.model].filter(Boolean);
  const subParts = [];
  if (item.version) subParts.push(`Versão: ${item.version}`);
  if (item.equipments) subParts.push(`Extras: ${item.equipments}`);

  return {
    icon: 'search-outline',
    title: titleParts.length > 0 ? `Busca: ${titleParts.join(' ')}` : 'Busca Geral',
    subtitle: subParts.length > 0 ? subParts.join(' | ') : 'Todos os veículos',
    href: {
      pathname: '/result/list',
      params: {
        brand: item.brand || '',
        model: item.model || '',
        version: item.version || '',
        equipments: item.equipments || '',
      },
    },
  };
};
