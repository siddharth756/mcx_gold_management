import { Router } from 'express'
import { getBranches, getBranchById, createBranch, updateBranch, deleteBranch } from "../controllers/branch.controller"
import { validateSchema } from '../middlewares/schema-validator.middleware'
import { branchSchema } from '../validations/branch.validations'
import { authenticateToken } from '../middlewares/auth.middleware'
import { authorizeRoles } from '../middlewares/role.middleware'
import { UserRole } from '../types/enums'

const branchRouter = Router()

branchRouter.route("/")
    .get(authenticateToken, authorizeRoles(UserRole.ADMIN), getBranches)
    .post(authenticateToken, authorizeRoles(UserRole.ADMIN), validateSchema(branchSchema, 'body'), createBranch)

branchRouter.route("/:id")
    .get(authenticateToken, authorizeRoles(UserRole.ADMIN), getBranchById)
    .put(authenticateToken, authorizeRoles(UserRole.ADMIN), validateSchema(branchSchema, 'body'), updateBranch)
    .delete(authenticateToken, authorizeRoles(UserRole.ADMIN), deleteBranch)

export default branchRouter