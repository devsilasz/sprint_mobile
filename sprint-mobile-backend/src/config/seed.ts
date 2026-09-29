import fs from 'fs';
import path from 'path';
import { AppDataSource } from './database';
import { Vehicle } from '../entities/Vehicle';

export const seedVehicles = async () => {
  try {
    const vehicleRepository = AppDataSource.getRepository(Vehicle);
    const count = await vehicleRepository.count();
    
    if (count === 0) {
      console.log('[SEED] A tabela de veículos está vazia. Iniciando semeadura...');
      const mockPath = path.join(__dirname, '../data/extended_vehicles_mock.json');
      
      if (fs.existsSync(mockPath)) {
        const rawData = fs.readFileSync(mockPath, 'utf-8');
        const vehiclesData = JSON.parse(rawData);
        
        for (const data of vehiclesData) {
          const vehicle = vehicleRepository.create({
            brand: data.brand,
            model: data.model,
            version: data.version,
            specifications: data.specifications,
          });
          await vehicleRepository.save(vehicle);
        }
        console.log(`[SEED] Semeadura concluída! ${vehiclesData.length} veículos cadastrados.`);
      } else {
        console.log(`[SEED] Arquivo de mock não encontrado em: ${mockPath}`);
      }
    } else {
      console.log(`[SEED] Banco já semeado (${count} veículos).`);
    }
  } catch (error) {
    console.error('[SEED] Erro ao semear veículos:', error);
  }
};
