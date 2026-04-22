import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "../types/enums";
import { validateSchema } from "../middlewares/schema-validator.middleware";     
import { dealerDistributionQuerySchema, dealerDistributionSchema } from "../validations/dealerDistributions.validations";
import { createDealerDistributions, getDealerDistributions } from "../controllers/dealerDistributions.controller";

const dealerDistributionsRouter = Router();

dealerDistributionsRouter.get("/", authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.BRANCH_ADMIN), validateSchema(dealerDistributionQuerySchema, 'query'), getDealerDistributions)

dealerDistributionsRouter.post("/", authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.BRANCH_ADMIN), validateSchema(dealerDistributionSchema, 'body'), createDealerDistributions)

export default dealerDistributionsRouter;