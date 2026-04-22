import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "../types/enums";
import { validateSchema } from "../middlewares/schema-validator.middleware";
import { orderQuerySchema, orderSchema } from "../validations/order.validation";
import { createOrder, getOrder } from "../controllers/order.controller";

const orderRouter = Router();

orderRouter.get("/", authenticateToken, authorizeRoles(UserRole.DEALER, UserRole.ADMIN), validateSchema(orderQuerySchema, 'query'), getOrder)

orderRouter.post("/", authenticateToken, authorizeRoles(UserRole.DEALER), validateSchema(orderSchema, 'body'), createOrder)

export default orderRouter;