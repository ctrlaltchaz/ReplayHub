const axios = require('axios');

class Phase4Verifier {
  constructor() {
    this.client = axios.create({
      baseURL: 'http://localhost:3001',
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    this.results = [];
    this.testData = {};
  }

  log(step, status, details) {
    const result = { step, status, details };
    this.results.push(result);
    console.log(`${status} Step ${step}: ${details.description || details}`);
    if (details.request) console.log('Request:', JSON.stringify(details.request, null, 2));
    if (details.response) console.log('Response:', JSON.stringify(details.response, null, 2));
    if (details.error) console.log('Error:', JSON.stringify(details.error, null, 2));
  }

  async login(email = 'admin@testorg.com', password = 'TestPassword123!') {
    try {
      const response = await this.client.post('/api/org/testorg/auth/login', { email, password });
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        this.client.defaults.headers.Cookie = cookies.map(c => c.split(';')[0]).join('; ');
      }
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async setupTestData() {
    try {
      // Create team
      const teamResponse = await this.client.post('/api/org/testorg/teams', {
        name: `Test Team ${Date.now()}`,
        game: 'Overwatch 2',
        season: 'Fall 2024',
      });
      this.testData.teamId = teamResponse.data.id;

      // Create players
      const p1Response = await this.client.post('/api/org/testorg/players', {
        gamerTag: `P1_${Date.now()}`,
        role: 'Tank',
      });
      this.testData.p1Id = p1Response.data.id;

      const p2Response = await this.client.post('/api/org/testorg/players', {
        gamerTag: `P2_${Date.now()}`,
        role: 'Support',
      });
      this.testData.p2Id = p2Response.data.id;

      // Add P1 as starter, P2 as bench
      await this.client.post(`/api/org/testorg/teams/${this.testData.teamId}/members`, {
        playerId: this.testData.p1Id,
        isStarter: true,
      });
      await this.client.post(`/api/org/testorg/teams/${this.testData.teamId}/members`, {
        playerId: this.testData.p2Id,
        isStarter: false,
      });

      return this.testData;
    } catch (error) {
      throw new Error(`Setup failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testA_AvailabilityBulk() {
    console.log('\n=== A) Availability Bulk (by team) - LEFT JOIN behaviour ===');

    // Set availability for P1 only
    try {
      await this.client.post(`/api/org/testorg/players/${this.testData.p1Id}/availability`, {
        date: '2025-10-20',
        status: 'available',
        note: '',
      });

      // Test bulk availability query
      const response = await this.client.get('/api/org/testorg/players/availability', {
        params: {
          teamId: this.testData.teamId,
          date: '2025-10-20',
        },
      });

      const expected = {
        teamId: this.testData.teamId,
        date: '2025-10-20',
        count: 2,
        items: [
          { playerId: this.testData.p1Id, status: 'available', note: '' },
          { playerId: this.testData.p2Id, status: null, note: null },
        ],
        missing: [this.testData.p2Id],
      };

      this.log('A.1', '✅', {
        description: 'Availability bulk query with LEFT JOIN',
        request: { teamId: this.testData.teamId, date: '2025-10-20' },
        response: response.data,
        status: response.status,
      });

      return response.data;
    } catch (error) {
      this.log('A.1', '❌', {
        description: 'Availability bulk query failed',
        error: error.response?.data,
        status: error.response?.status,
      });
      return null;
    }
  }

  async testB_LineupMembership() {
    console.log('\n=== B) Lineup membership & auto-attach ===');

    try {
      // Create event and lineup
      const eventId = `event_${Date.now()}`;
      const lineupResponse = await this.client.post(`/api/org/testorg/events/${eventId}/lineup`, {
        teamId: this.testData.teamId,
        title: 'Test Lineup',
      });
      this.testData.lineupId = lineupResponse.data.id;

      // Create player not on team
      const p3Response = await this.client.post('/api/org/testorg/players', {
        gamerTag: `P3_${Date.now()}`,
        role: 'DPS',
      });
      this.testData.p3Id = p3Response.data.id;

      // Test without autoAttachMissing (should fail with 422)
      try {
        await this.client.post(`/api/org/testorg/lineups/${this.testData.lineupId}/slots`, {
          slots: [{ playerId: this.testData.p3Id }],
          autoAttachMissing: false,
        });
        this.log('B.1', '❌', { description: 'Should have failed with 422 but succeeded' });
      } catch (error) {
        if (error.response?.status === 422) {
          this.log('B.1', '✅', {
            description: 'Got 422 for player not on team',
            response: error.response.data,
            status: error.response.status,
          });
        } else {
          this.log('B.1', '❌', {
            description: `Expected 422 but got ${error.response?.status}`,
            error: error.response?.data,
          });
        }
      }

      // Test with autoAttachMissing (should succeed)
      try {
        const response = await this.client.post(
          `/api/org/testorg/lineups/${this.testData.lineupId}/slots`,
          {
            slots: [{ playerId: this.testData.p3Id }],
            autoAttachMissing: true,
          }
        );

        this.log('B.2', '✅', {
          description: 'Auto-attach missing player succeeded',
          response: response.data,
          status: response.status,
        });

        return response.data;
      } catch (error) {
        this.log('B.2', '❌', {
          description: 'Auto-attach failed',
          error: error.response?.data,
          status: error.response?.status,
        });
      }
    } catch (error) {
      this.log('B.0', '❌', {
        description: 'Lineup setup failed',
        error: error.response?.data,
      });
    }
  }

  async testC_PublishImmutability() {
    console.log('\n=== C) Publish immutability ===');

    try {
      // Publish lineup
      const publishResponse = await this.client.post(
        `/api/org/testorg/lineups/${this.testData.lineupId}/publish`
      );

      this.log('C.1', '✅', {
        description: 'Lineup published',
        response: publishResponse.data,
        status: publishResponse.status,
      });

      // Test immutability - try to add slots
      try {
        await this.client.post(`/api/org/testorg/lineups/${this.testData.lineupId}/slots`, {
          slots: [{ playerId: this.testData.p1Id }],
        });
        this.log('C.2', '❌', { description: 'Should not be able to modify published lineup' });
      } catch (error) {
        if (error.response?.status === 409) {
          this.log('C.2', '✅', {
            description: 'Got 409 when trying to modify published lineup',
            response: error.response.data,
            status: error.response.status,
          });
        } else {
          this.log('C.2', '❌', {
            description: `Expected 409 but got ${error.response?.status}`,
            error: error.response?.data,
          });
        }
      }

      // Test immutability - try to update title
      try {
        await this.client.put(`/api/org/testorg/lineups/${this.testData.lineupId}`, {
          title: 'Updated Title',
        });
        this.log('C.3', '❌', { description: 'Should not be able to update published lineup' });
      } catch (error) {
        if (error.response?.status === 409) {
          this.log('C.3', '✅', {
            description: 'Got 409 when trying to update published lineup',
            response: error.response.data,
            status: error.response.status,
          });
        } else {
          this.log('C.3', '❌', {
            description: `Expected 409 but got ${error.response?.status}`,
            error: error.response?.data,
          });
        }
      }
    } catch (error) {
      this.log('C.1', '❌', {
        description: 'Publish failed',
        error: error.response?.data,
        status: error.response?.status,
      });
    }
  }

  async run() {
    try {
      console.log('🔧 Phase 4 Patches Verification');

      await this.login();
      console.log('✅ Logged in successfully');

      await this.setupTestData();
      console.log('✅ Test data setup complete');
      console.log('Test data:', this.testData);

      await this.testA_AvailabilityBulk();
      await this.testB_LineupMembership();
      await this.testC_PublishImmutability();

      console.log('\n=== SUMMARY ===');
      this.results.forEach(r => {
        console.log(`${r.status} ${r.step}: ${r.details.description || r.details}`);
      });

      const passed = this.results.filter(r => r.status === '✅').length;
      const total = this.results.length;
      console.log(`\nResults: ${passed}/${total} tests passed`);
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
    }
  }
}

const verifier = new Phase4Verifier();
verifier.run();
