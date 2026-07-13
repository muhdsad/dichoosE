import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new Response('Missing url parameter', { status: 400 });
    }

    try {
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            return new Response(`Failed to fetch image: ${response.status} ${response.statusText}`, { status: response.status });
        }

        const blob = await response.blob();
        const headers = new Headers();
        
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png');
        headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');

        return new Response(blob, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('Error proxying image:', error);
        return new Response('Error proxying image', { status: 500 });
    }
}
