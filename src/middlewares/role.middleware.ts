import { Request, Response, NextFunction } from "express";
import { sendUnauthorizedResponse } from "../utils/response.service";
import { responseMessages } from "../utils/response-message.service";


export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.auth?.user;
        if (!user) {
            return sendUnauthorizedResponse(res, responseMessages.tokenInvalid)
        }
        if (!allowedRoles.includes(user.role)) {
            return sendUnauthorizedResponse(res, responseMessages.forbidden)
        }
        next();
    }
}