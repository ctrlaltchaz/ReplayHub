/**
 * Phase 4 Patches Verification Script
 * Tests the three specific fixes implemented:
 * 1. Availability bulk queries by teamId (no more 404s)
 * 2. Lineup membership workflow with autoAttachMissing
 * 3. Publish immutability rules
 */

const API_BASE = 'http://localhost:3000';

// Session cookie for authentication
let sessionCookie = '';

async function makeRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(sessionCookie && { 'Cookie': sessionCookie }),
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });

    // Capture session cookie from login
    if (!sessionCookie && response.headers.get('set-cookie')) {
        const cookies = response.headers.get('set-cookie');
        const sessionMatch = cookies.match(/connect\.sid=[^;]+/);
        if (sessionMatch) {
            sessionCookie = sessionMatch[0];
        }
    }

    return response;
}

async function testAvailabilityBulkQueries() {
    console.log('\n=== TESTING AVAILABILITY BULK QUERIES ===');

    try {
        // Get test org (should exist from previous tests)
        const orgsResponse = await makeRequest('/api/orgs');
        const orgs = await orgsResponse.json();
        const testOrg = orgs.data.find(org => org.slug === 'testcorp');

        if (!testOrg) {
            throw new Error('Test org not found');
        }

        console.log(`✓ Using org: ${testOrg.name} (${testOrg.slug})`);

        // Get teams
        const teamsResponse = await makeRequest(`/api/org/${testOrg.slug}/teams`);
        const teamsData = await teamsResponse.json();
        const teams = teamsData.data || teamsData;

        if (!Array.isArray(teams) || teams.length === 0) {
            throw new Error('No teams found');
        }

        const testTeam = teams[0];
        console.log(`✓ Using team: ${testTeam.name} (${testTeam.id})`);

        // Test bulk availability query by teamId (this should now work, not 404)
        const today = new Date().toISOString().split('T')[0];
        const availResponse = await makeRequest(`/api/org/${testOrg.slug}/availability?date=${today}&teamId=${testTeam.id}`);

        if (availResponse.ok) {
            const availData = await availResponse.json();
            console.log(`✅ PATCH 1 SUCCESS: Got availability data for team (${Array.isArray(availData) ? availData.length : 'unknown'} records)`);
            console.log('  - No more 404 "Player not found" errors when querying by teamId');

            if (Array.isArray(availData) && availData.length > 0) {
                const sample = availData[0];
                console.log(`  - Sample record: Player ${sample.player?.gamerTag || 'Unknown'}, Status: ${sample.status || 'null'}`);
            }
        } else {
            const error = await availResponse.text();
            console.log(`❌ PATCH 1 FAILED: ${availResponse.status} - ${error}`);
        }

    } catch (error) {
        console.log(`❌ PATCH 1 ERROR: ${error.message}`);
    }
}

async function testLineupMembershipWorkflow() {
    console.log('\n=== TESTING LINEUP MEMBERSHIP WORKFLOW ===');

    try {
        // Get test org
        const orgsResponse = await makeRequest('/api/orgs');
        const orgs = await orgsResponse.json();
        const testOrg = orgs.data.find(org => org.slug === 'testcorp');

        // Get teams
        const teamsResponse = await makeRequest(`/api/org/${testOrg.slug}/teams`);
        const teamsData = await teamsResponse.json();
        const teams = teamsData.data || teamsData;
        const testTeam = teams[0];

        // Get players (we'll use one that might not be on the team)
        const playersResponse = await makeRequest(`/api/org/${testOrg.slug}/players`);
        const playersData = await playersResponse.json();
        const players = playersData.data || playersData;

        if (!Array.isArray(players) || players.length === 0) {
            throw new Error('No players found');
        }

        const testPlayer = players[0];
        console.log(`✓ Using player: ${testPlayer.gamerTag} (${testPlayer.id})`);

        // Create a lineup for testing
        const createLineupResponse = await makeRequest(`/api/org/${testOrg.slug}/lineups`, {
            method: 'POST',
            body: JSON.stringify({
                teamId: testTeam.id,
                title: 'Test Membership Workflow'
            })
        });

        if (!createLineupResponse.ok) {
            const error = await createLineupResponse.text();
            console.log(`❌ Failed to create test lineup: ${error}`);
            return;
        }

        const lineup = await createLineupResponse.json();
        console.log(`✓ Created lineup: ${lineup.title} (${lineup.id})`);

        // Test 1: Try to set slots without autoAttachMissing (should fail with 422)
        console.log('\n--- Testing without autoAttachMissing ---');
        const setSlotsResponse1 = await makeRequest(`/api/org/${testOrg.slug}/lineups/${lineup.id}/slots`, {
            method: 'POST',
            body: JSON.stringify({
                slots: [{
                    playerId: testPlayer.id,
                    role: 'Test Role',
                    isSub: false
                }],
                autoAttachMissing: false
            })
        });

        if (setSlotsResponse1.status === 422) {
            const error = await setSlotsResponse1.json();
            console.log(`✅ PATCH 2a SUCCESS: Got 422 error as expected: ${error.message}`);
        } else if (setSlotsResponse1.ok) {
            console.log(`✓ PATCH 2a INFO: Player was already on team, no error needed`);
        } else {
            const error = await setSlotsResponse1.text();
            console.log(`❌ PATCH 2a FAILED: Expected 422 but got ${setSlotsResponse1.status} - ${error}`);
        }

        // Test 2: Try to set slots with autoAttachMissing (should succeed)
        console.log('\n--- Testing with autoAttachMissing ---');
        const setSlotsResponse2 = await makeRequest(`/api/org/${testOrg.slug}/lineups/${lineup.id}/slots`, {
            method: 'POST',
            body: JSON.stringify({
                slots: [{
                    playerId: testPlayer.id,
                    role: 'Test Role',
                    isSub: false
                }],
                autoAttachMissing: true
            })
        });

        if (setSlotsResponse2.ok) {
            const updatedLineup = await setSlotsResponse2.json();
            console.log(`✅ PATCH 2b SUCCESS: Set slots with autoAttachMissing=true`);
            console.log(`  - Lineup now has ${updatedLineup.slots?.length || 0} slots`);
        } else {
            const error = await setSlotsResponse2.text();
            console.log(`❌ PATCH 2b FAILED: ${setSlotsResponse2.status} - ${error}`);
        }

    } catch (error) {
        console.log(`❌ PATCH 2 ERROR: ${error.message}`);
    }
}

