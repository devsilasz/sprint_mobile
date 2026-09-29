import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Vehicle } from '../entities/Vehicle';
import { SearchLog } from '../entities/SearchLog';

// ATENÇÃO: Configuração simplificada com SQLite (arquivo local) para fins acadêmicos.
// Isso elimina a necessidade de instalar e configurar o PostgreSQL no ambiente do professor.
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true, 
  logging: false,
  entities: [User, Vehicle, SearchLog],
});
