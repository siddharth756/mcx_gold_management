import { NextFunction, Request, Response } from 'express'
import { sequelize } from '../server'
import branchService from '../services/branch.service'
import { BranchPayload } from '../types/branch.interfaces'
import loggerService from '../utils/logger.service'
import { responseMessages } from '../utils/response-message.service'
import { sendBadRequestResponse, sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from "../utils/response.service";

/**
 * Get all branches
 * @route GET /api/branch
 */
export const getBranches = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const branches = await branchService.getBranches();
        if (branches.length === 0) {
            return sendNotFoundResponse(res, responseMessages.branch.notFoundMultiple)
        }
        return sendSuccessResponse(res, responseMessages.branch.retrieved, branches)
    } catch (error) {
        loggerService.error(`Error retrieving branches: ${error}`)
        sendServerErrorResponse(res, responseMessages.branch.failedToRetrieve, error)
        next(error)
    }
}

/**
 * Get branch by id
 * @route GET /api/branch/:id
 */
export const getBranchById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const branch_id = req.params.id as string
        const branch = await branchService.getBranchById(branch_id);
        return branch ? sendSuccessResponse(res, responseMessages.branch.retrievedSingle, branch) : sendNotFoundResponse(res, responseMessages.branch.notFoundSingle)
    } catch (error) {
        loggerService.error(`Error getting branch: ${error}`)
        sendServerErrorResponse(res, responseMessages.branch.failedToRetrieve, error)
        next(error)
    }
}

/**
 * Create branch
 * @route POST /api/branch
 */
export const createBranch = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract all fields from request body
        let { name, address } = req.body;
        name = name?.toLowerCase();
        address = address?.toLowerCase();

        /** Check branch with name already exist or not */
        const byName = await branchService.getBranchByName(name);

        if (byName) {
            await transaction.rollback();
            return sendBadRequestResponse(res, responseMessages.branch.branchAlreadyExist);
        }

        // Buiid branch data object
        const branchData: BranchPayload = {
            name,
            address
        };

        // Create branch 
        const newBranch = await branchService.createBranch(branchData, res.locals.auth?.user?.id || null, transaction);

        if (!newBranch) {
            await transaction.rollback();
            return sendServerErrorResponse(res, responseMessages.branch.failedToCreate);
        }

        await transaction.commit();

        return sendSuccessResponse(res, responseMessages.branch.created, newBranch);

    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error creating branch: ${error}`);
        sendServerErrorResponse(res, responseMessages.branch.failedToCreate, error);
        next(error);
    }
}

/**
 * Update branch
 * @Route PUT /api/branch/:id
 */
export const updateBranch = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        const branch_id = req.params.id as string;

        // Extract all fields from request body
        let { name, address } = req.body;

        if (name) { name = name.toLowerCase(); }
        if (address) { address = address.toLowerCase(); }

        // Check if branch exists by ID
        const byId = await branchService.getBranchById(branch_id);
        if (!byId) {
            await transaction.rollback();
            return sendNotFoundResponse(res, responseMessages.branch.notFoundSingle);
        }

        // Check if the name was provided and if it has changed
        if (name && byId.dataValues.name?.toLowerCase() !== name) {
            const byName = await branchService.getBranchByName(name);
            if (byName) {
                await transaction.rollback();
                return sendBadRequestResponse(res, responseMessages.branch.branchAlreadyExist);
            }
        }

        // Prepare the data object for updating
        const branchData: BranchPayload = {};

        if (name) branchData.name = name;
        if (address) branchData.address = address;

        // Only update the branch if there are changes
        if (Object.keys(branchData).length > 0) {
            await branchService.updateBranch(branch_id, branchData, res.locals.auth?.user?.id || null, transaction);
        }

        // Commit transaction
        await transaction.commit();

        // Return the response with updated data (only the fields that were actually updated)
        return sendSuccessResponse(res, responseMessages.branch.updated, branchData);
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error updating branch: ${error}`);
        sendServerErrorResponse(res, responseMessages.branch.failedToUpdate, error);
        next(error);
    }
}

/**
 * Delete branch
 * @route DELETE /api/branch/:id
 */
export const deleteBranch = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        const branch_id = req.params.id as string;

        /** Check branch with id already exist or not */
        const byId = await branchService.getBranchById(branch_id);
        if (!byId) {
            await transaction.rollback();
            return sendNotFoundResponse(res, responseMessages.branch.notFoundSingle);
        }

        // Delete branch data
        const branch = await branchService.deleteBranch(branch_id, res.locals.auth?.user?.id || null, transaction);

        if ('error' in branch) {
            return sendBadRequestResponse(res, branch.error)
        }

        await transaction.commit();

        return sendSuccessResponse(res, responseMessages.branch.deleted);
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error deleting branch: ${error}`);
        sendServerErrorResponse(res, responseMessages.branch.failedToDelete, error);
        next(error);
    }
}