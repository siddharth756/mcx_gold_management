import { ProductType } from "./enums";

export interface BranchDistributionsInput {
    branch_id: string,
    allocated_quantity_kg: number,
    sellable_quantity_kg: number,
    remaining_quantity_kg: number,
    branch_variation: number
}

export interface BranchDistributionsPayload {
    distribution_date?: string,
    product_type: ProductType,
    total_quantity_kg: number,
    branch_distributions: BranchDistributionsInput[]
}                     

export interface BranchDistributionsParams {
    product_type: ProductType,
    branch_id: string
}