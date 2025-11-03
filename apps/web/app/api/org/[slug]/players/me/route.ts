import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    const { slug } = await context.params;
    const cookieHeader = request.headers.get('cookie');

    try {
        const response = await fetch(`http://localhost:3001/api/org/${slug}/players/me`, {
            method: 'GET',
            headers: {
                'Cookie': cookieHeader || '',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json(
                { error: error || 'Failed to fetch player' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching player:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
