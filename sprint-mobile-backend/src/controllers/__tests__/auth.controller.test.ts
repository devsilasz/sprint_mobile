import { registerUser, loginUser } from '../auth.controller';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller Tests', () => {
  let mockRepository: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const mockRequest = (body: unknown) => ({ body } as unknown as Request);
  const mockResponse = () => {
    const res = {} as unknown as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      const res = mockResponse();

      mockRepository.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockRepository.create.mockReturnValue({ id: 'uuid-1', name: 'John Doe', email: 'john@example.com' });
      mockRepository.save.mockResolvedValue({});

      await registerUser(req, res);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário cadastrado com sucesso!' });
    });

    it('should return 400 if validation fails', async () => {
      const req = mockRequest({
        name: '',
        email: 'invalid-email',
        password: '123',
      });
      const res = mockResponse();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro de validação' }));
    });

    it('should return 409 if email is already in use', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      const res = mockResponse();

      mockRepository.findOneBy.mockResolvedValue({ id: 'existing-id' } as User);

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'E-mail já está em uso' });
    });
  });

  describe('loginUser', () => {
    it('should login an existing user successfully and return JWT', async () => {
      const req = mockRequest({
        email: 'john@example.com',
        password: 'password123',
      });
      const res = mockResponse();

      const existingUser = {
        id: 'uuid-123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
      };

      mockRepository.findOneBy.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mocked-token');

      await loginUser(req, res);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith({ id: 'uuid-123', email: 'john@example.com' }, expect.any(String), { expiresIn: '1d' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        access_token: 'mocked-token',
        user: {
          id: 'uuid-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      });
    });

    it('should return 401 if user is not found', async () => {
      const req = mockRequest({
        email: 'nonexistent@example.com',
        password: 'password123',
      });
      const res = mockResponse();

      mockRepository.findOneBy.mockResolvedValue(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Credenciais inválidas.' });
    });

    it('should return 401 if password check fails', async () => {
      const req = mockRequest({
        email: 'john@example.com',
        password: 'wrongpassword',
      });
      const res = mockResponse();

      mockRepository.findOneBy.mockResolvedValue({
        id: 'uuid-123',
        email: 'john@example.com',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Credenciais inválidas.' });
    });
  });
});
