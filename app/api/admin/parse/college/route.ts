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

    const prompt = buildCollegePrompt(collegeName, content);
    const rawResponse = await callLLM(COLLEGE_SYSTEM_MESSAGE, prompt);
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
