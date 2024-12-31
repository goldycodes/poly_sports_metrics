/**
 * server.js
 * 
 * Express server that periodically runs aggregator logic 
 * and exposes a /stats endpoint with the results.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { computeStats } = require('../aggregator/aggregator');

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

// In-memory cache of stats
let dashboardStats = {
    sportsMarketCount: 0,
    volume24h: 0,
    openInterest: 0,
    lastUpdated: null,
    markets: []
};

// Basic routes
app.get('/stats', (req, res) => {
    res.json(dashboardStats);
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', lastUpdate: dashboardStats.lastUpdated });
});

// Function to periodically update the stats
async function updateStats() {
    try {
        const newStats = await computeStats();
        dashboardStats = newStats;
        console.log('[Aggregator] Stats updated:', {
            marketCount: dashboardStats.sportsMarketCount,
            volume24h: dashboardStats.volume24h,
            timestamp: dashboardStats.lastUpdated
        });
    } catch (err) {
        console.error('[Aggregator Error]', err);
    }
}

// Schedule updates every 5 minutes
const UPDATE_INTERVAL = process.env.UPDATE_INTERVAL || 5 * 60 * 1000;
setInterval(updateStats, UPDATE_INTERVAL);

// Initial update on startup
updateStats();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
}); 