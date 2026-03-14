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

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json({ error: 'blocked', message: 'Website blocked the request (403). Please paste the text manually instead.' }, { status: 422 });
      }
      return NextResponse.json({ error: 'fetch_failed', message: `HTTP ${response.status}` }, { status: 422 });
    }

    const html = await response.text();

    // Dynamic import for linkedom and readability
    const { parseHTML } = await import('linkedom');
    const { Readability } = await import('@mozilla/readability');

    const { document } = parseHTML(html);
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article || !article.textContent || article.textContent.trim().length < 50) {
      return NextResponse.json({ error: 'empty', message: 'Could not extract meaningful content from this URL.' }, { status: 422 });
    }

    return NextResponse.json({
      text: article.textContent.trim(),
      title: article.title || null,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'timeout', message: 'Request timed out after 15 seconds.' }, { status: 422 });
    }
    const message = error instanceof Error ? error.message : 'Scrape failed';
    return NextResponse.json({ error: 'unknown', message }, { status: 500 });
  }
}
