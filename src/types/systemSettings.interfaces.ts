interface Scripts {
    script_name: string,
    script_variance: number
}

export interface SystemSettingsPayload {
    daily_distribution_limit: number,
    price_lock_duration: number,
    tax_amount: number,
    scripts: Scripts[],
    instrument_token?: number,
}