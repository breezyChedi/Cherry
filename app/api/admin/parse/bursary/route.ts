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

    const prompt = buildBursaryPrompt(funderName, bursaryName, content, tags || ['general', 'eligibility', 'coverage', 'application']);
    const rawResponse = await callLLM(BURSARY_SYSTEM_MESSAGE, prompt);
    const parsed = extractJsonFromResponse(rawResponse);

    if (!parsed) {
      return NextResponse.json({ error: 'Failed to parse LLM response', raw: rawResponse }, { status: 422 });
    }

    return NextResponse.json({ data: parsed, raw: rawResponse });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'LLM extraction failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
