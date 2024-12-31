const axios = require('axios');

const TEST_URL = 'https://clob.polymarket.com/markets';

async function testConnection() {
    try {
        console.log('Testing connection to Polymarket API...');
        const response = await axios.get(TEST_URL);
        console.log('Connection successful!');
        console.log('Raw response:', JSON.stringify(response.data, null, 2));
        
        // Debug logging
        console.log('\nResponse type:', typeof response.data);
        console.log('Response keys:', Object.keys(response.data));
    } catch (error) {
        console.error('Connection failed:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testConnection(); 