import { ProductType } from "./enums";

interface DealerDistributionInput {
    dealer_id: string;
    allocated_quantity_kg: number;
    dealer_variation: number;
}

export interface DealerDistributionsPayload {
    branch_id: string
    branch_distribution_id: string,
    dealer_distributions: DealerDistributionInput[],
    product_type: ProductType
}

export interface DealerParams {
    branch_id?: string,
    product_type?: ProductType
}

export interface DealerDistributionsArgs {
    dealer_id: string,
    product_type: ProductType
}