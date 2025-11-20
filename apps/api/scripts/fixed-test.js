const axios = require('axios');

async function fixedTest() {
  console.log('🔧 Testing with proper cookie handling...');

  try {
    // Step 1: Login with proper cookie jar
    console.log('Step 1: Logging in...');

    const loginResponse = await axios.post(
      'http://localhost:3001/api/org/testorg/auth/login',
      {
        email: 'admin@testorg.com',
        password: 'TestPassword123!',
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Login successful, status:', loginResponse.status);

    // Extract cookies
    const cookies = loginResponse.headers['set-cookie'];
    console.log('Cookies received:', cookies ? cookies.length : 'none');

    if (!cookies) {
      console.log('❌ No cookies received from login');
      return;
    }

    const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    console.log('Cookie header:', cookieHeader);

    // Step 2: Make availability call with cookies
    console.log('\nStep 2: Testing availability endpoint...');

    const availResponse = await axios.get(
      'http://localhost:3001/api/org/testorg/players/availability',
      {
        params: { date: '2024-03-15' },
        headers: {
          Cookie: cookieHeader,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Availability call successful!');
    console.log('Status:', availResponse.status);
    console.log('Data length:', availResponse.data.length);
    console.log('First few records:', availResponse.data.slice(0, 3));
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('  Status:', error.response?.status);
    console.log('  Message:', error.response?.data?.message);
    console.log('  Full response:', error.response?.data);

    if (error.response?.status === 404 && error.response?.data?.message === 'Player not found') {
      console.log('\n🔍 This is the "Player not found" error we\'re trying to fix!');
      console.log("   The endpoint is being reached, but our fix isn't working yet.");
    }
  }
}

fixedTest();
