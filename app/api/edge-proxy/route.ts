// app/api/edge-proxy/route.ts
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    // Remove both /api/edge-proxy and /home from the path
    const path = url.pathname.replace(/^\/api\/edge-proxy/, '').replace(/^\/home/, '')
    const proxiedUrl = `https://home.cherry.org.za${path || '/'}`

    console.log('Proxying to:', proxiedUrl) // Add this for debugging

    try {
        const response = await fetch(proxiedUrl, {
            headers: {
                'Host': 'home.cherry.org.za',
                'Accept': '*/*'
            }
        })
        
        if (!response.ok) {
            console.error('Proxy error:', response.status, response.statusText)
            return new Response(`Proxy error: ${response.status}`, { status: response.status })
        }

        return response
    } catch (error) {
        console.error('Proxy error:', error)
        return new Response('Error proxying request', { status: 500 })
    }
}