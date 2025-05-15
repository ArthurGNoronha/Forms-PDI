import { Router } from 'express';

import order from './middlewares/order.js';
import hateoas from './middlewares/hateoas.js';
import handler from './middlewares/handler.js';

import InternalServerError from './routes/helper/500.js';
import NotFound from './routes/helper/404.js';

// Rotas para Frontend
import AdmFrontRouter from './routes/admFrontRouter.js';
import UserFrontRouter from './routes/userFrontRouter.js';

// Rotas API
import AuthRouter from './routes/authRouter.js';
import AnswerRouter from './routes/answerRouter.js';
import ReagenteRouter from './routes/reagenteRouter.js';
import UserAdmRouter from './routes/userAdmRouter.js';

import { verify } from './controllers/authController.js';

const routes = Router();
routes.use(order);
routes.use(hateoas);
routes.use(handler);

// Rotas para Frontend
routes.use('/adm', AdmFrontRouter);
routes.use('/', UserFrontRouter);

// Rotas API
routes.use('/login', AuthRouter);
routes.use('/api/answers', verify, AnswerRouter);
routes.use('/api/users', verify, UserAdmRouter);
routes.use('/api/reagentes', verify, ReagenteRouter);

routes.use(InternalServerError);
routes.use(NotFound);

export default routes;