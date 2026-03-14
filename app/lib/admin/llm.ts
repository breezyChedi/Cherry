import OpenAI from 'openai';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export async function callLLM(systemMessage: string, userMessage: string): Promise<string> {
  const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
  console.log(`[LLM] Calling ${MODEL} — system: ${systemMessage.length} chars, user: ${userMessage.length} chars`);
  const start = Date.now();

  const response = await getOpenAI().chat.completions.create({
    model: MODEL,
    max_completion_tokens: 16384,
    temperature: 0.15,
    top_p: 0.9,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ],
  });

  const elapsed = Date.now() - start;
  const content = response.choices[0]?.message?.content || '';
  const usage = response.usage;
  console.log(`[LLM] Response in ${elapsed}ms — ${content.length} chars`);
  if (usage) {
    console.log(`[LLM] Tokens — prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens}, total: ${usage.total_tokens}`);
  }

  return content;
}

export function extractJsonFromResponse(text: string): unknown | null {
  const trimmed = text.trim();
  console.log(`[LLM] Parsing JSON from ${trimmed.length} chars`);

  // 1. Try direct parse
  try {
    const result = JSON.parse(trimmed);
    console.log(`[LLM] Direct JSON parse OK`);
    return result;
  } catch {}

  // 2. Try extracting from ```json ... ``` code blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      const result = JSON.parse(codeBlockMatch[1]);
      console.log(`[LLM] Extracted JSON from code block`);
      return result;
    } catch {}
  }

  // 3. Find outermost { ... } or [ ... ] with brace matching
  for (const [startChar, endChar] of [['{', '}'], ['[', ']']]) {
    const startIdx = trimmed.indexOf(startChar);
    if (startIdx === -1) continue;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === startChar) depth++;
      else if (ch === endChar) {
        depth--;
        if (depth === 0) {
          try {
            const result = JSON.parse(trimmed.slice(startIdx, i + 1));
            console.log(`[LLM] Extracted JSON via brace matching`);
            return result;
          } catch { break; }
        }
      }
    }
  }

  console.error(`[LLM] FAILED to parse JSON. First 200 chars: ${trimmed.slice(0, 200)}`);
  return null;
}
