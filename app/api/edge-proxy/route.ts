// app/api/edge-proxy/route.ts
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/api\/edge-proxy/, '').replace(/^\/home/, '')
    const proxiedUrl = `https://home.cherry.org.za${path || '/'}`

    console.log('Proxying to:', proxiedUrl)

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

        // If it's an HTML response, modify the asset URLs
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
            const text = await response.text()
            const modifiedText = text.replace(
                /(src|href)=["']?\/_assets\//g,
                '$1="https://home.cherry.org.za/_assets/'
            )

            return new Response(modifiedText, {
                headers: {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache'
                }
            })
        }

        // For non-HTML responses, proxy them directly
        return response
    } catch (error) {
        console.error('Proxy error:', error)
        return new Response('Error proxying request', { status: 500 })
    }
}