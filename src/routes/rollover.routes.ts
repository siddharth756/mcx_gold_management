import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "../types/enums";
import { getRollover } from "../controllers/rollover.controller";
import { validateSchema } from "../middlewares/schema-validator.middleware";
import { rolloverQuerySchema } from "../validations/rollover.validations";

const rolloverRouter = Router();

rolloverRouter.get("/", authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.BRANCH_ADMIN), validateSchema(rolloverQuerySchema, 'query'), getRollover)

export default rolloverRouter;