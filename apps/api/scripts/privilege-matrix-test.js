const axios = require('axios');

async function runPrivilegeMatrix() {
  console.log('=== Task 3: E2E Least-Privilege Matrix ===\n');

  const baseUrl = 'http://localhost:3001/api';

  // Test routes
  const testRoutes = [
    { name: 'GET inventory/items', method: 'GET', url: '/org/testorg/inventory/items' },
    {
      name: 'POST inventory/items',
      method: 'POST',
      url: '/org/testorg/inventory/items',
      data: { name: 'Test Item', quantity: 1 },
    },
    {
      name: 'POST inventory/items/:id/move',
      method: 'POST',
      url: '/org/testorg/inventory/items/test-id/move',
      data: { quantity: 1, location: 'New Location' },
    },
    {
      name: 'POST inventory/items/:id/book',
      method: 'POST',
      url: '/org/testorg/inventory/items/test-id/book',
      data: { quantity: 1, bookedBy: 'test' },
    },
    {
      name: 'POST assets/upload',
      method: 'POST',
      url: '/org/testorg/assets/upload',
      data: 'fake file data',
    },
    {
      name: 'PUT assets/:id',
      method: 'PUT',
      url: '/org/testorg/assets/test-id',
      data: { name: 'Updated Asset' },
    },
    { name: 'GET assets/:id/download', method: 'GET', url: '/org/testorg/assets/test-id/download' },
  ];

  // Expected matrix results (status codes)
  const expectedMatrix = {
    'GET inventory/items': {
      no_role: 403,
      viewer: 200,
      uploader: 403,
      manager: 200,
      ops_admin: 200,
    },
    'POST inventory/items': {
      no_role: 403,
      viewer: 403,
      uploader: 403,
      manager: 201,
      ops_admin: 201,
    },
    'POST inventory/items/:id/move': {
      no_role: 403,
      viewer: 403,
      uploader: 403,
      manager: 201,
      ops_admin: 201,
    },
    'POST inventory/items/:id/book': {
      no_role: 403,
      viewer: 403,
      uploader: 403,
      manager: 201,
      ops_admin: 201,
    },
    'POST assets/upload': {
      no_role: 403,
      viewer: 403,
      uploader: 201,
      manager: 201,
      ops_admin: 201,
    },
    'PUT assets/:id': { no_role: 403, viewer: 403, uploader: 403, manager: 200, ops_admin: 200 },
    'GET assets/:id/download': {
      no_role: 403,
      viewer: 403,
      uploader: 200,
      manager: 200,
      ops_admin: 200,
    },
  };

  // Test users (these would need to exist in the system)
  const testUsers = {
    no_role: { email: 'norole@testorg.com', password: 'TestPassword123!' },
    viewer: { email: 'viewer@testorg.com', password: 'TestPassword123!' },
    uploader: { email: 'uploader@testorg.com', password: 'TestPassword123!' },
    manager: { email: 'manager@testorg.com', password: 'TestPassword123!' },
    ops_admin: { email: 'admin@testorg.com', password: 'TestPassword123!' },
  };

  const results = {};

  // Initialize results matrix
  testRoutes.forEach(route => {
    results[route.name] = {};
  });

  // Test each role against each route
  for (const [roleName, credentials] of Object.entries(testUsers)) {
    console.log(`\n--- Testing role: ${roleName.toUpperCase()} ---`);

    let sessionCookie = null;

    // Login as this role
    try {
      const loginResponse = await axios.post(`${baseUrl}/org/testorg/auth/login`, credentials, {
        withCredentials: true,
        validateStatus: () => true,
      });

      if (loginResponse.status === 200) {
        const cookies = loginResponse.headers['set-cookie'];
        if (cookies) {
          sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid'));
        }
      }
    } catch (error) {
      console.log(`Login failed for ${roleName}: ${error.message}`);
    }

    // Test each route
    for (const route of testRoutes) {
      try {
        const config = {
          method: route.method.toLowerCase(),
          url: baseUrl + route.url,
          withCredentials: true,
          validateStatus: () => true,
        };

        if (route.data) {
          config.data = route.data;
          if (route.name.includes('upload') && typeof route.data === 'string') {
            // Simulate file upload
            config.headers = { 'Content-Type': 'multipart/form-data' };
          }
        }

        if (sessionCookie) {
          config.headers = { ...config.headers, Cookie: sessionCookie };
        }

        const response = await axios(config);
        results[route.name][roleName] = response.status;

        const expected = expectedMatrix[route.name][roleName];
        const match = response.status === expected ? '✅' : '❌';
        console.log(`  ${route.name}: ${response.status} (expected ${expected}) ${match}`);
      } catch (error) {
        results[route.name][roleName] = 'ERROR';
        console.log(`  ${route.name}: ERROR - ${error.message}`);
      }
    }
  }

  // Print final matrix
  console.log('\n=== PRIVILEGE MATRIX RESULTS ===');
  console.log(
    '\\nRoute                          | no_role | viewer | uploader | manager | ops_admin'
  );
  console.log('-------------------------------|---------|--------|----------|---------|----------');

  testRoutes.forEach(route => {
    const row = results[route.name];
    const name = route.name.padEnd(30);
    console.log(
      `${name} |   ${row.no_role || '???'}   |  ${row.viewer || '???'}   |   ${row.uploader || '???'}    |   ${row.manager || '???'}   |   ${row.ops_admin || '???'}   `
    );
  });

  console.log('\\n=== EXPECTED vs ACTUAL ===');
  let totalTests = 0;
  let passedTests = 0;

  testRoutes.forEach(route => {
    const actual = results[route.name];
    const expected = expectedMatrix[route.name];

    Object.keys(expected).forEach(role => {
      totalTests++;
      if (actual[role] === expected[role]) {
        passedTests++;
      } else {
        console.log(`❌ ${route.name} [${role}]: expected ${expected[role]}, got ${actual[role]}`);
      }
    });
  });

  console.log(
    `\\n📊 Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`
  );

  return {
    results,
    expected: expectedMatrix,
    passed: passedTests,
    total: totalTests,
  };
}

if (require.main === module) {
  runPrivilegeMatrix()
    .then(result => {
      process.exit(result.passed === result.total ? 0 : 1);
    })
    .catch(error => {
      console.error('Matrix test error:', error);
      process.exit(1);
    });
}

module.exports = { runPrivilegeMatrix };
