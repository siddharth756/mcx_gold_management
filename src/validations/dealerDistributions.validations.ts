import { ProductType } from "../types/enums";

export const dealerDistributionSchema = {
    type: 'object',
    properties: {
        product_type: {
            type: 'string',
            enum: Object.values(ProductType)
        },
        branch_id: {
            type: 'string',
            minLength: 1
        },
        dealer_distributions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    dealer_id: {
                        type: 'string',
                        minLength: 1,
                    },
                    allocated_quantity_kg: {
                        type: 'number',
                        minimum: 0,
                    },
                    dealer_variation: {
                        type: 'number',
                        minimum: 0,
                    },
                },
                required: ['dealer_id', 'allocated_quantity_kg', 'dealer_variation'],
                additionalProperties: false,
            },
        },
    },
    required: ['product_type', 'branch_id', 'dealer_distributions'],
    additionalProperties: false,
};

export const dealerDistributionQuerySchema = {
    type: 'object',
    properties: {
        product_type: {
            type: 'string',
            enum: Object.values(ProductType)
        },
        branch_id: {
            type: 'string',
            minLength: 1
        },
    },
    additionalProperties: false,
}