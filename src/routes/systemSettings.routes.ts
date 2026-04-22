import { Router } from "express"
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "../types/enums";
import { getSystemSettings, updateSystemSettings } from "../controllers/systemSettings.controller";
import { validateSchema } from "../middlewares/schema-validator.middleware";
import { systemSettingsSchema } from "../validations/systemSettings.validations";


const systemSettingsRouter = Router();

systemSettingsRouter.get("/", authenticateToken, authorizeRoles(UserRole.ADMIN), getSystemSettings)

systemSettingsRouter.put("/:id", authenticateToken, authorizeRoles(UserRole.ADMIN), validateSchema(systemSettingsSchema, 'body'), updateSystemSettings)

export default systemSettingsRouter;