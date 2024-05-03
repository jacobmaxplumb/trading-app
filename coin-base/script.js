/**
 * This file contains functions for retrieving candlestick data from the Coinbase API,
 * processing the data, and performing trading operations.
 */

const axios = require('axios');

/**
 * Retrieves candlestick data from the Coinbase API.
 * @returns {Promise<Array<Object>>} The cleaned candlestick data.
 */
async function getCandlestickData() {
    try {
        const candlestickResponse = await axios.get(`https://api.exchange.coinbase.com/products/BTC-USD/candles`);
        const candlestickData = candlestickResponse.data;
        const cleanedData = candlestickData.map(data => ({
            time: new Date(data[0] * 1000).toLocaleString(),
            low: data[1],
            high: data[2],
            open: data[3],
            close: data[4],
            volume: data[5],
        }))
        return cleanedData;
    } catch (error) {
        console.error('Error retrieving candlestick data:', error);
    }
}

/**
 * Processes the candlestick data by calculating the RSI for each data point.
 * @param {Array<Object>} candlestickData - The candlestick data.
 * @returns {Array<Object>} The processed data with RSI values.
 */
function processData(candlestickData) {
    return candlestickData.map(data => ({
        ...data,
        rsi: calculateRSI(candlestickData),
    }))
}

/**
 * Calculates the fast moving average (MA) for the given candlestick data.
 * @param {Array<Object>} candlestickData - The candlestick data.
 * @returns {number} The fast MA value.
 */
function calculateFastMA(candlestickData) {
    const closePrices = candlestickData.map(data => data.close);
    const sum = closePrices.reduce((total, price) => total + price, 0);
    const average = sum / closePrices.length;
    const mediumMA = average;
    return mediumMA;
}

/**
 * Calculates the slow moving average (MA) for the given candlestick data.
 * @param {Array<Object>} candlestickData - The candlestick data.
 * @returns {number} The slow MA value.
 */
function calculateSlowMA(candlestickData) {
    const closePrices = candlestickData.map(data => data.close);
    const sum = closePrices.reduce((total, price) => total + price, 0);
    const average = sum / closePrices.length;
    const slowMA = average;
    return slowMA;
}

/**
 * Calculates the RSI (Relative Strength Index) for the given candlestick data.
 * @param {Array<Object>} candlestickData - The candlestick data.
 * @returns {number} The RSI value.
 */
function calculateRSI(candlestickData) {
    const closePrices = candlestickData.map(data => data.close);
    const gains = [];
    const losses = [];

    for (let i = 1; i < closePrices.length; i++) {
        const priceDiff = closePrices[i] - closePrices[i - 1];
        if (priceDiff > 0) {
            gains.push(priceDiff);
            losses.push(0);
        } else if (priceDiff < 0) {
            gains.push(0);
            losses.push(Math.abs(priceDiff));
        } else {
            gains.push(0);
            losses.push(0);
        }
    }

    const averageGain = calculateAverage(gains);
    const averageLoss = calculateAverage(losses);

    const relativeStrength = averageGain / averageLoss;
    const rsi = 100 - (100 / (1 + relativeStrength));

    return rsi;
}

/**
 * Calculates the average of the given values.
 * @param {Array<number>} values - The values to calculate the average of.
 * @returns {number} The average value.
 */
function calculateAverage(values) {
    const sum = values.reduce((total, value) => total + value, 0);
    return sum / values.length;
}