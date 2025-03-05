// ./api/edge-proxy.js
export default async function handler(req) {
    const url = req.url;
    let proxiedUrl = `https://home.cherry.org.za${url}`;
  
    // Rewrite the asset URLs
    const response = await fetch(proxiedUrl);
  
    // If it's an asset request, modify the HTML or resources
    if (response.ok && url.endsWith('.html')) {
      const text = await response.text();
      const modifiedText = text.replace(
        /"(\/_assets\/[^"]+)"/g,
        '"https://home.cherry.org.za$1"'
      );
  
      return new Response(modifiedText, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  
    // For all other requests, just forward them without modification
    return response;
  }
  