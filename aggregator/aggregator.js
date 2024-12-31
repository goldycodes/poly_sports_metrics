/**
 * aggregator.js
 * 
 * Responsible for fetching data from Polymarket endpoints and computing 
 * basic stats (e.g., # of active sports markets, volume, open interest).
 */

require('dotenv').config();

const axios = require('axios');

async function computeStats() {
    try {
        console.log('Starting computeStats...');
        const response = await axios.get('https://clob.polymarket.com/markets');
        
        let allMarkets = [];
        if (response.data && typeof response.data === 'object') {
            if (Array.isArray(response.data.markets)) {
                allMarkets = response.data.markets;
            } else if (Array.isArray(response.data.data)) {
                allMarkets = response.data.data;
            } else if (Array.isArray(response.data)) {
                allMarkets = response.data;
            }
        }

        console.log('Total markets found:', allMarkets.length);

        // Filter sports markets using tags
        const sportsMarkets = allMarkets.filter(market => {
            // Primary check: Look for "sports" tag
            if (market.tags && Array.isArray(market.tags)) {
                const hasSportsTag = market.tags.includes('sports');
                
                // Debug logging
                if (hasSportsTag) {
                    console.log('Found sports market:', {
                        title: market.title || market.question,
                        tags: market.tags,
                        category: market.category
                    });
                }
                
                return hasSportsTag;
            }
            return false;
        });

        console.log(`Found ${sportsMarkets.length} sports markets`);

        // Apply date and active filters
        const now = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(now.getMonth() + 1);
        
        const activeRecentMarkets = sportsMarkets.filter(market => {
            const endDate = new Date(market.endTime || market.resolutionTime);
            const isActive = market.status === 'ACTIVE' || market.active === true;
            const endsWithinMonth = endDate <= oneMonthFromNow;
            const hasntEnded = endDate >= now;

            return isActive && endsWithinMonth && hasntEnded;
        });

        console.log(`Found ${activeRecentMarkets.length} active sports markets ending within a month`);

        // Sort markets by end date
        activeRecentMarkets.sort((a, b) => {
            const dateA = new Date(a.endTime || a.resolutionTime);
            const dateB = new Date(b.endTime || b.resolutionTime);
            return dateA - dateB;
        });

        const stats = {
            sportsMarketCount: activeRecentMarkets.length,
            volume24h: 0,
            openInterest: 0,
            lastUpdated: new Date().toISOString(),
            markets: activeRecentMarkets.map(market => ({
                id: market.marketId || market.id,
                title: market.title || market.question,
                description: market.description || market.metadata?.description,
                volume24h: parseFloat(market.volume24Hr || market.volume24h || 0),
                startTime: market.startTime || market.gameStartTime,
                endTime: market.endTime || market.resolutionTime,
                active: market.status === 'ACTIVE' || market.active === true,
                url: `https://polymarket.com/event/${market.slug || market.id}`,
                tags: market.tags || [],
                category: market.category || 'Unknown'
            }))
        };

        stats.volume24h = stats.markets.reduce((sum, market) => 
            sum + (market.volume24h || 0), 0);

        return stats;

    } catch (error) {
        console.error('Error in computeStats:', error);
        return {
            sportsMarketCount: 0,
            volume24h: 0,
            openInterest: 0,
            lastUpdated: new Date().toISOString(),
            markets: []
        };
    }
}

module.exports = { computeStats }; 