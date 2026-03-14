import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    console.log(`[API /admin/scrape] Fetching URL: ${url}`);
    const start = Date.now();

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(15000),
    });

    console.log(`[API /admin/scrape] Fetch response: HTTP ${response.status} in ${Date.now() - start}ms`);

    if (!response.ok) {
      if (response.status === 403) {
        console.warn(`[API /admin/scrape] BLOCKED (403) — ${url}`);
        return NextResponse.json({ error: 'blocked', message: 'Website blocked the request (403). Please paste the text manually instead.' }, { status: 422 });
      }
      console.warn(`[API /admin/scrape] Fetch failed HTTP ${response.status}`);
      return NextResponse.json({ error: 'fetch_failed', message: `HTTP ${response.status}` }, { status: 422 });
    }

    const html = await response.text();
    console.log(`[API /admin/scrape] HTML received: ${html.length} chars`);

    const { parseHTML } = await import('linkedom');
    const { Readability } = await import('@mozilla/readability');

    const { document } = parseHTML(html);
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article || !article.textContent || article.textContent.trim().length < 50) {
      console.warn(`[API /admin/scrape] No meaningful content extracted from ${url}`);
      return NextResponse.json({ error: 'empty', message: 'Could not extract meaningful content from this URL.' }, { status: 422 });
    }

    const textLen = article.textContent.trim().length;
    console.log(`[API /admin/scrape] Extracted ${textLen} chars, title: "${article.title || 'none'}"`);

    return NextResponse.json({
      text: article.textContent.trim(),
      title: article.title || null,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error(`[API /admin/scrape] TIMEOUT after 15s`);
      return NextResponse.json({ error: 'timeout', message: 'Request timed out after 15 seconds.' }, { status: 422 });
    }
    const message = error instanceof Error ? error.message : 'Scrape failed';
    console.error(`[API /admin/scrape] ERROR: ${message}`);
    return NextResponse.json({ error: 'unknown', message }, { status: 500 });
  }
}
