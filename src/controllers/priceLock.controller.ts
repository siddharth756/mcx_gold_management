import { NextFunction, Request, Response } from "express";
import loggerService from "../utils/logger.service";
import { responseMessages } from "../utils/response-message.service";
import { sendBadRequestResponse, sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from "../utils/response.service";
import { sequelize } from "../server";
import priceLockService from "../services/priceLock.service";
import systemSettingsService from "../services/systemSettings.service";
import redisClient from "../config/redis";

/**
 * Get all price lock
 * @route GET /api/price-lock
 */
export const getPriceLock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page = 1, limit = 10 } = req.query
        page = Number(page);
        limit = Number(limit);

        // Validate the query parameters
        if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
            return sendBadRequestResponse(res, responseMessages.priceLocks.invalidQueryParams);
        }

        const { priceLocks, totalRecords } = await priceLockService.getPriceLock({ page, limit });
        if (priceLocks.length === 0) {
            return sendNotFoundResponse(res, responseMessages.priceLocks.notFoundMultiple)
        }

        const totalPages = Math.ceil(totalRecords / limit);

        return sendSuccessResponse(res, responseMessages.priceLocks.retrieved, {
            priceLocks,
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
        loggerService.error(`Error retrieving price locks: ${error}`)
        sendServerErrorResponse(res, responseMessages.priceLocks.failedToRetrieve, error)
        next(error)
    }
}


/**
 * Create price lock
 * @route POST /api/price-lock
 */
export const createPriceLock = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        // Extract all fields from request body
        let { script_id, product_type } = req.body
        let dealer = res.locals.auth.user;

        // Fetch live prices
        const cachedLivePrices = await redisClient.get("livePrices")

        // If live prices are not available, return error
        if (!cachedLivePrices) {
            await transaction.rollback();
            return sendServerErrorResponse(res, "Live prices are not available.");
        }

        const livePrices = JSON.parse(cachedLivePrices);
        if (!livePrices || livePrices.length === 0) {
            await transaction.rollback();
            return sendServerErrorResponse(res, "No live prices found.");
        }

        let scripts;

        // If script_id passed - only that script
        if (script_id) {
            scripts = livePrices.filter((s: any) => s.script_id === script_id && s.product_type === product_type)

            if (!scripts.length) {
                await transaction.rollback()
                return sendNotFoundResponse(res, "Script not found.")
            }
        }
        // Else - all scripts of that product_type
        else {
            scripts = livePrices.filter((s: any) => s.product_type === product_type)

            if (!scripts.length) {
                await transaction.rollback()
                return sendNotFoundResponse(res, "No scripts found for product type.")
            }
        }

        // Fetch price_lock_duration from system settings
        const systemSetting = await systemSettingsService.getSystemSettingsByProductType(product_type)

        if (!systemSetting || !systemSetting.price_lock_duration) {
            await transaction.rollback();
            return sendBadRequestResponse(res, "Price lock duration not configured in system settings");
        }

        const expiryTime = new Date(
            Date.now() + systemSetting.price_lock_duration * 1000
        );

        const tax_amount = Number(systemSetting.tax_amount);

        // Lock current price 
        const priceLocksToCreate = {
            dealer_id: dealer.id,
            scripts,
            lock_duration: expiryTime,
            tax_amount
        }

        // Create dealer distributions data
        const priceLock = await priceLockService.createPriceLock(priceLocksToCreate, transaction);

        await transaction.commit();

        return sendSuccessResponse(res, responseMessages.priceLocks.created, priceLock)
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error creating price lock: ${error}`);
        sendServerErrorResponse(res, responseMessages.priceLocks.failedToCreate, error);
        next(error);
    }
}