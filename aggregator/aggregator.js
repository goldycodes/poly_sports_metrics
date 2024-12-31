/**
 * aggregator.js
 * 
 * Responsible for fetching data from Polymarket endpoints and computing 
 * basic stats (e.g., # of active sports markets, volume, open interest).
 */

require('dotenv').config();

const axios = require('axios');

// Constants for API endpoints
const POLYMARKET_API = process.env.POLYMARKET_API || 'https://clob.polymarket.com';

async function fetchActiveMarkets() {
    try {
        const response = await axios.get(`${POLYMARKET_API}/active-markets`);
        console.log('API Response Status:', response.status);
        
        // Handle the actual response structure from Polymarket
        const markets = response.data?.markets || [];
        console.log(`Fetched ${markets.length} markets`);
        
        return markets;
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data
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