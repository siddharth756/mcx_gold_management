import { UserRole } from "../types/enums";

/** Schema to validate user login. */
export const loginSchema = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
            minLength: 1
        },
        password: { 
            type: 'string',
            minLength: 6
        },
    },
    required: ['email', 'password'],
    additionalProperties: false,
};

/** Schema to validate user registration. Similar to update user schema but with required fields. */
export const registerSchema = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
            minLength: 1
        },
        password: {
            type: 'string',
            minLength: 6
        },
        role: {
            type: 'string',
            enum: Object.values(UserRole)
        },
        name: { 
            type: 'string', 
            minLength: 1 
        },  
        mobile: { 
            type: 'string', 
            minLength: 1 
        }, 
        address: { 
            type: 'string', 
            minLength: 1 
        },
        branch_id: {
            type: 'string',
            minLength: 1
        }
    },
    required: ['email', 'password', 'role'],
    additionalProperties: false,
};

/** Schema to validate forgot password. */
export const forgotPasswordSchema = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
        }
    },
    required: ['email'],
    additionalProperties: false,
};