import { ProductType } from "../types/enums";

export const priceLockSchema = {
    type: 'object',
    properties: {
        script_id: {
            type: 'string',
            minLength: 1
        },
        product_type: {
            type: 'string',
            enum: Object.values(ProductType)
        }
    },
    required: ['product_type'],
    additionalProperties: false,
};

export const priceLockQuerySchema = {
    type: 'object',
    properties: {
        page: {
            type: 'string',
            pattern: '^[0-9]+$'
        },
        limit: {
            type: 'string',
            pattern: '^[0-9]+$'
        }
    },
    additionalProperties: false,
}