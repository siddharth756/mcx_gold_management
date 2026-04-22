export const rolloverQuerySchema = {
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