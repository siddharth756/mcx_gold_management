import { Router } from "express";
import { deleteUser, getUserById, getUsers, updateUser } from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { UserRole } from "../types/enums";
import { validateSchema } from "../middlewares/schema-validator.middleware";
import { userQuerySchema, userSchema } from "../validations/user.validations";

const userRouter = Router()

userRouter.route("/")
.get(authenticateToken, authorizeRoles(UserRole.ADMIN), validateSchema(userQuerySchema, 'query'), getUsers)

userRouter.route("/:id")
.get(authenticateToken, authorizeRoles(UserRole.ADMIN), getUserById)
.put(authenticateToken, authorizeRoles(UserRole.ADMIN), validateSchema(userSchema, 'body'), updateUser)
.delete(authenticateToken, authorizeRoles(UserRole.ADMIN), deleteUser)

export default userRouter