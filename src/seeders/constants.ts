export const DEFAULT_USERS = [
    {
        id: "8c8f3a9e-7a4e-4b7e-9f6f-1b2c3d4e5f60",
        email: "admin@example.com",
        password: "Admin@123",
        role: "admin",
    }
];

export const DEFAULT_SYSTEM_SETTINGS = [
    {
        id: "08b09245-4068-4dc8-b64e-6e7642d09a41",
        product_type: 'gold',
        daily_distribution_limit: 100,
        price_lock_duration: 30,
        tax_amount: 100
    },
    {
        id: "780edd53-38d2-4f93-ada5-496eff7447e6",
        product_type: 'silver',
        daily_distribution_limit: 200,
        price_lock_duration: 20,
        tax_amount: 50
    }
]