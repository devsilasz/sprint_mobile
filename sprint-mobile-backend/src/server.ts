import 'reflect-metadata';
import os from 'os';
import express, { Request, Response } from 'express';
import { AppDataSource } from './config/database';
import { seedVehicles } from './config/seed';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import vehiclesRoutes from './routes/vehicles.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send({ message: 'API Sprint Mobile Backend is running!' });
});

// ATENÇÃO: Porta 3000 configurada de forma fixa (hardcoded) para fins acadêmicos.
const PORT = 3000;

// Lista os IPs da máquina na rede local, para configurar EXPO_PUBLIC_API_URL no app.
const getLanAddresses = () =>
  Object.values(os.networkInterfaces())
    .flat()
    .filter((iface): iface is os.NetworkInterfaceInfo => !!iface && iface.family === 'IPv4' && !iface.internal)
    .map(iface => iface.address);

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');
    await seedVehicles();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      getLanAddresses().forEach(address => {
        console.log(`Acessível na rede local em: http://${address}:${PORT}`);
      });
    });
  })
  .catch((error) => console.log('Database connection failed', error));
