export const branchSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 1
        },
        address: {
            type: 'string',
            minLength: 1
        }
    },
    additionalProperties: false
}