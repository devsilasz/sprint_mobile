import { matchesAllEquipments, matchesTerm, normalize, parseEquipmentTerms } from '../equipmentMatcher';
import { SpecificationCategory } from '../../types';

const f150: SpecificationCategory[] = [
  {
    categoryName: 'Motorização e Desempenho',
    items: [
      { label: 'Motor', value: '5.0L V8 Coyote' },
      { label: 'Tração', value: '4x4 com seleção eletrônica' },
    ],
  },
  {
    categoryName: 'Tecnologia e Segurança',
    items: [
      { label: 'Painel de Instrumentos', value: 'Digital de 12 polegadas' },
      { label: 'Câmeras', value: 'Câmera 360 graus com assistência de reboque' },
      { label: 'Segurança', value: '8 airbags, Frenagem autônoma' },
    ],
  },
];

describe('equipmentMatcher', () => {
  it('normalizes accents and case', () => {
    expect(normalize('Câmera TRAÇÃO')).toBe('camera tracao');
  });

  it('matches terms split between label and value of the same item', () => {
    expect(matchesTerm(f150, 'Motor V8')).toBe(true);
    expect(matchesTerm(f150, 'Tração 4x4')).toBe(true);
    expect(matchesTerm(f150, 'Painel Digital')).toBe(true);
  });

  it('matches regardless of accents', () => {
    expect(matchesTerm(f150, 'camera 360')).toBe(true);
    expect(matchesTerm(f150, 'Frenagem autonoma')).toBe(true);
  });

  it('does not combine words from different items', () => {
    // "V8" está no item Motor e "Digital" no Painel: não é o mesmo equipamento.
    expect(matchesTerm(f150, 'V8 Digital')).toBe(false);
  });

  it('rejects equipment the vehicle does not have', () => {
    expect(matchesTerm(f150, 'Fox Live Valve')).toBe(false);
  });

  it('requires every selected equipment to match', () => {
    const terms = parseEquipmentTerms('Motor V8, Câmera 360');
    expect(terms).toEqual(['Motor V8', 'Câmera 360']);
    expect(matchesAllEquipments(f150, terms)).toBe(true);
    expect(matchesAllEquipments(f150, [...terms, 'SYNC 4'])).toBe(false);
  });

  it('accepts any vehicle when no equipment is selected', () => {
    expect(matchesAllEquipments(f150, parseEquipmentTerms('  '))).toBe(true);
    expect(matchesAllEquipments(undefined, ['Motor V8'])).toBe(false);
  });
});
