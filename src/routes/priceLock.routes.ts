import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "../types/enums";
import { validateSchema } from "../middlewares/schema-validator.middleware";
import { priceLockQuerySchema, priceLockSchema } from "../validations/priceLock.validation";
import { createPriceLock, getPriceLock } from "../controllers/priceLock.controller";


const priceLockRouter = Router();

priceLockRouter.get("/", authenticateToken, authorizeRoles(UserRole.DEALER, UserRole.ADMIN), validateSchema(priceLockQuerySchema, 'query'), getPriceLock)

priceLockRouter.post("/", authenticateToken, authorizeRoles(UserRole.DEALER), validateSchema(priceLockSchema, 'body'), createPriceLock)

export default priceLockRouter;