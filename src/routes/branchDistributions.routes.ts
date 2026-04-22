import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "../types/enums";
import { validateSchema } from "../middlewares/schema-validator.middleware";
import { createBranchDistributions, getBranchDistributions } from "../controllers/branchDistributions.controller";
import { branchDistributionSchema } from "../validations/branchDistributions.validations";


const branchDistributionsRouter = Router();

branchDistributionsRouter.get("/", authenticateToken, authorizeRoles(UserRole.ADMIN), getBranchDistributions)

branchDistributionsRouter.post("/", authenticateToken, authorizeRoles(UserRole.ADMIN), validateSchema(branchDistributionSchema, 'body'), createBranchDistributions)

export default branchDistributionsRouter;