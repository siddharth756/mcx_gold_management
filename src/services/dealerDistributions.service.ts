import { Transaction } from "sequelize";
import { Branch, BranchDistributions, DealerDistributions, User } from "../models";
import { DealerDistributionsArgs, DealerDistributionsPayload, DealerParams } from "../types/dealerDistributions.interfaces";
import { ProductType } from "../types/enums";

const getDealerDistributions = async ({ branch_id, product_type }: DealerParams) => {
    const where: any = {}

    if (product_type) {
        where.product_type = product_type
    }

    if (branch_id) {
        where.branch_id = branch_id;
    }

    return await DealerDistributions.findAll({
        where,
        include: [
            {
                model: User,
                as: 'dealer',
                required: false,
            },
            {
                model: BranchDistributions,
                as: 'branch_distributions',
                required: false,
                include: [{
                    model: Branch,
                    as: 'branch',
                    required: false,
                }]
            }
        ]
    })
}

const getDealerDistributionsByDealerIdAndProductType = async ({ dealer_id, product_type }: DealerDistributionsArgs, transaction?: Transaction) => {
    const distribution = await DealerDistributions.findOne({
        where: {
            dealer_id,
            product_type,
        },
        transaction,
    })
    return distribution?.toJSON() || null;
}

const createDealerDistributions = async (dealerDistributionsData: DealerDistributionsPayload, transaction?: Transaction) => {
    const { branch_id, branch_distribution_id, dealer_distributions, product_type } = dealerDistributionsData

    // Dealer distributions array
    const dealerDistributionsArray = dealer_distributions.map((distribution: any) => {
        const dealer_variation = distribution.dealer_variation;
        const allocated_quantity_kg = distribution.allocated_quantity_kg

        // Calculate sellable quantity and remaining quantity
        const sellable_quantity_kg = Number((allocated_quantity_kg * (1 + dealer_variation / 100)).toFixed(2));

        return {
            dealer_id: distribution.dealer_id,
            branch_id: branch_id,
            branch_distribution_id: branch_distribution_id,
            allocated_quantity_kg: allocated_quantity_kg,
            sellable_quantity_kg: sellable_quantity_kg,
            remaining_quantity_kg: allocated_quantity_kg,
            dealer_variation: dealer_variation,
            product_type: product_type
        }
    })


    // Create dealer distributions
    return await DealerDistributions.bulkCreate(dealerDistributionsArray, { transaction })
}

export default {
    getDealerDistributions,
    createDealerDistributions,
    getDealerDistributionsByDealerIdAndProductType
}