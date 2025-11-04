const axios = require('axios');

async function debugPatches() {
    console.log('🔍 Debugging Phase 4 Patches');

    // Create axios instance with session support
    const client = axios.create({
        baseURL: 'http://localhost:3001',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    try {
        // Login
        const loginResponse = await client.post('/api/org/testorg/auth/login', {
            email: 'admin@testorg.com',
            password: 'TestPassword123!'
        });

        console.log('✅ Login successful');

        const cookies = loginResponse.headers['set-cookie'];
        if (cookies) {
            client.defaults.headers.Cookie = cookies.join('; ');
        }

        // Create team
        const teamResponse = await client.post('/api/org/testorg/teams', {
            name: 'Debug Team',
            game: 'Overwatch 2',
            season: 'Fall 2024'
        });
        const teamId = teamResponse.data.id;
        console.log('✅ Team created:', teamId);

        // Create player
        const playerResponse = await client.post('/api/org/testorg/players', {
            gamerTag: 'DebugPlayer',
            role: 'Tank'
        });
        const playerId = playerResponse.data.id;
        console.log('✅ Player created:', playerId);

        // Add player to team
        await client.post(`/api/org/testorg/teams/${teamId}/members`, {
            playerId: playerId,
            isStarter: true
        });
        console.log('✅ Player added to team');

        console.log('\n=== TESTING AVAILABILITY ENDPOINT ===');

        // Test availability query - let's see the exact error
        try {
            console.log(`Testing: GET /api/org/testorg/players/availability?date=2024-03-15&teamId=${teamId}`);
            const availabilityResponse = await client.get('/api/org/testorg/players/availability', {
                params: {
                    date: '2024-03-15',
                    teamId: teamId
                }
            });

            console.log('✅ Availability query successful');
            console.log('Response data:', JSON.stringify(availabilityResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Availability query failed');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data);
        }

        console.log('\n=== TESTING LINEUP CREATION ===');

        // Try to create lineup - let's see the exact error
        try {
            console.log('Creating lineup...');
            const lineupResponse = await client.post('/api/org/testorg/lineups', {
                eventId: `debug-event-${Date.now()}`,
                teamId: teamId,
                title: 'Debug Lineup'
            });
            console.log('✅ Lineup created:', lineupResponse.data.id);

            // Test setting slots
            try {
                const slotsResponse = await client.post(`/api/org/testorg/lineups/${lineupResponse.data.id}/slots`, {
                    slots: [{
                        playerId: playerId,
                        role: 'Tank',
                        isSub: false,
                        idx: 0
                    }]
                });
                console.log('✅ Slots set successfully');

                // Test publish
                try {
                    await client.post(`/api/org/testorg/lineups/${lineupResponse.data.id}/publish`);
                    console.log('✅ Lineup published');

                    // Test immutability
                    try {
                        await client.post(`/api/org/testorg/lineups/${lineupResponse.data.id}/slots`, {
                            slots: []
                        });
                        console.log('❌ Could modify published lineup');
                    } catch (error) {
                        if (error.response?.status === 409) {
                            console.log('✅ 409 conflict when modifying published lineup');
                        } else {
                            console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data);
                        }
                    }
                } catch (error) {
                    console.log('❌ Publish failed:', error.response?.status, error.response?.data);
                }
            } catch (error) {
                console.log('❌ Setting slots failed:', error.response?.status, error.response?.data);
            }

        } catch (error) {
            console.log('❌ Lineup creation failed');
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data);
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

debugPatches();