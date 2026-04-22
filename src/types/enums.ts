export enum StatusCode {
    CONFLICT = 409,
    SUCCESS = 200,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    INTERNAL_ERROR = 500,
};

export enum UserRole {
    ADMIN = 'admin',
    BRANCH_ADMIN = 'branch_admin',
    DEALER = 'dealer'
}

export enum ProductType {
    GOLD = 'gold',
    SILVER = 'silver'
}

export enum OrderType {
    BUY = 'buy',
    SELL = 'sell'
}