/**
 * aggregator.js
 * 
 * Responsible for fetching data from Polymarket endpoints and computing 
 * basic stats (e.g., # of active sports markets, volume, open interest).
 */

require('dotenv').config();

const axios = require('axios');

// Update the API endpoint constants
const BASE_API = 'https://gamma-api.polymarket.com/query';  // Changed to gamma API
const ENDPOINTS = {
    markets: `${BASE_API}/list-markets`,  // Updated endpoint
    activeMarkets: `${BASE_API}/list-markets?market_status=Active`  // Updated with correct query param
};

async function fetchActiveMarkets() {
    try {
        // Add debug logging
        console.log('Starting market fetch...');
        
        const response = await axios.get(ENDPOINTS.activeMarkets);
        
        // Log the response
        console.log('API Response:', {
            status: response.status,
            dataReceived: !!response.data,
            marketCount: response.data?.length || 0
        });

        if (!response.data) {
            throw new Error('No data received from API');
        }

        // Log successful markets
        console.log(`Successfully fetched ${response.data.length} markets`);
        return response.data;

    } catch (error) {
        // Detailed error logging
        console.error('Market fetch error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        return [];
    }
}

// Helper function to identify sports markets
function isSportsMarket(market) {
    const sportKeywords = ['nba', 'nfl', 'mlb', 'soccer', 'football', 'basketball', 'baseball'];
    const title = market.title?.toLowerCase() || '';
    
    return sportKeywords.some(keyword => title.includes(keyword));
}

async function computeStats() {
    // 1. Fetch active markets
    const activeMarkets = await fetchActiveMarkets();
    
    console.log('Active Markets type:', typeof activeMarkets, 'isArray:', Array.isArray(activeMarkets));
    
    // 2. Filter for sports markets
    const sportsMarkets = activeMarkets.filter(isSportsMarket);
    
    // 3. Compute basic stats
    const marketCount = sportsMarkets.length;
    const volume24h = sportsMarkets.reduce((sum, market) => sum + (market.volume24h || 0), 0);
    const openInterest = sportsMarkets.reduce((sum, market) => sum + (market.openInterest || 0), 0);
    
    return {
        sportsMarketCount: marketCount,
        volume24h,
        openInterest,
        lastUpdated: new Date().toISOString(),
        markets: sportsMarkets.map(market => ({
            id: market.id,
            title: market.title,
            volume24h: market.volume24h || 0,
            openInterest: market.openInterest || 0
        }))
    };
}

module.exports = { computeStats }; 