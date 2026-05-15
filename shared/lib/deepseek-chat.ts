import OpenAI from 'openai';
import type { ChatCompletion } from 'openai/resources/chat/completions';

const SYSTEM =
  'Ты дружелюбный маскот Next Pizza. Отвечай кратко, по делу, на русском. Помогай с заказом, доставкой и акциями.';

/**
 * DeepSeek через OpenAI-совместимый endpoint (документация DeepSeek + пакет `openai`).
 * Ключ только из окружения: DEEPSEEK_API_KEY (или DEEPSEEK_KEY / DEEPSEEK_TOKEN).
 *
 * Модель: `DEEPSEEK_MODEL` (по умолчанию `deepseek-chat`).
 * Для `deepseek-v4-pro` и режима thinking задайте `DEEPSEEK_THINKING=1` — иначе API может вернуть ошибку.
 */
export async function deepseekMascotReply(userMessage: string): Promise<string | null> {
  const apiKey = (
    process.env.DEEPSEEK_API_KEY ??
    process.env.DEEPSEEK_KEY ??
    process.env.DEEPSEEK_TOKEN ??
    ''
  ).trim();
  if (!apiKey) {
    return null;
  }

  const model = (process.env.DEEPSEEK_MODEL ?? 'deepseek-chat').trim();
  const thinkingOn = process.env.DEEPSEEK_THINKING === '1';
  const v4ish = /deepseek-v4|v4-pro|v4-flash/i.test(model);

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });

  try {
    const base = {
      model,
      messages: [
        { role: 'system' as const, content: SYSTEM },
        { role: 'user' as const, content: userMessage },
      ],
      max_tokens: 500,
    };

    const withThinking: Record<string, unknown> =
      thinkingOn && v4ish
        ? {
            thinking: { type: 'enabled' },
            reasoning_effort: process.env.DEEPSEEK_REASONING_EFFORT ?? 'high',
          }
        : {};

    const completion = (await client.chat.completions.create({
      ...base,
      ...withThinking,
      stream: false,
    } as Parameters<typeof client.chat.completions.create>[0])) as ChatCompletion;

    const msg = completion.choices[0]?.message as { content?: string | null; reasoning_content?: string | null };
    const text = (msg?.content ?? msg?.reasoning_content ?? '').trim();
    return text ? text.slice(0, 3000) : null;
  } catch (e) {
    console.error('[deepseekMascotReply]', e);
    return null;
  }
}
