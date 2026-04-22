import { Op } from "sequelize";
import { RolloverParams } from "../types/rollover.interfaces";
import { UserRole } from "../types/enums";
import {
    Branch,
    BranchDistributions,
    DailyDistributions,
    DealerDistributions,
    User
} from "../models";

const getDateFilter = (start_date?: string, end_date?: string) => {
    const filter: any = {};

    if (start_date || end_date) {
        filter.distribution_date = {};

        if (start_date) {
            filter.distribution_date[Op.gte] = start_date;
        }

        if (end_date) {
            filter.distribution_date[Op.lte] = end_date;
        }
    }

    return filter;
};

const getRollover = async ({
    page = 1,
    limit = 10,
    user,
    start_date,
    end_date
}: RolloverParams) => {
    const offset = (page - 1) * limit;
    const dateFilter = getDateFilter(start_date, end_date);

    const branchWhere: any = {};
    if (user.role === UserRole.BRANCH_ADMIN) {
        branchWhere.branch_id = user.branch_id;
    }

    const { rows, count } =
        await DailyDistributions.findAndCountAll({
            where: dateFilter,
            include: [
                {
                    model: BranchDistributions,
                    as: "branch_distributions",
                    where: branchWhere,
                    required: user.role === UserRole.BRANCH_ADMIN,
                    include: [
                        {
                            model: Branch,
                            as: "branch",
                            attributes: ["id", "name"]
                        },
                        {
                            model: DealerDistributions,
                            as: "dealer_distributions",
                            include: [
                                {
                                    model: User,
                                    as: "dealer",
                                    attributes: ["id", "name"]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [["distribution_date", "DESC"]],
            limit,
            offset,
            distinct: true
        });

    const dailyDistributions = rows.map((d) => d.toJSON())

    const reports = dailyDistributions.map((daily: any) => {
        const branches: any[] = [];
        const productType = daily.product_type;

        daily.branch_distributions.forEach((branchDist: any) => {

            let totalAllocated = parseFloat(branchDist.allocated_quantity_kg);
            let totalRemaining = parseFloat(branchDist.remaining_quantity_kg);
            let totalSellable = parseFloat(branchDist.sellable_quantity_kg);

            const dealers = branchDist.dealer_distributions.map((dealerDist: any) => {

                const allocated = parseFloat(dealerDist.allocated_quantity_kg);
                const remaining = parseFloat(dealerDist.remaining_quantity_kg);
                const sellable = parseFloat(dealerDist.sellable_quantity_kg);

                return {
                    dealer_id: dealerDist.dealer?.id,
                    dealer_name: dealerDist.dealer?.name,
                    product_type: productType,
                    allocated_quantity_kg: allocated,
                    remaining_quantity_kg: remaining,
                    sellable_quantity_kg: sellable
                };
            });

            branches.push({
                branch_id: branchDist.branch?.id,
                branch_name: branchDist.branch?.name,
                product_type: productType,
                dealers,
                total_allocated_quantity_kg: totalAllocated,
                total_remaining_quantity_kg: totalRemaining,
                sellable_quantity_kg: totalSellable
            });
        });

        return {
            date: daily.distribution_date,
            branches
        };
    });

    const totalPages = Math.ceil(count / limit);

    return {
        reports,
        pagination: {
            page,
            limit,
            totalRecords: count,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};

export default {
    getRollover
};