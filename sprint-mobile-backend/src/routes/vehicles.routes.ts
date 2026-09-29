import { Router } from 'express';
import { compareVehicles } from '../controllers/vehicles.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/compare', authMiddleware, compareVehicles);

export default router;
