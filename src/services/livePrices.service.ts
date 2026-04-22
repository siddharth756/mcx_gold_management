import redisClient from "../config/redis";
import { Scripts, SystemSettings } from "../models";
import { ProductType } from "../types/enums";
import { priceGenerator } from "../utils/priceGenerator.service";

export const livePrices = async () => {
    const prices = priceGenerator()
    let scripts;

    // Get cached scripts
    const cachedScripts = await redisClient.get("scripts")

    if (cachedScripts) {
        scripts = JSON.parse(cachedScripts)
    } else {
        // Get scripts
        scripts = await Scripts.findAll({
            where: { is_active: true },
            include: [{
                model: SystemSettings,
                as: "system_settings",
                required: false
            }]
        })
        scripts = scripts.map((script: any) => script.toJSON());

        // Set scripts to Redis
        await redisClient.set('scripts', JSON.stringify(scripts))
    }

    const livePrices = scripts.map((script: any) => {
        const product_type = script.system_settings.product_type as ProductType
        const price = parseFloat((prices[product_type] * (1 + script.script_variance / 100)).toFixed(2));
        return {
            script_id: script.id,
            script_name: script.script_name,
            script_variance: script.script_variance,
            price: price,
            product_type
        }
    })
    return livePrices
}