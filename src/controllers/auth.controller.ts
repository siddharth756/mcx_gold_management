import { NextFunction, Request, Response } from "express";
import { sequelize } from "../server";
import userService from "../services/user.service";
import { UserPayload } from "../types/user.interfaces";
import { encrypt, hashAsync } from "../utils/crypto.service";
import loggerService from "../utils/logger.service";
import { sendForgotPasswordMail } from "../utils/mail.service";
import { responseMessages } from "../utils/response-message.service";
import { sendBadRequestResponse, sendServerErrorResponse, sendSuccessResponse, sendUnauthorizedResponse } from "../utils/response.service";
import { UserRole } from "../types/enums";
import branchService from "../services/branch.service";

/** 
 * Generate a random password with specified length
 * Includes uppercase, lowercase alphabets and numbers
 */
const generatePassword = (length: number = 8): string => {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    const allChars = upperCase + lowerCase + numbers;

    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    return password;
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await userService.loginWithEmailAndPassword(email, password);
        if (!user) {
            return sendServerErrorResponse(res, responseMessages.authentication.loginFailed, new Error('Unknown login method'));
        }

        if ('error' in user) {
            return sendUnauthorizedResponse(res, user.error);
        }

        const token = encrypt(
            {
                user_id: user.id,
                email: user.email,
            },
            '1d' // 1 day
        );

        return sendSuccessResponse(res, responseMessages.authentication.loginSuccess, {
            token,
            user,
        });
    } catch (error) {
        loggerService.error(`Login error: ${error}`);
        sendServerErrorResponse(res, responseMessages.authentication.loginFailed, error);
        next(error);
    }
};

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();
    try {
        const user = res.locals.auth?.user;
        if (!user) {
            return sendUnauthorizedResponse(res, responseMessages.unauthorized)
        }

        // Extract all fields from request body (same as update user)
        const {
            email,
            password,
            role,
            mobile,
            name,
            address,
            branch_id: reqbranch_id
        } = req.body;

        /** Check username, email and mobile already exist or not */
        const byEmail = await userService.getUserByEmail(email);

        if (byEmail) {
            await transaction.rollback();
            return sendBadRequestResponse(res, responseMessages.user.emailAlreadyRegistered);
        }

        // Branch Id
        let branch_id: string | null = null;

        if (role === UserRole.BRANCH_ADMIN) {
            if (user.role !== UserRole.ADMIN) {
                return sendBadRequestResponse(res, 'Only ADMIN can create BRANCH_ADMIN')
            }
            if (!reqbranch_id) return sendBadRequestResponse(res, 'branch_id is required for BRANCH_ADMIN')

            branch_id = reqbranch_id

            // Check if the branch already has a Branch Admin before creating a new one
            const existBranchAdmin = await userService.getUserByBranchAndRole(reqbranch_id, role)
            if (existBranchAdmin) {
                return sendBadRequestResponse(res, 'This branch already has a Branch Admin.')
            }
        }

        if (role === UserRole.DEALER) {
            if (user.role === UserRole.BRANCH_ADMIN) {
                branch_id = user.branch_id
            } else if (user.role === UserRole.ADMIN) {
                if (!reqbranch_id) { return sendBadRequestResponse(res, 'branch_id is required for BRANCH_ADMIN') }
                branch_id = reqbranch_id
            }
        }


        // Validate branch_id
        if (branch_id) {
            const branch = await branchService.getBranchById(branch_id as string);
            if (!branch) {
                await transaction.rollback();
                return sendBadRequestResponse(res, responseMessages.branch.notFoundSingle)
            }
        }

        // Build user data object
        const userData: UserPayload = {
            email,
            password,
            role,
            ...(branch_id && { branch_id }),
            ...(name && { name }),
            ...(mobile && { mobile }),
            ...(address && { address })
        };

        // Only hash and include password if provided
        if (password) {
            userData.password = await hashAsync(password);
        }

        // Create user
        const newUser = await userService.createUser(userData, user.id, transaction);

        if (!newUser) {
            await transaction.rollback();
            return sendServerErrorResponse(res, responseMessages.user.failedToCreate);
        }

        await transaction.commit();

        // Generate JWT token
        const token = encrypt({
            user_id: newUser.id,
            email: newUser.email,
        }, '1d'); // 1 day

        return sendSuccessResponse(res, responseMessages.authentication.registerSuccess, {
            token,
            user: newUser,
        });
    } catch (error) {
        await transaction.rollback();
        loggerService.error(`Error registering user: ${error}`);
        sendServerErrorResponse(res, responseMessages.authentication.registerFailed, error);
        next(error);
    }
};

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const user = await userService.getUserByEmail(email);
        if (!user) {
            return sendBadRequestResponse(res, responseMessages.user.notFoundSingle);
        }

        // Generate new password
        const newPassword = generatePassword(8);

        // Update user password
        await userService.updateUser(user.dataValues.id, { password: await hashAsync(newPassword) });

        // Send new password to user
        sendForgotPasswordMail({
            name: user.dataValues.name || '',
            email: user.dataValues.email || '',
            password: newPassword,
        });

        return sendSuccessResponse(res, responseMessages.authentication.forgotPasswordSuccess);

    } catch (error) {
        loggerService.error(`Error forgot password: ${error}`);
        sendServerErrorResponse(res, responseMessages.authentication.forgotPasswordFailed, error);
        next(error);
    }
};