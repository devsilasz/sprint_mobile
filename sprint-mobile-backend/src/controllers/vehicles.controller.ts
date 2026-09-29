import { Response } from 'express';
import { VehicleSearchParams, VehicleResponse } from '../types';
import { emptyVehicleMock } from '../data/raptor.mock';
import { AppDataSource } from '../config/database';
import { Vehicle } from '../entities/Vehicle';
import { SearchLog } from '../entities/SearchLog';
import { ILike, FindOptionsWhere } from 'typeorm';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { matchesAllEquipments, parseEquipmentTerms } from '../utils/equipmentMatcher';

export const compareVehicles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { brand, model, version, equipments } = req.body as VehicleSearchParams;
    const userEmail = req.user?.email || 'Desconhecido';

    console.log(`[LOG] Ação: BUSCA_VEICULO | Usuário: ${userEmail} | Filtros: ${brand || '*'} ${model || '*'} ${version || '*'}`);

    const searchLogRepository = AppDataSource.getRepository(SearchLog);
    const newLog = searchLogRepository.create({
      userEmail,
      action: 'BUSCA_VEICULO',
      filters: { brand, model, version, equipments }
    });
    await searchLogRepository.save(newLog);

    const vehicleRepository = AppDataSource.getRepository(Vehicle);
    const whereClause: FindOptionsWhere<Vehicle> = {};
    if (brand) {
      whereClause.brand = ILike(`%${brand}%`);
    }
    if (model) {
      whereClause.model = ILike(`%${model}%`);
    }
    if (version) {
      whereClause.version = ILike(`%${version}%`);
    }

    let results: (Vehicle | VehicleResponse)[] = await vehicleRepository.find({
      where: whereClause
    });

    const terms = parseEquipmentTerms(equipments);
    if (terms.length > 0) {
      results = results.filter(vehicle => matchesAllEquipments(vehicle.specifications, terms));
    }

    if (results.length === 0 && (brand || model) && !equipments) {
      results = [emptyVehicleMock(brand || "Desconhecida", model || "Desconhecido", version || "Versão não informada")];
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Erro ao buscar/comparar veículos', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};
