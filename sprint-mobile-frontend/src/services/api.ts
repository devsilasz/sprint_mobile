import { create } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { VehicleResponse, VehicleSearchParams } from '../types/vehicle';

const API_PORT = 3000;
const API_URL_STORAGE_KEY = '@app_api_url';

// Endereço padrão do backend, em ordem de prioridade:
// 1. EXPO_PUBLIC_API_URL: definida no build (arquivo .env ou eas.json).
// 2. Expo Go / dev client: usa o IP da máquina que está servindo o bundle.
// 3. Web / emulador iOS: localhost.
// O usuário ainda pode sobrescrever esse endereço pelo app (tela de login ou
// Ajustes), o que permite usar o mesmo APK com qualquer servidor.
const getDefaultBaseURL = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return `http://localhost:${API_PORT}`;
  }
  const ip = hostUri.split(':').shift();
  return `http://${ip}:${API_PORT}`;
};

export const normalizeUrl = (url: string) => {
  let normalized = url.trim().replace(/\/+$/, '');
  if (normalized && !/^https?:\/\//i.test(normalized)) {
    normalized = `http://${normalized}`;
  }
  return normalized;
};

export const DEFAULT_API_URL = getDefaultBaseURL();

export const api = create({
  baseURL: DEFAULT_API_URL,
  timeout: 10000,
});

export const getApiUrl = () => api.defaults.baseURL ?? DEFAULT_API_URL;

// Carrega o endereço salvo pelo usuário (chamado na inicialização do app).
export const loadApiUrl = async () => {
  try {
    const stored = await AsyncStorage.getItem(API_URL_STORAGE_KEY);
    if (stored) {
      api.defaults.baseURL = stored;
    }
  } catch (error) {
    console.error('Erro ao carregar endereço da API', error);
  }
};

export const saveApiUrl = async (url: string) => {
  const normalized = normalizeUrl(url);
  api.defaults.baseURL = normalized || DEFAULT_API_URL;
  if (normalized && normalized !== DEFAULT_API_URL) {
    await AsyncStorage.setItem(API_URL_STORAGE_KEY, normalized);
  } else {
    await AsyncStorage.removeItem(API_URL_STORAGE_KEY);
  }
  return api.defaults.baseURL;
};

// Verifica se o backend responde no endereço informado.
export const testApiUrl = async (url: string) => {
  try {
    await api.get('/', { baseURL: normalizeUrl(url), timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@app_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchVehicles = async ({ brand, model, version, equipments }: VehicleSearchParams): Promise<VehicleResponse[]> => {
  const payload = { brand, model, version, ...(equipments ? { equipments } : {}) };
  const response = await api.post<VehicleResponse[]>('/api/vehicles/compare', payload);
  return response.data;
};

export const fetchVehicle = async (params: VehicleSearchParams): Promise<VehicleResponse | null> => {
  const vehicles = await fetchVehicles(params);
  return vehicles[0] ?? null;
};
