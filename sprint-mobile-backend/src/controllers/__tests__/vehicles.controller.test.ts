import { compareVehicles } from '../vehicles.controller';
import { AppDataSource } from '../../config/database';
import { Vehicle } from '../../entities/Vehicle';
import { SearchLog } from '../../entities/SearchLog';
import { emptyVehicleMock } from '../../data/raptor.mock';
import { Response } from 'express';
import { AuthenticatedRequest, UserPayload } from '../../middlewares/auth.middleware';

jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('../../data/raptor.mock', () => ({
  emptyVehicleMock: jest.fn(),
}));

describe('Vehicles Controller Tests', () => {
  let mockVehicleRepository: {
    find: jest.Mock;
  };
  let mockSearchLogRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };

  const mockRequest = (body: unknown, user?: Partial<UserPayload>) => ({ body, user } as unknown as AuthenticatedRequest);
  const mockResponse = () => {
    const res = {} as unknown as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVehicleRepository = {
      find: jest.fn(),
    };
    mockSearchLogRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Vehicle) return mockVehicleRepository;
      if (entity === SearchLog) return mockSearchLogRepository;
      return null;
    });
  });

  it('should save a search log and query vehicles successfully', async () => {
    const req = mockRequest({
      brand: 'Ford',
      model: 'Ranger',
      version: 'Raptor',
      equipments: 'GPS',
    }, { email: 'user@example.com' });
    const res = mockResponse();

    const mockVehicles = [
      {
        id: '1',
        brand: 'Ford',
        model: 'Ranger Raptor',
        specifications: [
          {
            categoryName: 'Tecnologia',
            items: [
              { label: 'Sistema', value: 'GPS' }
            ]
          }
        ]
      }
    ];

    mockSearchLogRepository.create.mockReturnValue({ id: 'log-id' });
    mockSearchLogRepository.save.mockResolvedValue({});
    mockVehicleRepository.find.mockResolvedValue(mockVehicles);

    await compareVehicles(req, res);

    // Verify search log was saved
    expect(mockSearchLogRepository.create).toHaveBeenCalledWith({
      userEmail: 'user@example.com',
      action: 'BUSCA_VEICULO',
      filters: { brand: 'Ford', model: 'Ranger', version: 'Raptor', equipments: 'GPS' },
    });
    expect(mockSearchLogRepository.save).toHaveBeenCalled();

    // Verify vehicles were searched
    expect(mockVehicleRepository.find).toHaveBeenCalledWith({
      where: expect.any(Object),
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockVehicles);
  });

  it('should use anonymous email if req.user is undefined', async () => {
    const req = mockRequest({ brand: 'Ford' });
    const res = mockResponse();

    mockSearchLogRepository.create.mockReturnValue({ id: 'log-id' });
    mockVehicleRepository.find.mockResolvedValue([]);

    await compareVehicles(req, res);

    expect(mockSearchLogRepository.create).toHaveBeenCalledWith({
      userEmail: 'Desconhecido',
      action: 'BUSCA_VEICULO',
      filters: { brand: 'Ford', model: undefined, version: undefined, equipments: undefined },
    });
  });

  it('should return empty vehicle mock if no results are found', async () => {
    const req = mockRequest({ brand: 'NonexistentBrand', model: 'SomeModel' }, { email: 'user@example.com' });
    const res = mockResponse();

    mockSearchLogRepository.create.mockReturnValue({ id: 'log-id' });
    mockVehicleRepository.find.mockResolvedValue([]);
    (emptyVehicleMock as jest.Mock).mockReturnValue({
      brand: 'NonexistentBrand',
      model: 'SomeModel',
      specifications: [],
    });

    await compareVehicles(req, res);

    expect(mockVehicleRepository.find).toHaveBeenCalled();
    expect(emptyVehicleMock).toHaveBeenCalledWith('NonexistentBrand', 'SomeModel', 'Versão não informada');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { brand: 'NonexistentBrand', model: 'SomeModel', specifications: [] }
    ]);
  });

  it('should return 500 if an error occurs', async () => {
    const req = mockRequest({ brand: 'Ford' });
    const res = mockResponse();

    mockSearchLogRepository.create.mockImplementation(() => {
      throw new Error('Database connection lost');
    });

    await compareVehicles(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erro interno no servidor' });
  });
});
