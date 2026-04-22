import { Transaction } from "sequelize";
import { Branch, BranchDistributions, DailyDistributions } from "../models";
import { BranchDistributionsParams, BranchDistributionsPayload } from "../types/branchDistributions.interfaces";

const getBranchDistributions = async () => {
    return await BranchDistributions.findAll({
        include: [
            {
                model: Branch,
                as: 'branch',
                required: false
            },
            {
                model: DailyDistributions,
                as: 'daily_distributions',
                required: false
            }
        ]
    })
}

const BranchDistributionExist = async ({ branch_id, product_type }: BranchDistributionsParams) => {
    const data = await BranchDistributions.findOne({
        where: { branch_id },
        include: [
            {
                model: DailyDistributions,
                as: "daily_distributions",
                required: true,
                where: { product_type, distribution_date: new Date() }
            }
        ]
    })
    return data?.toJSON()
}

const getBranchDistributionsById = async (branchDistributionId: string, transaction?: Transaction) => {
    const distribution = await BranchDistributions.findOne({
        where: {
            id: branchDistributionId
        },
        include: [{
            model: DailyDistributions,
            as: "daily_distributions"
        }],
        transaction,
    })
    return distribution?.toJSON() || null;
}

const createBranchDistributions = async (branchDistributionsData: BranchDistributionsPayload, transaction?: Transaction) => {
    const { distribution_date, product_type, total_quantity_kg, branch_distributions } = branchDistributionsData

    // Create Daily distributions
    const daily_distribution = await DailyDistributions.create({
        distribution_date,
        product_type,
        total_quantity_kg
    }, { transaction })

    // Branch distributions array
    const branchDistributions = branch_distributions.map((item) => ({
        ...item,
        daily_distribution_id: daily_distribution.dataValues.id
    }))

    return await BranchDistributions.bulkCreate(branchDistributions, { transaction })
}

export default {
    getBranchDistributions,
    createBranchDistributions,
    BranchDistributionExist,
    getBranchDistributionsById
}