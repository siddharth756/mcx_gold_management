import { col, fn, Op } from "sequelize";
import { Branch, Order, PriceLock, User } from "../models";
import { ReportParams } from "../types/report.interfaces";
import { OrderType, UserRole } from "../types/enums";

// Get order aggregation - count, sum
const getOrdersAggregation = async (
    dealerIds: string[],
    dateFilter: any
) => {
    if (!dealerIds.length) return [];

    return Order.findAll({
        where: {
            ...dateFilter,
            dealer_id: dealerIds,
        },
        attributes: [
            "dealer_id",
            "order_type",
            [fn("COUNT", col("id")), "total_orders"],
            [fn("SUM", col("quantity_kg")), "total_kg"],
        ],
        group: ["dealer_id", "order_type"],
    });
};

// Date filter
const getDateFilter = (start_date?: string, end_date?: string) => {
    const dateFilter: any = {};

    if (start_date || end_date) {
        const createdAt: any = {};

        if (start_date) {
            createdAt[Op.gte] = new Date(start_date + "T00:00:00");
        }

        if (end_date) {
            createdAt[Op.lte] = new Date(end_date + "T23:59:59");
        }

        dateFilter.created_at = createdAt;
    }
    return dateFilter;
};


// Get report by user role
const getReport = async ({
    page,
    limit,
    branch_id,
    user,
    start_date,
    end_date,
}: ReportParams) => {
    const dateFilter = getDateFilter(start_date, end_date);

    if (user.role === UserRole.DEALER) {
        return dealerReport(user, dateFilter);
    }

    if (user.role === UserRole.BRANCH_ADMIN) {
        return branchAdminReport(user, undefined, page, limit, dateFilter);
    }

    if (user.role === UserRole.ADMIN) {
        return adminReport(branch_id, page, limit, dateFilter);
    }
    return null;
};

// Dealer report 
const dealerReport = async (user: any, dateFilter: any) => {
    const orders = await getOrdersAggregation([user.id], dateFilter);
    const sell = orders.find(
        (o) => o.getDataValue("order_type") === OrderType.SELL
    );
    const buy = orders.find(
        (o) => o.getDataValue("order_type") === OrderType.BUY
    );
    const priceLocksCount = await PriceLock.count({
        where: { dealer_id: user.id },
    });
    const dealerInfo = await User.findByPk(user.id, {
        attributes: ["id", "name", "email", "mobile"],
        include: [
            {
                model: Branch,
                as: "branch",
                attributes: ["id", "name"],
            },
        ],
    });

    const totals = {
        total_sell_orders: Number(sell?.getDataValue("total_orders") || 0),
        total_sell_kg: Number(sell?.getDataValue("total_kg") || 0),
        total_buy_orders: Number(buy?.getDataValue("total_orders") || 0),
        total_buy_kg: Number(buy?.getDataValue("total_kg") || 0),
        total_price_locks: priceLocksCount,
    };

    return {
        dealer: {
            dealer: dealerInfo,
            sell: {
                total_orders: totals.total_sell_orders,
                total_kg: totals.total_sell_kg,
            },
            buy: {
                total_orders: totals.total_buy_orders,
                total_kg: totals.total_buy_kg,
            },
            price_locks_count: priceLocksCount,
        },
        pagination: {
            page: 1,
            limit: 1,
            totalRecords: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
        },
        totals,
    };
};


// Branch report 
const branchAdminReport = async (
    user: any,
    branch_id: string | undefined,
    page: number,
    limit: number,
    dateFilter: any
) => {
    const offset = (page - 1) * limit;

    const dealerWhere: any = {
        role: UserRole.DEALER,
    };

    if (user.branch_id) {
        dealerWhere.branch_id = user.branch_id;
    }

    // for admin 
    if (!user.branch_id && branch_id) {
        dealerWhere.branch_id = branch_id;
    }

    const totalRecords = await User.count({ where: dealerWhere });

    const dealers = await User.findAll({
        where: dealerWhere,
        attributes: ["id", "name", "email", "mobile", "branch_id"],
        include: [
            {
                model: Branch,
                as: "branch",
                attributes: ["id", "name"],
            },
        ],
        offset,
        limit,
        order: [["created_at", "DESC"]],
    });

    const dealerIds = dealers.map((d) => d.getDataValue("id"));
    const orderAgg = await getOrdersAggregation(dealerIds, dateFilter);

    const priceLocks = dealerIds.length
        ? await PriceLock.findAll({
            where: { dealer_id: dealerIds },
            attributes: [
                "dealer_id",
                [fn("COUNT", col("id")), "total_price_locks"],
            ],
            group: ["dealer_id"],
        })
        : [];

    const dealerReports = dealers.map((dealer) => {
        const dealerId = dealer.getDataValue("id");

        const dealerOrders = orderAgg.filter(
            (o) => o.getDataValue("dealer_id") === dealerId
        );

        const sell = dealerOrders.find(
            (o) => o.getDataValue("order_type") === OrderType.SELL
        );

        const buy = dealerOrders.find(
            (o) => o.getDataValue("order_type") === OrderType.BUY
        );

        const priceLock = priceLocks.find(
            (p) => p.getDataValue("dealer_id") === dealerId
        );

        return {
            dealer,
            sell: {
                total_orders: Number(sell?.getDataValue("total_orders") || 0),
                total_kg: Number(sell?.getDataValue("total_kg") || 0),
            },
            buy: {
                total_orders: Number(buy?.getDataValue("total_orders") || 0),
                total_kg: Number(buy?.getDataValue("total_kg") || 0),
            },
            price_locks_count: Number(
                priceLock?.getDataValue("total_price_locks") || 0
            ),
        };
    });

    const totals = dealerReports.reduce(
        (acc, d) => {
            acc.total_sell_orders += d.sell.total_orders;
            acc.total_sell_kg += d.sell.total_kg;
            acc.total_buy_orders += d.buy.total_orders;
            acc.total_buy_kg += d.buy.total_kg;
            acc.total_price_locks += d.price_locks_count;
            return acc;
        },
        {
            total_sell_orders: 0,
            total_sell_kg: 0,
            total_buy_orders: 0,
            total_buy_kg: 0,
            total_price_locks: 0,
        }
    );

    const totalPages = Math.ceil(totalRecords / limit);

    return {
        dealers: dealerReports,
        pagination: {
            page,
            limit,
            totalRecords,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        totals,
    };
};


// Admin report
const adminReport = async (
    branch_id: string | undefined,
    page: number,
    limit: number,
    dateFilter: any
) => {
    const AdminUser = { branch_id: undefined };

    return branchAdminReport(
        AdminUser,
        branch_id,
        page,
        limit,
        dateFilter
    );
};


export default {
    getReport
}