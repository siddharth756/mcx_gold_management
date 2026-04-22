import { Router } from 'express';
import authRouter from './auth.routes';
import branchRouter from './branch.routes';
import userRouter from './user.routes';
import systemSettingsRouter from './systemSettings.routes';
import branchDistributionsRouter from './branchDistributions.routes';
import dealerDistributionsRouter from './dealerDistributions.routes';
import priceLockRouter from './priceLock.routes';
import orderRouter from './order.routes';
import reportRouter from './report.routes';
import inventoryRouter from './inventory.routes';
import rolloverRouter from './rollover.routes';

const indexRouter = Router();

indexRouter.use('/auth', authRouter);
indexRouter.use('/branch', branchRouter);
indexRouter.use('/users', userRouter);
indexRouter.use('/system-settings', systemSettingsRouter)
indexRouter.use('/branch-distributions', branchDistributionsRouter)
indexRouter.use('/dealer-distributions', dealerDistributionsRouter)
indexRouter.use('/price-lock', priceLockRouter)
indexRouter.use('/order', orderRouter)
indexRouter.use('/report', reportRouter)
indexRouter.use('/inventory', inventoryRouter)
indexRouter.use('/rollover', rolloverRouter)

export default indexRouter;