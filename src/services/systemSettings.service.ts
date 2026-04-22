import { Transaction } from "sequelize";
import { Scripts, SystemSettings } from "../models/index";
import { SystemSettingsPayload } from "../types/systemSettings.interfaces";
import { ProductType } from "../types/enums";
import redisClient from "../config/redis";

const getSystemSettings = async () => {
    return await SystemSettings.findAll({
        include: [{
            model: Scripts,
            as: 'scripts',
            required: false
        }]
    });
}

const getSystemSettingsById = async (systemSettingsId: string) => {
    return await SystemSettings.findOne({
        where: { id: systemSettingsId }, include: [{
            model: Scripts,
            as: 'scripts',
            required: false
        }]
    })
}

const getSystemSettingsByProductType = async (product_type: ProductType) => {
    const data =  await SystemSettings.findOne({
        where: { product_type },
        include: [{
            model: Scripts,
            as: 'scripts'
        }]
    })
    return data?.toJSON()
}

const updateSystemSettings = async (systemSettingsId: string, updateData: SystemSettingsPayload, updatedBy?: string | null, transaction?: Transaction) => {
    await SystemSettings.update(
        {
            daily_distribution_limit: updateData.daily_distribution_limit,
            price_lock_duration: updateData.price_lock_duration,
            tax_amount: updateData.tax_amount,
            updated_at: new Date(),
            ...(updatedBy && { updated_by: updatedBy })
        },
        {
            where: { id: systemSettingsId },
            transaction
        }
    );


    // Deactivate old scripts
    await Scripts.update({ is_active: false }, { where: { system_id: systemSettingsId, is_active: true }, transaction });

    const newScripts = updateData.scripts.map((script: any) => ({
        script_name: script.script_name,
        script_variance: script.script_variance,
        system_id: systemSettingsId,
        is_active: true
    }))

    // Creates new scripts0
    const updatedScripts = await Scripts.bulkCreate(newScripts, { transaction })

    // Update redis
    await redisClient.set('scripts', JSON.stringify(updatedScripts))
}

export default {
    getSystemSettings,
    updateSystemSettings,
    getSystemSettingsById,
    getSystemSettingsByProductType
}