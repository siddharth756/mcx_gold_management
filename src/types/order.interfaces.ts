import { OrderType, ProductType } from "./enums";

export interface orderPayload {
    dealer_id: string,
    branch_id: string,
    customer_id: string,
    price_lock_id: string,
    product_type: ProductType,
    order_type: OrderType,
    quantity_kg: number
}

export interface OrderParams {
    page: number;
    limit: number;
    dealer_id?: string,
    branch_id?: string,
    customer_id?: string,
    product_type?: ProductType,
    order_type?: OrderType,
    start_date?: string,
    end_date?: string
}