import { SpecificationCategory } from '../types/vehicle';

export const UNAVAILABLE_LABEL = 'vazio / não disponível';

export const isUnavailable = (value?: string) => {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return normalized.includes('vazio') || normalized.includes('não disponível');
};

export const displayValue = (value?: string) => value || UNAVAILABLE_LABEL;

export interface MergedSpecItem {
  label: string;
  v1Value?: string;
  v2Value?: string;
}

export interface MergedSpecCategory {
  categoryName: string;
  items: MergedSpecItem[];
}

// Alinha as especificações de dois veículos por categoria e atributo, para o
// comparador lado a lado. Atributos presentes em apenas um veículo ficam sem
// valor no outro e são exibidos como "vazio / não disponível".
export const mergeSpecifications = (
  v1Specs: SpecificationCategory[],
  v2Specs: SpecificationCategory[],
): MergedSpecCategory[] => {
  const merged = new Map<string, Map<string, MergedSpecItem>>();

  v1Specs.forEach(cat => {
    const items = new Map<string, MergedSpecItem>();
    cat.items.forEach(item => items.set(item.label, { label: item.label, v1Value: item.value }));
    merged.set(cat.categoryName, items);
  });

  v2Specs.forEach(cat => {
    if (!merged.has(cat.categoryName)) {
      merged.set(cat.categoryName, new Map());
    }
    const items = merged.get(cat.categoryName)!;
    cat.items.forEach(item => {
      const existing = items.get(item.label);
      if (existing) {
        existing.v2Value = item.value;
      } else {
        items.set(item.label, { label: item.label, v2Value: item.value });
      }
    });
  });

  return Array.from(merged.entries()).map(([categoryName, items]) => ({
    categoryName,
    items: Array.from(items.values()),
  }));
};
