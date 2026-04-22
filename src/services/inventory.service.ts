import { ProductType, UserRole } from "../types/enums";
import dailyDistributionsService from "./dailyDistributions.service";
import orderService from "./order.service";

const createSummary = () => ({
    gold: createProductSummary(),
    silver: createProductSummary()
});

const createProductSummary = () => ({
    total: 0,
    allocated: 0,
    remaining: 0,
    sellable: 0,
    sold: 0,
    bought: 0
});

const createOrderSummary = () => ({
    total_gold_sell_orders: 0,
    total_gold_buy_orders: 0,
    total_gold_orders: 0,
    total_silver_sell_orders: 0,
    total_silver_buy_orders: 0,
    total_silver_orders: 0,
    total_sell_orders: 0,
    total_buy_orders: 0,
    total_orders: 0
});

const getTodayRange = () => {
    const today = new Date().toISOString().split("T")[0];

    return {
        today,
        startOfDay: new Date(`${today}T00:00:00`),
        endOfDay: new Date(`${today}T23:59:59`)
    };
};


const updateOrderSummary = (
    summary: any,
    product: string,
    type: string,
    count: number
) => {

    summary.total_orders += count;

    if (product === "gold") {
        summary.total_gold_orders += count;

        if (type === "sell") {
            summary.total_gold_sell_orders += count;
            summary.total_sell_orders += count;
        }

        if (type === "buy") {
            summary.total_gold_buy_orders += count;
            summary.total_buy_orders += count;
        }
    }

    if (product === "silver") {
        summary.total_silver_orders += count;

        if (type === "sell") {
            summary.total_silver_sell_orders += count;
            summary.total_sell_orders += count;
        }

        if (type === "buy") {
            summary.total_silver_buy_orders += count;
            summary.total_buy_orders += count;
        }
    }
};