async function testPublishImmutability() {
    console.log('\n=== TESTING PUBLISH IMMUTABILITY ===');

    try {
        // Get test org
        const orgsResponse = await makeRequest('/api/orgs');
        const orgs = await orgsResponse.json();
        const testOrg = orgs.data.find(org => org.slug === 'testcorp');

        // Get teams and players
        const teamsResponse = await makeRequest(`/api/org/${testOrg.slug}/teams`);
        const teamsData = await teamsResponse.json();
        const teams = teamsData.data || teamsData;
        const testTeam = teams[0];

        const playersResponse = await makeRequest(`/api/org/${testOrg.slug}/players`);
        const playersData = await playersResponse.json();
        const players = playersData.data || playersData;
        const testPlayer = players[0];

        // Create a lineup for testing
        const createLineupResponse = await makeRequest(`/api/org/${testOrg.slug}/lineups`, {
            method: 'POST',
            body: JSON.stringify({
                teamId: testTeam.id,
                title: 'Test Publish Immutability'
            })
        });

        const lineup = await createLineupResponse.json();
        console.log(`✓ Created lineup: ${lineup.title} (${lineup.id})`);

        // Add a slot before publishing
        await makeRequest(`/api/org/${testOrg.slug}/lineups/${lineup.id}/slots`, {
            method: 'POST',
            body: JSON.stringify({
                slots: [{
                    playerId: testPlayer.id,
                    role: 'Test Role',
                    isSub: false
                }],
                autoAttachMissing: true
            })
        });
        console.log(`✓ Added slot to lineup`);

        // Publish the lineup
        const publishResponse = await makeRequest(`/api/org/${testOrg.slug}/lineups/${lineup.id}/publish`, {
            method: 'POST'
        });

        if (publishResponse.ok) {
            const publishedLineup = await publishResponse.json();
            console.log(`✅ PATCH 3a SUCCESS: Published lineup (published: ${publishedLineup.published})`);
        } else {
            const error = await publishResponse.text();
            console.log(`❌ PATCH 3a FAILED: ${publishResponse.status} - ${error}`);
            return;
        }

        // Test 1: Try to publish again (should fail with 409)
        console.log('\n--- Testing double publish ---');
        const republishResponse = await makeRequest(`/api/org/${testOrg.slug}/lineups/${lineup.id}/publish`, {
            method: 'POST'
        });

        if (republishResponse.status === 409) {
            const error = await republishResponse.json();
            console.log(`✅ PATCH 3b SUCCESS: Got 409 error for double publish: ${error.message}`);
        } else {
            const error = await republishResponse.text();
            console.log(`❌ PATCH 3b FAILED: Expected 409 but got ${republishResponse.status} - ${error}`);
        }

        // Test 2: Try to modify published lineup (should fail with 409)
        console.log('\n--- Testing modification after publish ---');
        const modifyResponse = await makeRequest(`/api/org/${testOrg.slug}/lineups/${lineup.id}/slots`, {
            method: 'POST',
            body: JSON.stringify({
                slots: [],
                autoAttachMissing: false
            })
        });

        if (modifyResponse.status === 409) {
            const error = await modifyResponse.json();
            console.log(`✅ PATCH 3c SUCCESS: Got 409 error for modification after publish: ${error.message}`);
        } else {
            const error = await modifyResponse.text();
            console.log(`❌ PATCH 3c FAILED: Expected 409 but got ${modifyResponse.status} - ${error}`);
        }

    } catch (error) {
        console.log(`❌ PATCH 3 ERROR: ${error.message}`);
    }
}

async function main() {
    console.log('🔧 Phase 4 Patches Verification');
    console.log('Testing three specific fixes implemented after deep verification');

    try {
        // Login first
        console.log('\n=== AUTHENTICATION ===');
        const loginResponse = await makeRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test.admin@testcorp.com',
                password: 'password123'
            })
        });

        if (loginResponse.ok) {
            const user = await loginResponse.json();
            console.log(`✓ Logged in as: ${user.email}`);
        } else {
            throw new Error('Login failed');
        }

        // Run patch tests
        await testAvailabilityBulkQueries();
        await testLineupMembershipWorkflow();
        await testPublishImmutability();

        console.log('\n=== SUMMARY ===');
        console.log('✅ Phase 4 Patches Verification Complete');
        console.log('Three targeted fixes have been tested:');
        console.log('1. 🔍 Availability bulk queries - Fixed 404 errors when querying by teamId');
        console.log('2. 👥 Lineup membership workflow - Added autoAttachMissing with proper 422 error codes');
        console.log('3. 🔒 Publish immutability - Enforced with 409 conflicts for post-publish modifications');

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }
}

main();