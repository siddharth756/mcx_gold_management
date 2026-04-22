import { Op, Transaction } from "sequelize";
import { Branch, Customer, Order, PriceLock, User } from "../models";
import { OrderParams, orderPayload } from "../types/order.interfaces";
import { customerPayload } from "../utils/customer";
import { UserRole } from "../types/enums";
import { sequelize } from "../server";

const getOrder = async ({ page, limit, dealer_id, branch_id, customer_id, product_type, order_type, start_date, end_date }: OrderParams) => {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (dealer_id) {
        where.dealer_id = dealer_id;
    }

    if (customer_id) {
        where.customer_id = customer_id;
    }

    if (product_type) {
        where.product_type = product_type;
    }

    if (order_type) {
        where.order_type = order_type;
    }

    if (start_date || end_date) {
        const dateFilter: any = {};

        if (start_date) {
            dateFilter[Op.gte] = new Date(start_date + 'T00:00:00');
        }

        if (end_date) {
            dateFilter[Op.lte] = new Date(end_date + 'T23:59:59');
        }

        where.created_at = dateFilter;
    }

    const dealerInclude: any = {
        model: User,
        as: "dealer",
        required: !!branch_id,
        include: [
            {
                model: Branch,
                as: "branch",
                required: !!branch_id,
                ...(branch_id && {
                    where: { id: branch_id }
                })
            }
        ]
    };

    const { rows, count } = await Order.findAndCountAll({
        where,
        include: [
            dealerInclude,
            {
                model: Customer,
                as: "customer",
                required: false
            },
            {
                model: PriceLock,
                as: "price_lock",
                required: false
            }
        ],
        offset,
        limit
    });

    return {
        orders: rows,
        totalRecords: count
    };
};

const createOrder = async (orderData: orderPayload, transaction?: Transaction) => {
    const { dealer_id, branch_id, customer_id, price_lock_id, product_type, order_type, quantity_kg } = orderData

    return await Order.create({ dealer_id, branch_id, customer_id, price_lock_id, product_type, order_type, quantity_kg }, { transaction })
}

const findOrCreateCustomer = async ({ email, name, mobile, address, dealer_id }: customerPayload) => {
    const [customer] = await Customer.findOrCreate({
        where: { email },
        defaults: {
            name,
            mobile,
            address,
            created_by: dealer_id
        }
    });
    return customer?.toJSON() || null;
}

const getOrderByRole = async (user: any, startOfDay: Date, endOfDay: Date) => {
    const where: any = {
        created_at: { [Op.between]: [startOfDay, endOfDay] }
    };

    if (user.role === UserRole.BRANCH_ADMIN) {
        where.branch_id = user.branch_id;
    }

    if (user.role === UserRole.DEALER) {
        where.branch_id = user.branch_id;
        where.dealer_id = user.id;
    }

    const orders = await Order.findAll({
        where,
        attributes: [
            "dealer_id",
            "branch_id",
            "product_type",
            "order_type",
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
        ],
        group: ["dealer_id", "branch_id", "product_type", "order_type"],
    });
    return orders.map(d => d.toJSON());
}

export default {
    getOrder,
    createOrder,
    findOrCreateCustomer,
    getOrderByRole
}