

/**
 * This file contains functions for trading on the Coinbase Pro API.
 * It includes functions for fetching accounts and making trades.
 */

const axios = require('axios');
const crypto = require('crypto');

const apiKey = 'YOUR_API_KEY';
const apiSecret = 'YOUR_API_SECRET';
const passphrase = 'YOUR_API_PASSPHRASE';

const apiURL = 'https://api.pro.coinbase.com';

/**
 * Signs a message using the API secret.
 * @param {string} method - The HTTP method of the request.
 * @param {string} path - The API path of the request.
 * @param {string} body - The request body.
 * @param {number} timestamp - The timestamp of the request.
 * @returns {string} The signature of the message.
 */
function signMessage(method, path, body, timestamp) {
    const message = timestamp + method + path + body;
    const key = Buffer.from(apiSecret, 'base64');
    const hmac = crypto.createHmac('sha256', key);
    const signature = hmac.update(message).digest('base64');
    return signature;
}

/**
 * Fetches the accounts associated with the API key.
 * @returns {Promise<Object[]|null>} A promise that resolves to an array of account objects, or null if there was an error.
 */
async function getAccounts() {
    const method = 'GET';
    const path = '/accounts';
    const body = '';
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signMessage(method, path, body, timestamp);

    const headers = {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-ACCESS-PASSPHRASE': passphrase,
    };

    try {
        const response = await axios.get(apiURL + path, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return null;
    }
}

/**
 * Trades all available balance of a specified currency pair.
 * @param {string} pair - The currency pair to trade (e.g. 'BTC-USD').
 * @param {string} side - The side of the trade ('buy' or 'sell').
 * @returns {Promise<Object|null>} A promise that resolves to the trade response data, or null if there was an error.
 */
async function tradeAll(pair, side) {
    const accounts = await getAccounts();
    if (!accounts) return;

    const baseCurrency = pair.split('-')[0]; // BTC if BTC-USD
    const account = accounts.find(acc => acc.currency === baseCurrency);
    if (!account) {
        console.error('No account with specified currency found');
        return;
    }

    const size = account.balance; // Amount of base currency

    const method = 'POST';
    const path = '/orders';
    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
        type: 'market',
        side: side,
        product_id: pair,
        size: size,
    });

    const signature = signMessage(method, path, body, timestamp);

    const headers = {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-ACCESS-PASSPHRASE': passphrase,
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.post(apiURL + path, body, { headers });
        return response.data;
    } catch (error) {
        console.error('Error in making trade:', error);
        return null;
    }
}

// Example usage to trade all BTC to USD
tradeAll('BTC-USD', 'sell')
    .then(data => console.log(data))
    .catch(error => console.log(error));