// Get Inventory
const getInventory = async (user: any) => {
    const { today, startOfDay, endOfDay } = getTodayRange();
    const summary = createSummary();
    const orderSummary = createOrderSummary();

    // Fetch daily distributions
    const dailyDistributions = await dailyDistributionsService.getDailyDistributions(today, user.role)

    // Fetch orders
    const orders: any = await orderService.getOrderByRole(user, startOfDay, endOfDay);

    // branch, dealer map
    const dealerOrderMap: Record<string, any> = {};
    const branchOrderMap: Record<string, any> = {};
    const dealerMap: Record<string, any> = {};
    const branchMap: Record<string, any> = {};

    // Order mappping
    for (const row of orders) {

        const count = Number(row.count || 0);
        const product = row.product_type;
        const type = row.order_type;

        const branchKey = `${row.branch_id}_${product}`;
        const dealerKey = `${row.dealer_id}_${product}`;

        if (!branchOrderMap[branchKey]) {
            branchOrderMap[branchKey] = {
                sell_orders_count: 0,
                buy_orders_count: 0,
                total_orders: 0
            };
        }

        if (!dealerOrderMap[dealerKey]) {
            dealerOrderMap[dealerKey] = {
                sell_orders_count: 0,
                buy_orders_count: 0,
                total_orders: 0
            };
        }

        if (type === "sell") {
            branchOrderMap[branchKey].sell_orders_count += count;
            dealerOrderMap[dealerKey].sell_orders_count += count;
        }

        if (type === "buy") {
            branchOrderMap[branchKey].buy_orders_count += count;
            dealerOrderMap[dealerKey].buy_orders_count += count;
        }

        branchOrderMap[branchKey].total_orders += count;
        dealerOrderMap[dealerKey].total_orders += count;

        updateOrderSummary(orderSummary, product, type, count);
    }

    // Distribution 
    for (const daily of dailyDistributions) {
        const product = daily.product_type as ProductType;
        summary[product].total += parseFloat(daily.total_quantity_kg || 0);

        for (const branch of daily.branch_distributions || []) {

            const branchAllocated = parseFloat(branch.allocated_quantity_kg || 0);
            const branchRemaining = parseFloat(branch.remaining_quantity_kg || 0);
            const branchSellable = parseFloat(branch.sellable_quantity_kg || 0);

            summary[product].allocated += branchAllocated;
            summary[product].remaining += branchRemaining;
            summary[product].sellable += branchSellable;

            const branchKey = `${branch.branch_id}_${product}`;

            if (!branchMap[branchKey]) {
                branchMap[branchKey] = {
                    ...branch,
                    sold_quantity_kg: 0,
                    bought_quantity_kg: 0,
                    sell_orders_count: 0,
                    buy_orders_count: 0,
                    total_orders: 0
                };
            }

            const branchDiff = branchRemaining - branchAllocated;
            if (branchDiff < 0) branchMap[branchKey].sold_quantity_kg += Math.abs(branchDiff);
            if (branchDiff > 0) branchMap[branchKey].bought_quantity_kg += branchDiff;

            const branchOrders = branchOrderMap[branchKey];
            if (branchOrders) Object.assign(branchMap[branchKey], branchOrders);

            // Dealers
            for (const dealer of branch.dealer_distributions || []) {

                const dealerAllocated = parseFloat(dealer.allocated_quantity_kg || 0);
                const dealerRemaining = parseFloat(dealer.remaining_quantity_kg || 0);

                const dealerKey = `${dealer.dealer_id}_${product}`;

                if (!dealerMap[dealerKey]) {
                    dealerMap[dealerKey] = {
                        ...dealer,
                        sold_quantity_kg: 0,
                        bought_quantity_kg: 0,
                        sell_orders_count: 0,
                        buy_orders_count: 0,
                        total_orders: 0
                    };
                }

                const diff = dealerRemaining - dealerAllocated;
                if (diff < 0) dealerMap[dealerKey].sold_quantity_kg += Math.abs(diff);
                if (diff > 0) dealerMap[dealerKey].bought_quantity_kg += diff;

                const dealerOrders = dealerOrderMap[dealerKey];
                if (dealerOrders) Object.assign(dealerMap[dealerKey], dealerOrders);
            }
        }

        const totalDiff =
            summary[product].remaining - summary[product].allocated;

        if (totalDiff < 0) summary[product].sold += Math.abs(totalDiff);
        if (totalDiff > 0) summary[product].bought += totalDiff;
    }

    const baseResponse = {
        date: today,
        summary: {
            total_gold_kg: summary.gold.total,
            total_gold_allocated_kg: summary.gold.allocated,
            total_gold_remaining_kg: summary.gold.remaining,
            total_gold_sold_kg: summary.gold.sold,
            total_gold_bought_kg: summary.gold.bought,
            unallocated_gold_kg: summary.gold.total - summary.gold.allocated,
            total_sellable_gold_kg: summary.gold.sellable,

            total_silver_kg: summary.silver.total,
            total_silver_allocated_kg: summary.silver.allocated,
            total_silver_remaining_kg: summary.silver.remaining,
            total_silver_sold_kg: summary.silver.sold,
            total_silver_bought_kg: summary.silver.bought,
            unallocated_silver_kg: summary.silver.total - summary.silver.allocated,
            total_sellable_silver_kg: summary.silver.sellable,

            total_sold_kg: summary.gold.sold + summary.silver.sold,
            total_bought_kg: summary.gold.bought + summary.silver.bought,
            total_remaining_kg: summary.gold.remaining + summary.silver.remaining,

            order_summary: orderSummary
        }
    };

    const dealerAllocations = Object.values(dealerMap).map((dealer: any) => ({
        dealer: dealer.dealer,
        product_type: dealer.product_type,
        allocated_quantity_kg: parseFloat(dealer.allocated_quantity_kg),
        sellable_quantity_kg: parseFloat(dealer.sellable_quantity_kg),
        remaining_quantity_kg: parseFloat(dealer.remaining_quantity_kg),
        sold_quantity_kg: dealer.sold_quantity_kg,
        bought_quantity_kg: dealer.bought_quantity_kg,
        sell_orders_count: dealer.sell_orders_count,
        buy_orders_count: dealer.buy_orders_count,
        total_orders: dealer.total_orders
    }));

    if (user.role === UserRole.DEALER) {
        return {
            ...baseResponse,
            dealer_distributions: dealerAllocations
        };
    }

    const branchAllocations = Object.values(branchMap).map((branch: any) => ({
        branch_variation: parseFloat(branch.branch_variation),
        allocated_quantity_kg: parseFloat(branch.allocated_quantity_kg),
        sellable_quantity_kg: parseFloat(branch.sellable_quantity_kg),
        remaining_quantity_kg: parseFloat(branch.remaining_quantity_kg),
        id: branch.id,
        distribution_id: branch.distribution_id,
        branch_id: branch.branch_id,
        is_active: branch.is_active,
        created_at: branch.created_at,
        updated_at: branch.updated_at,
        branch: branch.branch,
        product_type: branch.product_type,
        sold_quantity_kg: branch.sold_quantity_kg,
        bought_quantity_kg: branch.bought_quantity_kg,
        sell_orders_count: branch.sell_orders_count,
        buy_orders_count: branch.buy_orders_count
    }));

    return {
        ...baseResponse,
        dealer_distributions: dealerAllocations,
        branch_distributions: branchAllocations
    };
};

export default {
    getInventory
}