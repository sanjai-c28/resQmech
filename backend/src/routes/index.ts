import { Router } from 'express';
import mechanicRoutes from './mechanicRoutes';
import requestRoutes from './requestRoutes';

const apiRouter = Router();

apiRouter.use('/mechanics', mechanicRoutes);
apiRouter.use('/requests', requestRoutes);

export default apiRouter;
