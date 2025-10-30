// A mock conversion rate table, with USD as the base. In a real app, this would come from an API.
const MOCK_RATES: { [key: string]: number } = {
    "USD": 1,
    "EUR": 0.93,
    "JPY": 157.3,
    "GBP": 0.79,
    "AED": 3.67,
    "AUD": 1.5,
    "CAD": 1.37,
    "CHF": 0.9,
    "CNY": 7.24,
    "SEK": 10.48,
    "NZD": 1.63,
};

/**
 * Converts an amount from a source currency to a target currency using USD as a bridge.
 * @param amount The amount to convert.
 * @param fromCurrencyCode The source currency code (e.g., "USD").
 * @param toCurrencyCode The target currency code (e.g., "EUR").
 * @returns The converted amount or null if conversion is not possible.
 */
export const convertCurrency = (amount: number, fromCurrencyCode: string, toCurrencyCode: string): number | null => {
    // Coerce amount to a number to handle cases where a string might be passed at runtime from old data.
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
        return null;
    }

    if (fromCurrencyCode === toCurrencyCode) {
        return numericAmount;
    }
    
    const fromRate = MOCK_RATES[fromCurrencyCode];
    const toRate = MOCK_RATES[toCurrencyCode];

    if (fromRate === undefined || toRate === undefined) {
        // Cannot convert if we don't have the rate for either currency
        return null;
    }

    // Convert the original amount to USD first
    const amountInUsd = numericAmount / fromRate;
    // Then convert from USD to the target currency
    const convertedAmount = amountInUsd * toRate;

    return parseFloat(convertedAmount.toFixed(2));
};

/**
 * Extracts a currency code like "USD" from a full string like "United States Dollar (USD)".
 * @param currencyString The full currency name string.
 * @returns The 3-letter currency code or an empty string if not found.
 */
export const getCurrencyCode = (currencyString: string): string => {
    const match = currencyString.match(/\((.*?)\)/);
    return match ? match[1] : '';
};