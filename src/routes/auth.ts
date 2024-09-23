import { Router } from 'express';
import { signup, login, me } from '../controllers/auth';
import authMiddleware from '../middlewares/auth';
import { errorHandler } from '../errorHandler';

const authRoutes: Router = Router();

authRoutes.post('/signup', errorHandler(signup));
authRoutes.post('/login', errorHandler(login));
authRoutes.get('/me', authMiddleware, errorHandler(me)); 

export default authRoutes;
