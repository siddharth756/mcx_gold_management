export const responseMessages = {
    // Common Messages
    serverError: 'Internal server error. Please try again later.',
    validationFailed: 'Validation failed. Please check your input.',
    badRequest: 'Invalid request. Please check your input.',
    unauthorized: 'Invalid token.',
    forbidden: 'Access denied. You do not have permission to perform this action.',
    tokenInvalid: 'Invalid or malformed token.',
    notFound: 'Resource not found.',
    conflict: 'Resource already exists.',

    // Module: Authentication
    authentication: {
        invalidEmailOrPassword: 'Invalid email or password.',
        loginFailed: 'Login failed. Please check your email and password.',
        loginSuccess: 'Login successful.',
        registerFailed: 'Registration failed. Please try again later.',
        registerSuccess: 'Registration successful.',
        forgotPasswordFailed: 'Forgot password failed. Please try again later.',
        forgotPasswordSuccess: 'Forgot password successful.',
        resetPasswordFailed: 'Reset password failed. Please try again later.',
        resetPasswordSuccess: 'Reset password successful.',
    },

    // Module: User
    user: {
        retrieved: 'User fetched successfully.',
        retrievedSingle: 'User fetched successfully.',
        failedToRetrieve: 'Failed to retrieve user data. Please try again later.',
        notFoundSingle: 'User not found.',
        notFoundMultiple: 'No users found.',
        emailAlreadyRegistered: 'Email is already registered.',
        failedToCreate: 'Failed to create user.',
        updated: 'User updated successfully.',
        failedToUpdate: 'Failed to update user.',
        deleted: 'User deleted successfully.',
        failedToDelete: 'Failed to delete user.',
        userAlreadyDeleted: 'User is already deleted.',
        noDataProvided: 'No data provided in the request body.',
        invalidQueryParams: 'Invalid query parameters.',
        invalidRole: 'Invalid role.'
    },

    // Module: Branch
    branch: {
        retrieved: 'Branches fetched successfully.',
        failedToRetrieve: 'Failed to retrieve branch data. Please try again later.',
        retrievedSingle: 'Branch fetched successfully.',
        notFoundSingle: 'Branch not found.',
        notFoundMultiple: 'No branches found.',
        created: 'Branch created successfully.',
        failedToCreate: 'Failed to create branch.',
        updated: 'Branch updated successfully.',
        failedToUpdate: 'Failed to update branch.',
        deleted: 'Branch deleted successfully.',
        failedToDelete: 'Failed to delete branch.',
        branchAlreadyDeleted: 'Branch is already deleted.',
        branchAlreadyExist: 'Branch already exist.',
        branchNotAssigned: 'Branch not assigned.'
    },

    // Module: System Settings
    systemSettings: {
        retrieved: 'System settings fetched successfully.',
        failedToRetrieve: 'Failed to retrieve system settings data. Please try again later.',
        notFoundSingle: 'System settings not found.',
        notFoundMultiple: 'No system settings found.',
        updated: 'System settings updated successfully.',
        failedToUpdate: 'Failed to update system settings.'
    },

    // Module: Branch Distributions
    branchDistributions: {
        retrieved: 'Branch distributions fetched successfully.',
        failedToRetrieve: 'Failed to retrieve branch distributions data. Please try again later.',
        notFoundSingle: 'Branch distributions not found.',
        notFoundMultiple: 'No branch distributions found.',
        created: 'Branch distributions created successfully.',
        failedToCreate: 'Failed to create branch distributions.',
    },

    // Module: Dealer Distributions
    dealerDistributions: {
        retrieved: 'Dealer distributions fetched successfully.',
        failedToRetrieve: 'Failed to retrieve dealer distributions data. Please try again later.',
        notFoundSingle: 'Dealer distributions not found.',
        notFoundMultiple: 'No dealer distributions found.',
        created: 'Dealer distributions created successfully.',
        failedToCreate: 'Failed to create dealer distributions.',
    },

    // Module: Price Locks
    priceLocks: {
        retrieved: 'Price locks fetched successfully.',
        failedToRetrieve: 'Failed to retrieve price locks data. Please try again later.',
        notFoundSingle: 'Price locks not found.',
        notFoundMultiple: 'No price locks found.',
        created: 'Price locks created successfully.',
        failedToCreate: 'Failed to create price locks.',
        invalidQueryParams: 'Invalid query parameters.',
    },

    // Module: Price Locks
    order: {
        retrieved: 'Order fetched successfully.',
        failedToRetrieve: 'Failed to retrieve order data. Please try again later.',
        notFoundSingle: 'Order not found.',
        notFoundMultiple: 'No order found.',
        created: 'Order created successfully.',
        failedToCreate: 'Failed to create order.',
        invalidQueryParams: 'Invalid query parameters.',
    },

    // Module: Report
    report: {
        retrieved: 'Report fetched successfully.',
        notFoundMultiple: 'No report found.',
        failedToRetrieve: 'Failed to retrieve report data. Please try again later.',
    },

    // Module: Inventory
    inventory: {
        retrieved: 'Inventory fetched successfully.',
        notFoundMultiple: 'No inventory found.',
        failedToRetrieve: 'Failed to retrieve inventory data. Please try again later.',
    },

    // Module: Rollover
    rollover: {
        retrieved: 'Roll over report fetched successfully.',
        notFoundMultiple: 'No roll over report found.',
        failedToRetrieve: 'Failed to retrieve roll over data. Please try again later.',
    }
}