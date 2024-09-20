import {Router} from 'express';
import { signup ,login } from '../controllers/auth';
import { PrismaClient } from '@prisma/client';

const authRoutes:Router = Router();

authRoutes.post('/signup',signup);
authRoutes.post('/login',login)



export default authRoutes;