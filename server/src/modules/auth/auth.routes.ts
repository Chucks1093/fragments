import { Router } from 'express';
import { httpLogin, httpRegisterUserWithPassword } from './auth.controllers';

const authRouter = Router();

authRouter.post('/login', httpLogin);
authRouter.post('/register', httpRegisterUserWithPassword);

export default authRouter;
