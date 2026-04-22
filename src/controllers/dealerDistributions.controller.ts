import { NextFunction, Request, Response } from "express";
import loggerService from "../utils/logger.service";
import { responseMessages } from "../utils/response-message.service";
import { sendBadRequestResponse, sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from "../utils/response.service";
import { sequelize } from "../server";
import branchDistributionsService from "../services/branchDistributions.service";
import userService from "../services/user.service";
import { ProductType, UserRole } from "../types/enums";
import dealerDistributionsService from "../services/dealerDistributions.service";
import { DealerDistributionsPayload, DealerParams } from "../types/dealerDistributions.interfaces";

/**
 * Get all dealer distributions
 * @route GET /api/dealer-distributions
 */
export const getDealerDistributions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params: DealerParams = {
            branch_id:
                typeof req.query.branch_id === "string"
                    ? req.query.branch_id
                    : undefined,

            product_type:
                typeof req.query.product_type === "string"
                    ? (req.query.product_type as ProductType)
                    : undefined,
        };

        const dealerDistributions = await dealerDistributionsService.getDealerDistributions(params);
        if (dealerDistributions.length === 0) {
            return sendNotFoundResponse(res, responseMessages.dealerDistributions.notFoundMultiple)
        }
        return sendSuccessResponse(res, responseMessages.dealerDistributions.retrieved, dealerDistributions)
    } catch (error) {
        loggerService.error(`Error retrieving dealer distributions: ${error}`)
        sendServerErrorResponse(res, responseMessages.dealerDistributions.failedToRetrieve, error)
        next(error)
    }
}


/**
 * Create dealer distributions
 * @route POST /api/dealer-distributions
 */
export const createDealerDistributions = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract all fields from request body
        let { product_type, branch_id, dealer_distributions } = req.body

        let currentUser = res.locals.auth.user;

        // Check current user is branch_admin and assigned to provided branch or not
        if (currentUser.role === UserRole.BRANCH_ADMIN && currentUser.branch_id !== branch_id) {
            await transaction.rollback()
            return sendBadRequestResponse(res, "branch admin is not associated with this branch.")
        }

        // Prevent duplicate dealer_id
        const dealerIds = dealer_distributions.map((b: any) => b.dealer_id);
        const uniqueDealerIds = new Set(dealerIds);
        if (uniqueDealerIds.size !== dealerIds.length) {
            await transaction.rollback()
            return sendBadRequestResponse(res, "Duplicate dealer_id is not allowed in distributions.")
        }

        // Check dealer exist or not
        for (const distribution of dealer_distributions) {
            const dealer = await userService.getUserById(distribution.dealer_id)
            if (!dealer) {
                await transaction.rollback()
                return sendNotFoundResponse(res, "Dealer not found.")
            }
            if (dealer.dataValues.role !== UserRole.DEALER) {
                await transaction.rollback()
                return sendBadRequestResponse(res, "Provided User is not authorized as dealer.")
            }
            if (dealer.dataValues.branch_id !== branch_id) {
                await transaction.rollback();
                return sendBadRequestResponse(res, "Provided dealer are not associated with this branch.")
            }
        }

        // Check branch distribution exist
        const branchDistribution = await branchDistributionsService.BranchDistributionExist({ branch_id, product_type })
        if (!branchDistribution) {
            await transaction.rollback()
            return sendNotFoundResponse(res, "Branch distribution not found.")
        }

        // Get sellable quantity 
        const branch_sellable_quantity_kg = branchDistribution.sellable_quantity_kg;
        if (!branch_sellable_quantity_kg) {
            await transaction.rollback()
            return sendNotFoundResponse(res, responseMessages.branchDistributions.notFoundSingle)
        }

        // Calculate total allocated quantity exceed or not
        const total_quantity_kg = dealer_distributions.reduce((sum: number, dealer: any) => {
            return sum + dealer.allocated_quantity_kg;
        }, 0)

        if (total_quantity_kg > branch_sellable_quantity_kg) {
            await transaction.rollback()
            return sendBadRequestResponse(res, "Total dealer allocated quantity exceeds the branch sellable quantity limit.")
        }

        // Build dealer distributions data object
        const newDealerDistribution: DealerDistributionsPayload = {
            branch_id,
            branch_distribution_id: branchDistribution.id,
            dealer_distributions,
            product_type
        }

        // Create dealer distributions data
        const dealerDistributions = await dealerDistributionsService.createDealerDistributions(newDealerDistribution, transaction);

        await transaction.commit();

        return sendSuccessResponse(res, responseMessages.dealerDistributions.created, dealerDistributions)
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error creating dealer distritbutions: ${error}`);
        sendServerErrorResponse(res, responseMessages.dealerDistributions.failedToCreate, error);
        next(error);
    }
}