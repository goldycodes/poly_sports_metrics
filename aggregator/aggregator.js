/**
 * aggregator.js
 * 
 * Responsible for fetching data from Polymarket endpoints and computing 
 * basic stats (e.g., # of active sports markets, volume, open interest).
 */

require('dotenv').config();

const axios = require('axios');
const { getSportsMarketIds } = require('./db');

async function computeStats() {
    console.log('Starting computeStats...');
    
    try {
        // Get market mappings from DB
        const sportsMarketMappings = await getSportsMarketIds();
        console.log(`Loaded ${sportsMarketMappings.size} sports market mappings from DB`);

        // Get markets from API
        const markets = await getMarkets();
        console.log(`Found ${markets.length} total markets from API`);

        // Filter active sports markets
        const activeMarkets = markets.filter(market => {
            const dbMarket = sportsMarketMappings.get(market.id);
            if (!dbMarket) return false;

            const now = new Date();
            const gameTime = dbMarket.gameStartTime ? new Date(dbMarket.gameStartTime) : null;
            const endTime = dbMarket.endDate ? new Date(dbMarket.endDate) : null;
            
            return (
                market.active &&
                dbMarket.status === 'ACTIVE' &&
                (gameTime > now || (endTime && endTime > now))
            );
        });

        console.log(`Found ${activeMarkets.length} active current sports markets`);
        return activeMarkets;

    } catch (error) {
        console.error('Error in computeStats:', error);
        return [];
    }
}

module.exports = { computeStats }; 