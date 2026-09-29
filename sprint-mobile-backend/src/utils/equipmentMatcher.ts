import { SpecificationCategory } from '../types';

// Normaliza texto para comparação: minúsculas e sem acentos
// ("Câmera" e "camera" passam a ser equivalentes).
export const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const tokenize = (text: string) => normalize(text).split(/[\s,;/]+/).filter(Boolean);

// Um termo de busca (ex.: "Motor V8") corresponde a um item da ficha quando
// todas as suas palavras aparecem no mesmo item, somando rótulo e valor
// (ex.: rótulo "Motor" + valor "5.0L V8 Coyote"). Buscar a frase inteira em
// um único campo fazia termos como "Tração 4x4" nunca encontrarem nada.
export const matchesTerm = (specifications: SpecificationCategory[], term: string) => {
  const words = tokenize(term);
  if (words.length === 0) return true;

  return specifications.some(category => {
    const categoryText = normalize(category.categoryName);
    if (words.every(word => categoryText.includes(word))) return true;

    return (category.items || []).some(item => {
      const itemText = normalize(`${item.label} ${item.value || ''}`);
      return words.every(word => itemText.includes(word));
    });
  });
};

export const parseEquipmentTerms = (equipments?: string) =>
  (equipments || '')
    .split(',')
    .map(term => term.trim())
    .filter(Boolean);

export const matchesAllEquipments = (specifications: SpecificationCategory[] | undefined, terms: string[]) => {
  if (terms.length === 0) return true;
  if (!specifications) return false;
  return terms.every(term => matchesTerm(specifications, term));
};
