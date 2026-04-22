import { NextFunction, Request, Response } from "express";
import loggerService from "../utils/logger.service";
import { responseMessages } from "../utils/response-message.service";
import { sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from "../utils/response.service";
import reportService from "../services/report.service";

/**
 * Get all report
 * @route GET /api/report
 */
export const getReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { page = 1, limit = 10, branch_id, start_date, end_date } = req.query

        page = Number(page);
        limit = Number(limit);

        const currentUser = res.locals.auth.user;

        const report = await reportService.getReport({
            user: currentUser,
            page,
            limit,
            branch_id: branch_id as string,
            start_date: start_date as string,
            end_date: end_date as string
        });

        if (!report) {
            return sendNotFoundResponse(res, responseMessages.report.notFoundMultiple);
        }

        return sendSuccessResponse(res, responseMessages.report.retrieved, report);

    } catch (error) {
        loggerService.error(`Error retrieving report: ${error}`);
        sendServerErrorResponse(res, responseMessages.report.failedToRetrieve, error);
        next(error);
    }
};