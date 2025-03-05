export default async function handler(req) {
    // Remove the /home prefix from the URL since we want to proxy to home.cherry.org.za
    const url = req.url.replace(/^\/home/, '');
    let proxiedUrl = `https://home.cherry.org.za${url || '/'}`;

    try {
        const response = await fetch(proxiedUrl);

        // If it's an HTML request, modify the asset URLs
        if (response.ok && (url.endsWith('.html') || url === '/' || url === '')) {
            const text = await response.text();
            const modifiedText = text.replace(
                /"(\/_assets\/[^"]+)"/g,
                '"https://home.cherry.org.za$1"'
            );

            return new Response(modifiedText, {
                headers: { 
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache'
                },
            });
        }

        return response;
    } catch (error) {
        return new Response('Error proxying request', { status: 500 });
    }
}