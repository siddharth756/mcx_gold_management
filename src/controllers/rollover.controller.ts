import { NextFunction, Request, Response } from "express";
import loggerService from "../utils/logger.service";
import { responseMessages } from "../utils/response-message.service";
import { sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from "../utils/response.service";
import rolloverService from "../services/rollover.service";

/**
 * Get rollover
 * @route GET /api/rollover
 */
export const getRollover = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page = 1, limit = 10, start_date, end_date } = req.query

        page = Number(page);
        limit = Number(limit);

        const currentUser = res.locals.auth.user;

        const rollover = await rolloverService.getRollover({
            user: currentUser,
            page,
            limit,
            start_date: start_date as string,
            end_date: end_date as string
        });
        if (!rollover) {
            return sendNotFoundResponse(res, responseMessages.rollover.notFoundMultiple);
        }
        return sendSuccessResponse(res, responseMessages.rollover.retrieved, rollover);

    } catch (error) {
        loggerService.error(`Error retrieving rollover: ${error}`);
        sendServerErrorResponse(res, responseMessages.rollover.failedToRetrieve, error);
        next(error);
    }
};