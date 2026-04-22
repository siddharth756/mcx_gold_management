import { Request, Response, NextFunction } from 'express'
import userService from '../services/user.service'
import { sendBadRequestResponse, sendNotFoundResponse, sendServerErrorResponse, sendSuccessResponse } from '../utils/response.service';
import { responseMessages } from '../utils/response-message.service';
import loggerService from '../utils/logger.service';
import { sequelize } from '../server';
import { UserPayload } from '../types/user.interfaces';
import { hashAsync } from '../utils/crypto.service';
import { UserRole } from '../types/enums';

/**
 * Get all users with optional pagination
 * @route GET /api/users
 * @query {number} page - The page number (default: 1)
 * @query {number} limit - The number of users per page (default: 10)
 * @query {string} role - Filter by role (optional)
 * @query {string} search - Search by name or email (optional)
 * @query {string} sortBy - Field to sort by (optional)
 * @query {string} sortOrder - ASC | DESC (optional)
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {
            page = 1,
            limit = 10,
            role,
            search,
            sortBy = "created_at",
            sortOrder = "DESC"
        } = req.query;

        page = Number(page);
        limit = Number(limit);

        const { users, totalRecords } = await userService.getUsers({
            page,
            limit,
            role: role as UserRole,
            search: search as string,
            sortBy: sortBy as any,
            sortOrder: sortOrder as "ASC" | "DESC"
        });

        const totalPages = Math.ceil(totalRecords / limit);
        return sendSuccessResponse(res, responseMessages.user.retrieved,
            {
                users,
                pagination: {
                    page,
                    limit,
                    totalRecords,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        );
    } catch (error) {
        loggerService.error(`Error retrieving users: ${error}`);
        sendServerErrorResponse(res, responseMessages.user.failedToRetrieve, error);
        next(error);
    }
};



/**
 * Get user by id
 * @route GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.params.id as string
        const user = await userService.getUserById(user_id);
        return user ? sendSuccessResponse(res, responseMessages.user.retrievedSingle, user) : sendNotFoundResponse(res, responseMessages.user.notFoundSingle)
    } catch (error) {
        loggerService.error(`Error getting user: ${error}`)
        sendServerErrorResponse(res, responseMessages.user.failedToRetrieve, error)
        next(error)
    }
}


/**
 * Update user
 * @Route PUT /api/users/:id
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        const user_id = req.params.id as string;

        // Extract all fields from request body
        let { name, address, email, password, mobile } = req.body;

        /** Check user already exist or not */
        const byId = await userService.getUserById(user_id);
        if (!byId) {
            await transaction.rollback();
            return sendNotFoundResponse(res, responseMessages.user.notFoundSingle);
        }
        /** Check if the email has changed and if the new email is already registered */
        if (email && byId.dataValues.email?.toLowerCase() !== email) {
            const byEmail = await userService.getUserByEmail(email);
            if (byEmail) {
                await transaction.rollback();
                return sendBadRequestResponse(res, responseMessages.user.emailAlreadyRegistered);
            }
        }

        // Buiid branch data object
        const userData: UserPayload = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile,
        };

        if (address) userData.address = address.trim()

        if (password) {
            const hashPassword = await hashAsync(password);
            userData.password = hashPassword
        }

        // Update branch data
        await userService.updateUser(user_id, userData, res.locals.auth?.user?.id || null, transaction);

        await transaction.commit();

        return sendSuccessResponse(res, responseMessages.user.updated, { userData })
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error updating user: ${error}`);
        sendServerErrorResponse(res, responseMessages.user.failedToUpdate, error);
        next(error);
    }
}

/**
 * Delete user
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        const user_id = req.params.id as string;

        /** Check user with id already exist or not */
        const byId = await userService.getUserById(user_id);
        if (!byId) {
            await transaction.rollback();
            return sendNotFoundResponse(res, responseMessages.branch.notFoundSingle);
        }

        // Delete user data
        const user = await userService.deleteUser(user_id, res.locals.auth?.user?.id || null, transaction);

        if ('error' in user) {
            return sendBadRequestResponse(res, user.error)
        }

        await transaction.commit();

        return sendSuccessResponse(res, responseMessages.user.deleted);
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error deleting user: ${error}`);
        sendServerErrorResponse(res, responseMessages.user.failedToDelete, error);
        next(error);
    }
}