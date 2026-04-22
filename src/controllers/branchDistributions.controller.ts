import { Request, Response, NextFunction } from "express";
import loggerService from "../utils/logger.service";
import { sequelize } from "../server";
import { sendBadRequestResponse, sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from "../utils/response.service";
import { responseMessages } from "../utils/response-message.service";
import branchDistributionsService from "../services/branchDistributions.service";
import { BranchDistributionsPayload } from "../types/branchDistributions.interfaces";
import branchService from "../services/branch.service";
import { DailyDistributions } from "../models";
import systemSettingsService from "../services/systemSettings.service";


/**
 * Get all branch distributions
 * @route GET /api/branch-distributions
 */
export const getBranchDistributions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const branchDistributions = await branchDistributionsService.getBranchDistributions();
        if (branchDistributions.length === 0) {
            return sendNotFoundResponse(res, responseMessages.branchDistributions.notFoundMultiple)
        }
        return sendSuccessResponse(res, responseMessages.branchDistributions.retrieved, branchDistributions)
    } catch (error) {
        loggerService.error(`Error retrieving branch distributions: ${error}`)
        sendServerErrorResponse(res, responseMessages.branchDistributions.failedToRetrieve, error)
        next(error)
    }
}

/**
 * Create branch distributions
 * @route POST /api/branch-distributions
 */
export const createBranchDistributions = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract all fields from request body
        let { distribution_date, product_type, branch_distributions } = req.body;

        const distributionDate = distribution_date ? distribution_date : new Date();

        // Check only one distribution per day allowed
        const distributionExist = await DailyDistributions.findOne({ where: { distribution_date: distributionDate, product_type }, transaction })
        if (distributionExist) {
            return sendBadRequestResponse(res, "Only one distribution per day is allowed.")
        }

        // Prevent duplicate branch_id
        const branchIds = branch_distributions.map((b: any) => b.branch_id);
        const uniqueBranchIds = new Set(branchIds);

        if (uniqueBranchIds.size !== branchIds.length) {
            return sendBadRequestResponse(res, "Duplicate branch_id is not allowed in distributions.")
        }

        // Check branch exist or not
        for (const distribution of branch_distributions) {
            const branch = await branchService.getBranchById(distribution.branch_id);
            if (!branch) {
                return sendNotFoundResponse(res, responseMessages.branch.notFoundSingle)
            }
        }

        // Get daily distributions limit by product_type
        const systemSettings = await systemSettingsService.getSystemSettingsByProductType(product_type);

        if (systemSettings?.daily_distribution_limit == null) {
            return sendNotFoundResponse(res, "Daily distribution limit is not configured.")
        }

        // Calculate total allocated quantity
        const total_quantity_kg = branch_distributions.reduce((sum: number, branch: any) => {
            return sum + branch.allocated_quantity_kg;
        }, 0)

        if (total_quantity_kg > systemSettings?.daily_distribution_limit) {
            return sendBadRequestResponse(res, "Total allocated quantity exceeds the daily distribution limit.")
        }

        const branchDistributionsArray = branch_distributions.map((distribution: any) => {
            const branch_variation = distribution.branch_variation;
            const allocated_quantity_kg = distribution.allocated_quantity_kg;

            // Calculate sellable quantity and remaining quantity
            const sellable_quantity_kg = Number((allocated_quantity_kg * (1 + branch_variation / 100)).toFixed(2));

            return {
                branch_id: distribution.branch_id,
                allocated_quantity_kg: allocated_quantity_kg,
                sellable_quantity_kg: sellable_quantity_kg,
                remaining_quantity_kg: allocated_quantity_kg,
                branch_variation: branch_variation
            };
        });

        // Build branch distributions data object
        const newBranchDistributions: BranchDistributionsPayload = {
            product_type,
            total_quantity_kg,
            branch_distributions: branchDistributionsArray
        };

        if (distribution_date) newBranchDistributions.distribution_date = distribution_date

        // Create branch distributions data
        const branchDistributions = await branchDistributionsService.createBranchDistributions(newBranchDistributions, transaction);

        await transaction.commit();

        return sendSuccessResponse(res, responseMessages.branchDistributions.created, branchDistributions)
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error creating branch distritbutions: ${error}`);
        sendServerErrorResponse(res, responseMessages.branchDistributions.failedToCreate, error);
        next(error);
    }
}