import { Sequelize } from 'sequelize'
import { SystemSettings } from '../models'
import Logger from '../utils/logger.service'
import { DEFAULT_SYSTEM_SETTINGS } from './constants'

export const seedSystemSettings = async (connection: Sequelize) => {
    const transaction = await connection.transaction();
    try {
        const systemSettingsToSeed = await Promise.all(
            DEFAULT_SYSTEM_SETTINGS.map(async (setting) => {
                return {
                    id: setting.id,
                    product_type: setting.product_type,
                    daily_distribution_limit: setting.daily_distribution_limit,
                    price_lock_duration: setting.price_lock_duration,
                    tax_amount: setting.tax_amount
                }
            })
        );

        await SystemSettings.bulkCreate(systemSettingsToSeed, {
            transaction,
            updateOnDuplicate: ['updated_at']
        })

        Logger.info(`Bulk processed ${DEFAULT_SYSTEM_SETTINGS.length} system settings successfully.`)

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        Logger.error("Error seeding system settings: ", error);
        throw error;
    }
}