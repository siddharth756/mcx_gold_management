import { ProductType } from "./enums";

export interface PriceLockPayload {
    dealer_id: string,
    scripts: LivePrice[],
    lock_duration: Date,
    tax_amount: number
}

export interface LivePrice {
    script_id: string,
    script_name: string,
    script_variance: number,
    price: number,
    product_type: ProductType
}

export interface PriceLockParams {
    page: number;
    limit: number;
}