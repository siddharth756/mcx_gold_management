export const systemSettingsSchema = {
    type: 'object',
    properties: {
        daily_distribution_limit: {
            type: 'number',
            minimum: 0,
        },
        price_lock_duration: {
            type: 'number',
            minimum: 0
        },
        instrument_token: {
            type: 'number',
            minimum: 0
        },
        tax_amount: {
            type: 'number',
            minimum: 0,
        },
        scripts: {
            type: 'array',
            items: {
                type: 'object', 
                properties: {
                    script_name: {
                        type: 'string',
                        minLength: 1
                    },
                    script_variance: {
                        type: 'number',
                        minimum: 0
                    },
                },
                required: ['script_name', 'script_variance'], 
                additionalProperties: false,
            },
        },
    },
    required: ['daily_distribution_limit', 'price_lock_duration', 'tax_amount', 'scripts'],
    additionalProperties: false
};