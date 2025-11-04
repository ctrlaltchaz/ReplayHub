const fetch = require('node-fetch');

const API_URL = 'https://api.replayhub.app';

async function testInvite() {
    console.log('Testing invite creation...\n');

    // You need to be logged in - use a real session cookie
    const cookie = process.argv[2];

    if (!cookie) {
        console.error('Usage: node debug-invite.js "connect.sid=YOUR_SESSION_COOKIE"');
        console.error('\nGet your session cookie from browser DevTools → Application → Cookies');
        process.exit(1);
    }

    try {
        const response = await fetch(`${API_URL}/api/org/wncesports/invites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify({
                email: 'test@example.com',
                roles: ['ADMIN'],
                method: 'EMAIL'
            })
        });

        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.text();
        console.log('\nResponse:', data);

    } catch (error) {
        console.error('Error:', error);
    }
}

testInvite();
