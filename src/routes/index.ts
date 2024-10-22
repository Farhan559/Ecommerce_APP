import { Router } from "express";
import authRoutes from "./auth";


const rootRouter: Router = Router();
//Auth routes
rootRouter.use('/auth',authRoutes); 


export default rootRouter;