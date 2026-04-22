import { UserRole } from "../types/enums"

export const userSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 1
        },
        address: {
            type: 'string',
            minLength: 1
        },
        email: {
            type: 'string',
            format: 'email'
        },
        password: {
            type: 'string',
            minLength: 6
        },
        mobile: {
            type: 'string',
            minLength: 10,
            pattern: '^[0-9]{10}$'
        }
    },
    required: ['name', 'email', 'mobile'],
    additionalProperties: false
}

export const userQuerySchema = {
    type: "object",
    properties: {
        page: {
            type: 'string',
            pattern: '^[0-9]+$'
        },
        limit: {
            type: 'string',
            pattern: '^[0-9]+$'
        },
        role: {
            type: 'string',
            enum: Object.values(UserRole)
        },
        search: {
            type: 'string',
            minLength: 1
        },
        sortBy: {
            type: 'string',
            enum: ['created_at', 'name', 'email']
        },
        sortOrder: {
            type: 'string',
            enum: ['ASC', 'DESC']
        }
    },
    additionalProperties: false
}