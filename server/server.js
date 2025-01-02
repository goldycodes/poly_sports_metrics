/**
 * server.js
 * 
 * Express server that periodically runs aggregator logic 
 * and exposes a /stats endpoint with the results.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { computeStats } = require('../aggregator/aggregator');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Comprehensive security headers
app.use((req, res, next) => {
    // CSP that allows both Gamma and CLOB endpoints
    res.setHeader(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net",
            "connect-src 'self' clob.polymarket.com gamma-api.polymarket.com",
            "img-src 'self' data: cdn.jsdelivr.net",
            "font-src 'self' cdn.jsdelivr.net",
        ].join('; ')
    );

    // Additional security headers
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    next();
});

// Cache for stats
let statsCache = {
    data: null,
    lastUpdated: null
};

// Stats endpoint with caching
app.get('/stats', async (req, res) => {
    try {
        // Check cache (5 minute expiry)
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes

        if (statsCache.data && statsCache.lastUpdated && 
            (now - statsCache.lastUpdated) < cacheExpiry) {
            return res.json(statsCache.data);
        }

        // Fetch fresh data
        console.log('Fetching fresh stats...');
        const stats = await computeStats();
        
        // Update cache
        statsCache = {
            data: stats,
            lastUpdated: now
        };

        res.json(stats);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Failed to fetch stats',
            message: error.message
        });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await computeStats();
        res.json(stats);
    } catch (error) {
        console.error('Error computing stats:', error);
        res.status(500).json({ error: 'Failed to compute stats' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 