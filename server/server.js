/**
 * server.js
 * 
 * Express server that periodically runs aggregator logic 
 * and exposes a /stats endpoint with the results.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aggregator = require('../aggregator/aggregator');

const app = express();

// Enable CORS
app.use(cors());

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Basic stats endpoint
app.get('/stats', (req, res) => {
    res.json(aggregator.stats);
});

// Get markets by sport category
app.get('/markets/:sport', (req, res) => {
    const sport = req.params.sport.toUpperCase();
    const markets = aggregator.stats.markets.filter(market => {
        const title = market.title.toLowerCase();
        switch(sport) {
            case 'NBA': return title.includes('nba') || title.includes('basketball');
            case 'NFL': return title.includes('nfl') || title.includes('football');
            case 'MLB': return title.includes('mlb') || title.includes('baseball');
            case 'NHL': return title.includes('nhl') || title.includes('hockey');
            default: return false;
        }
    });
    res.json(markets);
});

// Get top markets by volume
app.get('/markets/top/volume', (req, res) => {
    const topMarkets = [...aggregator.stats.markets]
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 10);
    res.json(topMarkets);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        lastUpdate: aggregator.stats.lastUpdated,
        marketCount: aggregator.stats.sportsMarketCount
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 