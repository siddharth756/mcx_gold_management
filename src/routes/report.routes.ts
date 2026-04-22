import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "../types/enums";
import { validateSchema } from "../middlewares/schema-validator.middleware";
import { reportQuerySchema } from "../validations/report.validations";
import { getReport } from "../controllers/report.controller";

const reportRouter = Router();

reportRouter.get("/", authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.BRANCH_ADMIN, UserRole.DEALER), validateSchema(reportQuerySchema, 'query'), getReport)

export default reportRouter;