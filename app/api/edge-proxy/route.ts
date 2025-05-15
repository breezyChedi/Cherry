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
            let text = await response.text()
            
            // First handle the specific exception for app routes
            // This needs to happen BEFORE the general domain replacement
            
            // Handle href, action, data-url and other attributes that might contain navigation URLs
            text = text.replace(
                /(href|action|data-url|url)=["'](https?:\/\/)?(www\.)?cherry\.org\.za\/(calculator|profile|info|universities|home)([/"'\s]|>)/g,
                (match, attr, protocol, www, route, ending) => {
                    return `${attr}="/${route}${ending}`;
                }
            )
            
            // Handle potential JavaScript redirects
            text = text.replace(
                /window\.location(?:\.href)?\s*=\s*["'](https?:\/\/)?(www\.)?cherry\.org\.za\/(calculator|profile|info|universities|home)["']/g,
                (match, protocol, www, route) => {
                    return `window.location = "/${route}"`;
                }
            )
            
            // Now do the general replacement for all other URLs
            // Replace any references to www.cherry.org.za with home.cherry.org.za
            text = text.replace(/www\.cherry\.org\.za/g, 'home.cherry.org.za')
            
            // Replace relative asset paths with absolute paths
            text = text.replace(
                /(src|href)=["'](\/_assets\/[^"']*?)["']/g,
                '$1="https://home.cherry.org.za$2"'
            )

            // Handle cases where there might not be quotes around the URL
            text = text.replace(
                /(src|href)=(\/_assets\/[^\s>]*)/g,
                '$1="https://home.cherry.org.za$2"'
            )

            return new Response(text, {
                headers: {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache'
                }
            })
        }

        // For asset requests, redirect to home.cherry.org.za
        if (request.url.includes('/_assets/')) {
            return Response.redirect(
                request.url.replace('www.cherry.org.za', 'home.cherry.org.za'),
                301
            )
        }

        // For non-HTML responses, proxy them directly
        return response
    } catch (error) {
        console.error('Proxy error:', error)
        return new Response('Error proxying request', { status: 500 })
    }
}