import { Branch, BranchDistributions, DailyDistributions, DealerDistributions, User } from "../models";
import { UserRole } from "../types/enums";

const getDailyDistributions = async (
    date: string,
    role: UserRole,
    branch_id?: string,
    dealer_id?: string
) => {

    const branchInclude: any = {
        model: BranchDistributions,
        as: "branch_distributions",
        ...(branch_id && {
            where: { branch_id },
            required: true
        }),
        include: [{
            model: DealerDistributions,
            as: "dealer_distributions",
            ...(dealer_id && {
                where: { dealer_id },
                required: true
            }),
            include: [{
                model: User,
                as: "dealer",
                attributes: ["id", "name", "email", "mobile", "branch_id"],
            }]
        }]
    };

    if (role === UserRole.ADMIN || role === UserRole.BRANCH_ADMIN) {
        branchInclude.include.push({
            model: Branch,
            as: "branch",
            attributes: ["id", "name"]
        });
    }

    const dailyDistributions = await DailyDistributions.findAll({
        where: { distribution_date: date },
        include: [branchInclude]
    });

    return dailyDistributions.map(d => d.toJSON());
};

export default {
    getDailyDistributions
};