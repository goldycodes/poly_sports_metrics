/**
 * aggregator.js
 * 
 * Responsible for fetching data from Polymarket endpoints and computing 
 * basic stats (e.g., # of active sports markets, volume, open interest).
 */

require('dotenv').config();

const axios = require('axios');

const ENDPOINTS = {
    clob: process.env.CLOB_API
};

// Helper function to identify sports markets
function isSportsMarket(market) {
    const sportsKeywords = [
        'nba', 'nfl', 'mlb', 'nhl', 'soccer', 'football', 
        'basketball', 'baseball', 'hockey', 'tennis',
        'vs', 'game', 'match'
    ];
    
    return market.question && sportsKeywords.some(keyword => 
        market.question.toLowerCase().includes(keyword)
    );
}

async function computeStats() {
    try {
        // Fetch markets from CLOB API
        const response = await axios.get(ENDPOINTS.clob);
        
        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid API response format');
        }

        // Filter sports markets
        const sportsMarkets = response.data.filter(isSportsMarket);

        // Compute statistics
        const stats = {
            sportsMarketCount: sportsMarkets.length,
            volume24h: 0,
            openInterest: 0,
            lastUpdated: new Date().toISOString(),
            markets: []
        };

        // Process each market
        stats.markets = sportsMarkets.map(market => {
            // Calculate market metrics from tokens
            const tokens = market.tokens || [];
            const volume = tokens.reduce((sum, token) => sum + (parseFloat(token.price) || 0), 0);
            
            return {
                id: market.condition_id,
                title: market.question,
                description: market.description,
                volume24h: volume,
                startTime: market.game_start_time,
                endDate: market.end_date_iso,
                active: market.active,
                tokens: tokens.map(token => ({
                    outcome: token.outcome,
                    price: token.price,
                    winner: token.winner
                }))
            };
        });

        // Calculate totals
        stats.markets.forEach(market => {
            stats.volume24h += market.volume24h;
        });

        return stats;

    } catch (error) {
        console.error('[Aggregator] Error:', error.message);
        return {
            error: error.message,
            sportsMarketCount: 0,
            volume24h: 0,
            openInterest: 0,
            lastUpdated: new Date().toISOString(),
            markets: []
        };
    }
}

module.exports = { computeStats }; 