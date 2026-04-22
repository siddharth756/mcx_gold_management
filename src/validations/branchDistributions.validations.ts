import { ProductType } from "../types/enums";

export const branchDistributionSchema = {
    type: 'object',
    properties: {
        distribution_date: {
            type: 'string',
            format: 'date',
        },
        product_type: {
            type: 'string',
            enum: Object.values(ProductType)
        },
        branch_distributions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    branch_id: {
                        type: 'string',
                        minLength: 1, 
                    },
                    allocated_quantity_kg: {
                        type: 'number',
                        minimum: 0, 
                    },
                    branch_variation: {
                        type: 'number',
                        minimum: 0, 
                    },
                },
                required: ['branch_id', 'allocated_quantity_kg', 'branch_variation'], 
                additionalProperties: false, 
            },
        },
    },
    required: ['product_type', 'branch_distributions'], 
    additionalProperties: false, 
};
