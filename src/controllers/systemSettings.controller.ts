import { Request, Response, NextFunction } from "express";
import loggerService from "../utils/logger.service";
import { sequelize } from "../server";
import { sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from "../utils/response.service";
import { responseMessages } from "../utils/response-message.service";
import systemSettingsService from "../services/systemSettings.service";
import { SystemSettingsPayload } from "../types/systemSettings.interfaces";

/**
 * Get all system settings
 * @route GET /api/system-settings
 */
export const getSystemSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const systemSettings = await systemSettingsService.getSystemSettings();
        if (systemSettings.length === 0) {
            return sendNotFoundResponse(res, responseMessages.systemSettings.notFoundMultiple)
        }
        return sendSuccessResponse(res, responseMessages.systemSettings.retrieved, systemSettings)
    } catch (error) {
        loggerService.error(`Error retrieving system settings: ${error}`)
        sendServerErrorResponse(res, responseMessages.systemSettings.failedToRetrieve, error)
        next(error)
    }
}

/**
 * Update system settings
 * @Route PUT /api/system-settings/:id
 */
export const updateSystemSettings = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        const systemSettingsId = req.params.id as string;

        // Extract all fields from request body
        let { daily_distribution_limit, price_lock_duration, tax_amount, scripts } = req.body;

        /** Check system settings already exist or not  */
        const byId = await systemSettingsService.getSystemSettingsById(systemSettingsId);
        if (!byId) {
            await transaction.rollback();
            return sendNotFoundResponse(res, responseMessages.systemSettings.notFoundSingle)
        }

        // Build system settings data object
        const updateData: SystemSettingsPayload = {
            daily_distribution_limit,
            price_lock_duration,
            tax_amount,
            scripts
        };

        // Update system settings data
        await systemSettingsService.updateSystemSettings(systemSettingsId, updateData, res.locals.auth?.user?.id || null, transaction);

        await transaction.commit(); 

        const updatedData = await systemSettingsService.getSystemSettingsById(systemSettingsId)

        return sendSuccessResponse(res, responseMessages.systemSettings.updated, updatedData)
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error updating system settings: ${error}`);
        sendServerErrorResponse(res, responseMessages.systemSettings.failedToUpdate, error);
        next(error);
    }
}