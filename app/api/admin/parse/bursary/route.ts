import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { callLLM, extractJsonFromResponse } from '@/app/lib/admin/llm';
import { BURSARY_SYSTEM_MESSAGE, buildBursaryPrompt } from '@/app/lib/admin/prompts';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { funderName, bursaryName, content, tags } = await req.json();
    if (!funderName || !bursaryName || !content) {
      return NextResponse.json({ error: 'Missing funderName, bursaryName, or content' }, { status: 400 });
    }

    const usedTags = tags || ['general', 'eligibility', 'coverage', 'application'];
    console.log(`[API /parse/bursary] Extracting — funder="${funderName}", bursary="${bursaryName}", content=${content.length} chars, tags=[${usedTags.join(',')}]`);
    const start = Date.now();

    const prompt = buildBursaryPrompt(funderName, bursaryName, content, usedTags);
    console.log(`[API /parse/bursary] Prompt built: ${prompt.length} chars`);

    const rawResponse = await callLLM(BURSARY_SYSTEM_MESSAGE, prompt);
    const parsed = extractJsonFromResponse(rawResponse);

    if (!parsed) {
      console.error(`[API /parse/bursary] FAILED to parse LLM response after ${Date.now() - start}ms`);
      return NextResponse.json({ error: 'Failed to parse LLM response', raw: rawResponse }, { status: 422 });
    }

    const bursaryId = (parsed as Record<string, unknown>).id || (parsed as Record<string, unknown>).bursaries ? 'multi' : 'unknown';
    console.log(`[API /parse/bursary] Extraction OK in ${Date.now() - start}ms — id="${bursaryId}"`);
    return NextResponse.json({ data: parsed, raw: rawResponse });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'LLM extraction failed';
    console.error(`[API /parse/bursary] ERROR: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
