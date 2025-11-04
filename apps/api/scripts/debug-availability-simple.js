const axios = require('axios');

async function debugAvailabilityEndpoint() {
    const client = axios.create({
        baseURL: 'http://localhost:3001',
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
    });

    try {
        console.log('🔍 Debugging availability endpoint...');

        // Login
        const loginResponse = await client.post('/api/org/testorg/auth/login', {
            email: 'admin@testorg.com',
            password: 'TestPassword123!'
        });

        const cookies = loginResponse.headers['set-cookie'];
        if (cookies) {
            client.defaults.headers.Cookie = cookies.map(c => c.split(';')[0]).join('; ');
        }
        console.log('✅ Logged in');

        // Use an existing team from previous test
        const teamId = 'cmgijk0lu0001vrusnujqqkus';
        console.log('🔍 Using teamId:', teamId);

        // Try the availability call with minimal params
        console.log('🔍 Testing availability call...');

        try {
            const response = await client.get('/api/org/testorg/players/availability', {
                params: { date: '2025-10-20' }  // No teamId first
            });

            console.log('✅ General availability call worked!');
            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ General availability call failed');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data);
            console.log('Headers:', error.response?.headers);
        }

        // Now try with teamId
        try {
            const response = await client.get('/api/org/testorg/players/availability', {
                params: {
                    date: '2025-10-20',
                    teamId: teamId
                }
            });

            console.log('✅ Team availability call worked!');
            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log('❌ Team availability call failed');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data);
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugAvailabilityEndpoint();