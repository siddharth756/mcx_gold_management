import { NextFunction, Request, Response } from "express";
import loggerService from "../utils/logger.service";
import { responseMessages } from "../utils/response-message.service";
import { sendBadRequestResponse, sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from "../utils/response.service";
import { sequelize } from "../server";
import { BranchDistributions, DealerDistributions } from "../models";
import { OrderType, ProductType } from "../types/enums";
import orderService from "../services/order.service";
import priceLockService from "../services/priceLock.service";
import dealerDistributionsService from "../services/dealerDistributions.service";
import branchDistributionsService from "../services/branchDistributions.service";

/**
 * Get all order
 * @route GET /api/order
 */
export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page = 1, limit = 10, dealer_id, branch_id, customer_id, product_type, order_type, start_date, end_date } = req.query
        page = Number(page);
        limit = Number(limit);

        const { orders, totalRecords } = await orderService.getOrder({
            page,
            limit,
            dealer_id: dealer_id as string,
            branch_id: branch_id as string,
            customer_id: customer_id as string,
            product_type: product_type as ProductType,
            order_type: order_type as OrderType,
            start_date: start_date as string,
            end_date: end_date as string
        });
        if (orders.length === 0) {
            return sendNotFoundResponse(res, responseMessages.order.notFoundMultiple)
        }

        const totalPages = Math.ceil(totalRecords / limit);

        return sendSuccessResponse(res, responseMessages.order.retrieved, {
            orders,
            pagination: {
                page,
                limit,
                totalRecords,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        })
    } catch (error) {
        loggerService.error(`Error retrieving orders: ${error}`)
        sendServerErrorResponse(res, responseMessages.order.failedToRetrieve, error)
        next(error)
    }
}


/**
 * Create order
 * @route POST /api/order
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract all fields from request body
        let { name, email, mobile, address, price_lock_id, product_type, order_type, quantity_kg } = req.body
        let dealer = res.locals.auth.user;

        // Create customer if not found
        const customer = await orderService.findOrCreateCustomer(
            {
                email,
                name,
                mobile,
                address,
                dealer_id: dealer.id
            }
        );

        // Check price_lock exist
        const priceLockExist = await priceLockService.getPriceLockById(price_lock_id)
        if (!priceLockExist) {
            return sendNotFoundResponse(res, "Price lock not found.")
        }

        // Dealer distributions
        const dealerDistribution = await dealerDistributionsService.getDealerDistributionsByDealerIdAndProductType({
            dealer_id: dealer.id,
            product_type,
        },
            transaction,
        )

        if (!dealerDistribution) {
            await transaction.rollback();
            return sendNotFoundResponse(res, "Dealer distribution not found.")
        }

        // Branch distribution
        const branchDistribution = await branchDistributionsService.getBranchDistributionsById(
            dealerDistribution.branch_distribution_id!,
            transaction
        );

        if (!branchDistribution) {
            await transaction.rollback();
            return sendNotFoundResponse(res, "Branch distribution not found.");
        }

        const today = new Date().toISOString().slice(0, 10);

        // Check daily distribution available or not
        const dailyDistribution =
            branchDistribution.daily_distributions;

        if (!dailyDistribution) {
            await transaction.rollback();
            return sendNotFoundResponse(res, "Daily distribution not exist.");
        }
        if (dailyDistribution.distribution_date !== today) {
            await transaction.rollback();
            return sendNotFoundResponse(res, "Daily distribution not exist for current date.");
        }

        // Current values
        const dealerRemaining = parseFloat(dealerDistribution.remaining_quantity_kg);
        const dealerSellable = parseFloat(dealerDistribution.sellable_quantity_kg);

        const branchRemaining = parseFloat(branchDistribution.remaining_quantity_kg);
        const branchSellable = parseFloat(branchDistribution.sellable_quantity_kg);


        // Determine change
        const change = order_type === OrderType.SELL ? -quantity_kg : quantity_kg;

        const newDealerRemaining = dealerRemaining + change;
        const newBranchRemaining = branchRemaining + change;

        // Dealer distribution remaining quantity validation
        if (newDealerRemaining < 0)
            return sendBadRequestResponse(res, "Insufficient dealer remaining quantity.");

        if (dealerRemaining > dealerSellable)
            return sendBadRequestResponse(res, "Dealer remaining cannot exceed sellable quantity.");

        // Branch distribution remaining quantity validation
        if (newBranchRemaining < 0)
            return sendBadRequestResponse(res, "Insufficient branch remaining quantity.");

        if (newBranchRemaining > branchSellable)
            return sendBadRequestResponse(res, "Branch remaining cannot exceed sellable quantity.");

        // Update dealer and branch remaining quantity
        await DealerDistributions.update(
            { remaining_quantity_kg: newDealerRemaining },
            { where: { id: dealerDistribution.id, dealer_id: dealer.id, product_type }, transaction }
        );
        await BranchDistributions.update(
            { remaining_quantity_kg: newBranchRemaining },
            { where: { id: branchDistribution.id }, transaction }
        );

        // Order object
        const orderToCreate = {
            dealer_id: dealer.id,
            branch_id: dealer.branch_id,
            customer_id: customer.id,
            price_lock_id: priceLockExist.id,
            product_type,
            order_type,
            quantity_kg
        }

        // Create dealer distributions data
        const newOrder = await orderService.createOrder(orderToCreate, transaction);

        await transaction.commit();

        return sendSuccessResponse(res, responseMessages.order.created, newOrder)
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error creating order: ${error}`);
        sendServerErrorResponse(res, responseMessages.order.failedToCreate, error);
        next(error);
    }
}