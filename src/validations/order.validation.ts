import { OrderType, ProductType } from "../types/enums";

export const orderSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 1
        },
        email: {
            type: 'string',
            format: 'email'
        },
        mobile: {
            type: 'string',
            minLength: 10,
            pattern: '^[0-9]{10}$'
        },
        address: {
            type: 'string',
            minLength: 1
        },
        price_lock_id: {
            type: 'string',
            minLength: 1,
        },
        product_type: {
            type: 'string',
            enum: Object.values(ProductType)
        },
        order_type: {
            type: 'string',
            enum: Object.values(OrderType)
        },
        quantity_kg: {
            type: 'number',
            minimum: 0
        }
    },
    required: ['name', 'email', 'mobile', 'address', 'price_lock_id', 'product_type', 'order_type', 'quantity_kg'],
    additionalProperties: false,
};

export const orderQuerySchema = {
    type: 'object',
    properties: {
        page: {
            type: 'string',
            pattern: '^[0-9]+$'
        },
        limit: {
            type: 'string',
            pattern: '^[0-9]+$'
        },
        dealer_id: {
            type: 'string',
            minLength: 1
        },
        branch_id: {
            type: 'string',
            minLength: 1
        },
        customer_id: {
            type: 'string',
            minLength: 1
        },
        product_type: {
            type: 'string',
            enum: Object.values(ProductType)
        },
        order_type: {
            type: 'string',
            enum: Object.values(OrderType)
        },
        start_date: {
            type: 'string',
            format: 'date',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        },
        end_date: {
            type: 'string',
            format: 'date',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$'
        }
    },
    additionalProperties: false,
}