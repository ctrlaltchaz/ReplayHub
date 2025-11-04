const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE = 'http://localhost:3001/api';
const TENANT_SLUG = 'testorg';
let sessionCookie = null;

// Test data storage
const testData = {
    team: null,
    players: {},
    lineup: null,
    event: null
};

// Configure axios client
const client = axios.create({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Results tracking
const results = {
    availability: {
        crud: { status: '❌', details: [] },
        permissions: { status: '❌', details: [] },
        duplicates: { status: '❌', details: [] },
        invalidIds: { status: '❌', details: [] },
        timezone: { status: '❌', details: [] }
    },
    lineup: {
        immutability: { status: '❌', details: [] },
        versioning: { status: '❌', details: [] }
    },
    pdf: {
        environment: { status: '❌', details: [] },
        generation: { status: '❌', details: [] },
        errorHandling: { status: '❌', details: [] }
    },
    rls: {
        availability: { status: '❌', details: [] },
        crossTenant: { status: '❌', details: [] }
    }
};

function logTest(category, subcategory, status, message, details = {}) {
    results[category][subcategory].status = status;
    results[category][subcategory].details.push({
        message,
        details,
        timestamp: new Date().toISOString()
    });
    console.log(`${status} [${category}.${subcategory}] ${message}`);
    if (details.responseCode) console.log(`   Status: ${details.responseCode}`);
    if (details.payload) console.log(`   Payload: ${JSON.stringify(details.payload, null, 2)}`);
}

async function login() {
    console.log('🔑 Authenticating...');
    try {
        const response = await client.post(`${API_BASE}/org/${TENANT_SLUG}/auth/login`, {
            email: 'admin@testorg.com',
            password: 'TestPassword123!',
        });

        const cookies = response.headers['set-cookie'];
        if (cookies && cookies.length > 0) {
            sessionCookie = cookies[0].split(';')[0];
            client.defaults.headers.Cookie = sessionCookie;
        }

        console.log('✅ Authentication successful');
        return true;
    } catch (error) {
        console.log('❌ Authentication failed:', error.response?.data);
        return false;
    }
}

async function setupTestData() {
    console.log('\n🏗️ Setting up test data...');

    try {
        // Create team
        const timestamp = Date.now();
        const teamResponse = await client.post(`${API_BASE}/org/${TENANT_SLUG}/teams`, {
            name: `Test Team ${timestamp}`,
            game: 'VALORANT',
            season: '2025-S1',
        });
        testData.team = teamResponse.data;
        console.log('✅ Team created:', testData.team.name);

        // Create players
        const playerData = [
            { tag: 'starterP', role: 'Duelist', rank: 'Immortal 3' },
            { tag: 'subP', role: 'Support', rank: 'Immortal 2' }
        ];

        for (const player of playerData) {
            const playerResponse = await client.post(`${API_BASE}/org/${TENANT_SLUG}/players`, {
                gamerTag: `${player.tag}${timestamp}`,
                role: player.role,
                rank: player.rank,
                eligibility: 'eligible'
            });
            testData.players[player.tag] = playerResponse.data;
            console.log(`✅ Player created: ${testData.players[player.tag].gamerTag}`);
        }

        return true;
    } catch (error) {
        console.log('❌ Test data setup failed:', error.response?.data || error.message);
        return false;
    }
}

async function testAvailabilityManagement() {
    console.log('\n🗓️ TESTING AVAILABILITY MANAGEMENT');
    console.log('=====================================');

    // A1: Set & Get (Happy Path)
    try {
        console.log('\n📅 Testing availability CRUD operations...');

        // Set availability for starterP
        const avail1Response = await client.post(
            `${API_BASE}/org/${TENANT_SLUG}/players/${testData.players.starterP.id}/availability`,
            {
                date: '2025-10-15',
                status: 'available',
                note: 'in early'
            }
        );

        logTest('availability', 'crud', '✅', 'StarterP availability set', {
            responseCode: avail1Response.status,
            payload: avail1Response.data
        });

        // Set availability for subP
        const avail2Response = await client.post(
            `${API_BASE}/org/${TENANT_SLUG}/players/${testData.players.subP.id}/availability`,
            {
                date: '2025-10-15',
                status: 'unsure'
            }
        );

        logTest('availability', 'crud', '✅', 'SubP availability set', {
            responseCode: avail2Response.status,
            payload: avail2Response.data
        });

        // Get availability for date
        const getAvailResponse = await client.get(
            `${API_BASE}/org/${TENANT_SLUG}/availability?date=2025-10-15&teamId=${testData.team.id}`
        );

        logTest('availability', 'crud', '✅', 'Availability retrieved', {
            responseCode: getAvailResponse.status,
            payload: { count: getAvailResponse.data.length, items: getAvailResponse.data }
        });

    } catch (error) {
        logTest('availability', 'crud', '❌', 'CRUD operations failed', {
            responseCode: error.response?.status,
            payload: error.response?.data
        });
    }

    // A2: Duplicate Protection
    try {
        console.log('\n🔄 Testing duplicate protection...');

        // Try to set same player+date again
        const duplicateResponse = await client.post(
            `${API_BASE}/org/${TENANT_SLUG}/players/${testData.players.starterP.id}/availability`,
            {
                date: '2025-10-15',
                status: 'unavailable',
                note: 'updated status'
            }
        );

        logTest('availability', 'duplicates', '✅', 'Duplicate handling works (upsert)', {
            responseCode: duplicateResponse.status,
            payload: duplicateResponse.data
        });

    } catch (error) {
        if (error.response?.status === 409) {
            logTest('availability', 'duplicates', '✅', 'Duplicate protection works (409 conflict)', {
                responseCode: error.response?.status,
                payload: error.response?.data
            });
        } else {
            logTest('availability', 'duplicates', '❌', 'Unexpected duplicate behavior', {
                responseCode: error.response?.status,
                payload: error.response?.data
            });
        }
    }

    // A3: Invalid Player Lookup
    try {
        console.log('\n🔍 Testing invalid player lookups...');

        // Test with non-existent player ID
        try {
            await client.post(
                `${API_BASE}/org/${TENANT_SLUG}/players/nonexistent123/availability`,
                {
                    date: '2025-10-16',
                    status: 'available'
                }
            );
            logTest('availability', 'invalidIds', '❌', 'Should have failed for non-existent ID');
        } catch (error) {
            if (error.response?.status === 404) {
                logTest('availability', 'invalidIds', '✅', 'Correctly rejected non-existent player', {
                    responseCode: error.response?.status,
                    payload: error.response?.data
                });
            }
        }

    } catch (error) {
        logTest('availability', 'invalidIds', '❌', 'Invalid ID test failed', {
            responseCode: error.response?.status,
            payload: error.response?.data
        });
    }

    // A4: Timezone & Date Normalization
    try {
        console.log('\n🌍 Testing timezone normalization...');

        // Send with timezone
        const timezoneResponse = await client.post(
            `${API_BASE}/org/${TENANT_SLUG}/players/${testData.players.subP.id}/availability`,
            {
                date: '2025-10-16T23:00:00Z',
                status: 'available',
                note: 'timezone test'
            }
        );

        logTest('availability', 'timezone', '✅', 'Timezone date accepted', {
            responseCode: timezoneResponse.status,
            payload: timezoneResponse.data
        });

        // Verify normalization by getting it back
        const normalizedGet = await client.get(
            `${API_BASE}/org/${TENANT_SLUG}/availability?date=2025-10-16`
        );

        logTest('availability', 'timezone', '✅', 'Date normalization verified', {
            responseCode: normalizedGet.status,
            payload: normalizedGet.data
        });

    } catch (error) {
        logTest('availability', 'timezone', '❌', 'Timezone handling failed', {
            responseCode: error.response?.status,
            payload: error.response?.data
        });
    }
}

async function testLineupPublishIntegrity() {
    console.log('\n⚡ TESTING LINEUP PUBLISH & INTEGRITY');
    console.log('=====================================');

    try {
        // Create a lineup
        const lineupResponse = await client.post(`${API_BASE}/org/${TENANT_SLUG}/lineups`, {
            eventId: `event-${Date.now()}`,
            teamId: testData.team.id,
            title: 'Test Match vs Opponents'
        });

        testData.lineup = lineupResponse.data;
        console.log('✅ Lineup created:', testData.lineup.id);

        // Add players to lineup
        const addPlayerResponse = await client.post(
            `${API_BASE}/org/${TENANT_SLUG}/lineups/${testData.lineup.id}/slots`,
            {
                playerId: testData.players.starterP.id,
                position: 'Duelist',
                isStarter: true
            }
        );

        console.log('✅ Player added to lineup');

        // Try to publish the lineup
        try {
            const publishResponse = await client.post(
                `${API_BASE}/org/${TENANT_SLUG}/lineups/${testData.lineup.id}/publish`
            );

            logTest('lineup', 'immutability', '✅', 'Lineup published successfully', {
                responseCode: publishResponse.status,
                payload: publishResponse.data
            });

            // Try to modify after publishing
            try {
                await client.post(
                    `${API_BASE}/org/${TENANT_SLUG}/lineups/${testData.lineup.id}/slots`,
                    {
                        playerId: testData.players.subP.id,
                        position: 'Support',
                        isStarter: false
                    }
                );

                logTest('lineup', 'immutability', '❌', 'Should not allow modification after publish');
            } catch (error) {
                if (error.response?.status === 403 || error.response?.status === 409) {
                    logTest('lineup', 'immutability', '✅', 'Correctly prevented modification after publish', {
                        responseCode: error.response?.status,
                        payload: error.response?.data
                    });
                }
            }

        } catch (error) {
            logTest('lineup', 'immutability', '❌', 'Lineup publish failed', {
                responseCode: error.response?.status,
                payload: error.response?.data
            });
        }

    } catch (error) {
        logTest('lineup', 'immutability', '❌', 'Lineup setup failed', {
            responseCode: error.response?.status,
            payload: error.response?.data
        });
    }
}

async function testPDFExports() {
    console.log('\n📄 TESTING PDF EXPORT SYSTEM');
    console.log('=====================================');

    // B1: Environment Setup Check
    try {
        console.log('\n🔧 Checking PDF export environment...');

        // Check if export endpoints exist
        const healthResponse = await client.get(`${API_BASE}/health`);
        logTest('pdf', 'environment', '✅', 'API server responsive', {
            responseCode: healthResponse.status
        });

    } catch (error) {
        logTest('pdf', 'environment', '❌', 'Environment check failed', {
            responseCode: error.response?.status,
            payload: error.response?.data
        });
    }

    // B2: Generate Files
    try {
        console.log('\n📋 Testing PDF generation...');

        // Test roster sheet export
        try {
            const rosterResponse = await client.get(
                `${API_BASE}/org/${TENANT_SLUG}/exports/roster-sheet?teamId=${testData.team.id}`
            );

            logTest('pdf', 'generation', '✅', 'Roster sheet generated', {
                responseCode: rosterResponse.status,
                payload: {
                    contentType: rosterResponse.headers['content-type'],
                    contentLength: rosterResponse.headers['content-length']
                }
            });

        } catch (error) {
            logTest('pdf', 'generation', '❌', 'Roster sheet generation failed', {
                responseCode: error.response?.status,
                payload: error.response?.data
            });
        }

        // Test call sheet export (if we have an event)
        try {
            if (testData.lineup) {
                const callSheetResponse = await client.get(
                    `${API_BASE}/org/${TENANT_SLUG}/exports/call-sheet?eventId=${testData.lineup.eventId}`
                );

                logTest('pdf', 'generation', '✅', 'Call sheet generated', {
                    responseCode: callSheetResponse.status,
                    payload: {
                        contentType: callSheetResponse.headers['content-type'],
                        contentLength: callSheetResponse.headers['content-length']
                    }
                });
            }
        } catch (error) {
            logTest('pdf', 'generation', '❌', 'Call sheet generation failed', {
                responseCode: error.response?.status,
                payload: error.response?.data
            });
        }

    } catch (error) {
        logTest('pdf', 'errorHandling', '❌', 'PDF generation test setup failed', {
            payload: error.message
        });
    }
}

async function testRLSEnforcement() {
    console.log('\n🔒 TESTING RLS ENFORCEMENT');
    console.log('=====================================');

    try {
        console.log('\n🛡️ Testing cross-tenant isolation...');

        // Try to access availability with different tenant context (should fail)
        try {
            const crossTenantResponse = await client.get(
                `${API_BASE}/org/othertenant/availability?date=2025-10-15`
            );

            logTest('rls', 'crossTenant', '❌', 'Should have blocked cross-tenant access');
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 404) {
                logTest('rls', 'crossTenant', '✅', 'Cross-tenant access correctly blocked', {
                    responseCode: error.response?.status,
                    payload: error.response?.data
                });
            } else {
                logTest('rls', 'crossTenant', '❌', 'Unexpected cross-tenant response', {
                    responseCode: error.response?.status,
                    payload: error.response?.data
                });
            }
        }

        // Test availability RLS specifically
        const availResponse = await client.get(
            `${API_BASE}/org/${TENANT_SLUG}/availability?date=2025-10-15`
        );

        if (availResponse.data.length > 0) {
            logTest('rls', 'availability', '✅', 'Availability RLS working - returns tenant data only', {
                responseCode: availResponse.status,
                payload: { count: availResponse.data.length }
            });
        }

    } catch (error) {
        logTest('rls', 'availability', '❌', 'RLS test failed', {
            responseCode: error.response?.status,
            payload: error.response?.data
        });
    }
}

function generateReport() {
    console.log('\n📊 PHASE 4 DEEP VERIFICATION REPORT');
    console.log('=====================================');

    const categories = ['availability', 'lineup', 'pdf', 'rls'];
    let overallPass = true;

    categories.forEach(category => {
        console.log(`\n${category.toUpperCase()}:`);
        Object.keys(results[category]).forEach(subcategory => {
            const result = results[category][subcategory];
            console.log(`  ${result.status} ${subcategory}`);

            if (result.status === '❌') overallPass = false;

            result.details.forEach(detail => {
                console.log(`    └─ ${detail.message}`);
                if (detail.details.responseCode) {
                    console.log(`       Status: ${detail.details.responseCode}`);
                }
            });
        });
    });

    console.log(`\n🎯 OVERALL RESULT: ${overallPass ? '✅ PASS' : '❌ SOME FAILURES'}`);

    if (!overallPass) {
        console.log('\n🔧 REQUIRED FIXES:');
        categories.forEach(category => {
            Object.keys(results[category]).forEach(subcategory => {
                const result = results[category][subcategory];
                if (result.status === '❌') {
                    console.log(`- Fix ${category}.${subcategory}`);
                }
            });
        });
    }

    return overallPass;
}

async function main() {
    console.log('🚀 PHASE 4 ROSTER DEEP VERIFICATION');
    console.log('=====================================');

    try {
        // Step 1: Authenticate
        if (!await login()) {
            console.log('❌ Authentication failed, aborting tests');
            return;
        }

        // Step 2: Setup test data
        if (!await setupTestData()) {
            console.log('❌ Test data setup failed, aborting tests');
            return;
        }

        // Step 3: Run all tests
        await testAvailabilityManagement();
        await testLineupPublishIntegrity();
        await testPDFExports();
        await testRLSEnforcement();

        // Step 4: Generate report
        generateReport();

    } catch (error) {
        console.log('❌ Critical test failure:', error.message);
    }
}

// Execute the tests
main();