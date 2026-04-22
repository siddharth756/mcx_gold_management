export const priceGenerator = () => {
    return {
        gold: Number((60000 + Math.random() * 5000).toFixed(2)),
        silver: Number((700 + Math.random() * 20).toFixed(2))
    }
}