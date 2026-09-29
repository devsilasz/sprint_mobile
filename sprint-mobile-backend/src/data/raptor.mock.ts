import { VehicleResponse } from '../types';
import vehicles from './extended_vehicles_mock.json';

// Ficha oficial da Ford Ranger Raptor (gabarito do desafio). Serve de modelo
// para a estrutura padronizada de categorias e atributos da ficha técnica.
export const raptorMock: VehicleResponse = (vehicles as VehicleResponse[]).find(
  vehicle => vehicle.brand === 'Ford' && vehicle.model === 'Ranger Raptor',
)!;

export const UNAVAILABLE_VALUE = 'vazio / não disponível';

// Veículo que não existe na base: devolve a mesma estrutura padronizada do
// gabarito com todos os valores explicitamente marcados como indisponíveis,
// para que continue comparável lado a lado com qualquer outro veículo.
export const emptyVehicleMock = (brand: string, model: string, version: string): VehicleResponse => {
  return {
    brand,
    model,
    version,
    specifications: raptorMock.specifications.map(category => ({
      categoryName: category.categoryName,
      items: category.items.map(item => ({
        label: item.label,
        value: UNAVAILABLE_VALUE
      }))
    }))
  };
};
