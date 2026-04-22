import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "../types/enums";
import { getInventory } from "../controllers/inventory.controller";

const inventoryRouter = Router();

inventoryRouter.get("/", authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.BRANCH_ADMIN, UserRole.DEALER), getInventory)

export default inventoryRouter;