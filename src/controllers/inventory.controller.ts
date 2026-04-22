import { NextFunction, Request, Response } from "express";
import loggerService from "../utils/logger.service";
import { responseMessages } from "../utils/response-message.service";
import { sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from "../utils/response.service";
import inventoryService from "../services/inventory.service";

/**
 * Get invetonry
 * @route GET /api/inventory
 */
export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUser = res.locals.auth.user;

        const inventory = await inventoryService.getInventory(currentUser);
        if (!inventory) {
            return sendNotFoundResponse(res, responseMessages.inventory.notFoundMultiple);
        }
        return sendSuccessResponse(res, responseMessages.inventory.retrieved, inventory);

    } catch (error) {
        loggerService.error(`Error retrieving inventory: ${error}`);
        sendServerErrorResponse(res, responseMessages.inventory.failedToRetrieve, error);
        next(error);
    }
};