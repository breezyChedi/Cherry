import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/admin/auth';
import { callLLM, extractJsonFromResponse } from '@/app/lib/admin/llm';
import { COLLEGE_SYSTEM_MESSAGE, buildCollegePrompt } from '@/app/lib/admin/prompts';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { collegeName, content } = await req.json();
    if (!collegeName || !content) {
      return NextResponse.json({ error: 'Missing collegeName or content' }, { status: 400 });
    }

    console.log(`[API /parse/college] Extracting — college="${collegeName}", content=${content.length} chars`);
    const start = Date.now();

    const prompt = buildCollegePrompt(collegeName, content);
    console.log(`[API /parse/college] Prompt built: ${prompt.length} chars`);

    const rawResponse = await callLLM(COLLEGE_SYSTEM_MESSAGE, prompt);
    const parsed = extractJsonFromResponse(rawResponse);

    if (!parsed) {
      console.error(`[API /parse/college] FAILED to parse LLM response after ${Date.now() - start}ms`);
      return NextResponse.json({ error: 'Failed to parse LLM response', raw: rawResponse }, { status: 422 });
    }

    const instName = (parsed as Record<string, unknown>).institution
      ? ((parsed as Record<string, unknown>).institution as Record<string, unknown>).name
      : 'unknown';
    console.log(`[API /parse/college] Extraction OK in ${Date.now() - start}ms — name="${instName}"`);
    return NextResponse.json({ data: parsed, raw: rawResponse });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'LLM extraction failed';
    console.error(`[API /parse/college] ERROR: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
