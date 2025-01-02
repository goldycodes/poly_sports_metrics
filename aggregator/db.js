const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgres://gamma_ro:mQm3WNCWg3U6cVLCnxbrtCnV@gamma.chnyl0kubnia.eu-west-2.rds.amazonaws.com:5432/markets',
    ssl: false
});

async function getSportsMarketIds() {
    try {
        const { rows } = await pool.query(`
            SELECT 
                m.id,
                m.condition_id,
                m.tags,
                m.category,
                m.title,
                m.status,
                m.end_date,
                m.start_date,
                m.game_start_time
            FROM markets m
            WHERE m.tags @> '["sports"]'::jsonb
            AND m.status = 'ACTIVE'
            AND (m.game_start_time > NOW() OR m.end_date > NOW())
            ORDER BY COALESCE(m.game_start_time, m.end_date) ASC
        `);

        const sportsMarketMappings = new Map();
        
        for (const row of rows) {
            const marketData = {
                id: row.condition_id,
                title: row.title,
                status: row.status,
                endDate: row.end_date,
                startDate: row.start_date,
                gameStartTime: row.game_start_time
            };

            if (row.id) sportsMarketMappings.set(row.id, marketData);
            if (row.condition_id) sportsMarketMappings.set(row.condition_id, marketData);
        }

        return sportsMarketMappings;
    } catch (error) {
        console.error('Database error:', error);
        return new Map(); // Return empty map instead of throwing
    }
}

module.exports = {
    getSportsMarketIds,
    pool
}; 