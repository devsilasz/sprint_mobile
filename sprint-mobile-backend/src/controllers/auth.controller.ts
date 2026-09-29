import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { registerSchema, loginSchema } from '../dtos/auth.dto';


export const registerUser = async (req: Request, res: Response) => {
  try {
    
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Erro de validação', errors: parsed.error.format() });
    }

    const { name, email, password } = parsed.data;
    const userRepository = AppDataSource.getRepository(User);

    
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'E-mail já está em uso' });
    }

    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    
    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await userRepository.save(newUser);
    console.log(`[LOG] Ação: CADASTRO | Usuário registrado: ${email}`);

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro no cadastro', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Erro de validação', errors: parsed.error.format() });
    }

    const { email, password } = parsed.data;
    const userRepository = AppDataSource.getRepository(User);

    
    const user = await userRepository.findOneBy({ email });
    if (!user) {
      console.log(`[LOG] Ação: LOGIN_FALHO | Tentativa com: ${email}`);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`[LOG] Ação: LOGIN_FALHO | Tentativa com: ${email}`);
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    
    // ATENÇÃO: Chave secreta JWT configurada de forma fixa (hardcoded) para fins acadêmicos.
    const secret = 'sprint-mobile-academic-secret-key-12345';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1d' });

    console.log(`[LOG] Ação: LOGIN | Usuário: ${email} entrou no sistema.`);
    return res.status(200).json({
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro no login', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};
