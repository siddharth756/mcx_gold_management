import { Router } from 'express';
import { forgotPassword, login, register } from '../controllers/auth.controller';
import { validateSchema } from '../middlewares/schema-validator.middleware';
import { forgotPasswordSchema, loginSchema, registerSchema } from '../validations/auth.validations';
import { authenticateToken } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { UserRole } from '../types/enums';

const authRouter = Router();

authRouter.post('/register', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.BRANCH_ADMIN), validateSchema(registerSchema, 'body'),  register);
authRouter.post('/login', validateSchema(loginSchema, 'body'), login);
authRouter.post('/forgot-password', validateSchema(forgotPasswordSchema, 'body'), forgotPassword);

export default authRouter;
