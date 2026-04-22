import { Transaction } from "sequelize";
import { PriceLock, Scripts, User } from "../models";
import { PriceLockParams, PriceLockPayload } from "../types/priceLock.interfaces";

const getPriceLock = async ({ page, limit }: PriceLockParams) => {
    const offset = (page - 1) * limit;

    const { rows, count } = await PriceLock.findAndCountAll({
        include: [{
            model: Scripts,
            as: "scripts",
            required: false,
        }, {
            model: User,
            as: "dealer",
            required: false
        }],
        offset,
        limit
    })
    return {
        priceLocks: rows,
        totalRecords: count
    }
}

const getPriceLockById = async (priceLockId: string) => {
    const priceLock = await PriceLock.findOne({ where: { id: priceLockId } })
    return priceLock?.toJSON() || null;
}


const createPriceLock = async (priceLockData: PriceLockPayload, transaction?: Transaction) => {
    const { dealer_id, scripts, lock_duration, tax_amount } = priceLockData

    const priceLock = scripts.map((script) => {
        const basePrice = Number(script.price)
        const finalPrice = Number((basePrice + tax_amount).toFixed(2));

        return {
            dealer_id,
            script_id: script.script_id,
            product_type: script.product_type,
            price: finalPrice,
            lock_duration
        }
    });

    return await PriceLock.bulkCreate(priceLock, { transaction })
}

export default {
    getPriceLock,
    createPriceLock,
    getPriceLockById
}