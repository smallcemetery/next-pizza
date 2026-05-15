import { prisma } from '@/prisma/prisma-client';
import { getUserSession } from '@/shared/lib/get-user-session';
import { deepseekMascotReply } from '@/shared/lib/deepseek-chat';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM =
  'Ты дружелюбный маскот Next Pizza. Отвечай кратко, по делу, на русском. Помогай с заказом, доставкой и акциями.';

async function openAiReply(message: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: message },
      ],
      max_output_tokens: 220,
    }),
  });
  if (!response.ok) return null;
  const json = (await response.json()) as { output_text?: string };
  const text = (json.output_text ?? '').trim();
  return text ? text.slice(0, 3000) : null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const body = (await req.json()) as { message?: string; chatId?: number };
    const message = (body.message ?? '').trim();
    if (message.length < 1 || message.length > 1000) {
      return NextResponse.json({ message: 'Сообщение должно быть от 1 до 1000 символов' }, { status: 400 });
    }

    const userId = Number(session.id);
    let chatId = Number(body.chatId);
    if (!chatId) {
      const chat = await prisma.mascotChat.create({
        data: {
          userId,
          title: message.slice(0, 60),
        },
      });
      chatId = chat.id;
    }

    const chat = await prisma.mascotChat.findFirst({ where: { id: chatId, userId } });
    if (!chat) {
      return NextResponse.json({ message: 'Чат не найден' }, { status: 404 });
    }

    await prisma.mascotMessage.create({
      data: { chatId, role: 'user', content: message },
    });

    let assistantText = 'Я с тобой! Могу подсказать по меню, скидкам и статусу заказа.';

    const ds = await deepseekMascotReply(message);
    if (ds) {
      assistantText = ds;
    } else {
      const oa = await openAiReply(message);
      if (oa) assistantText = oa;
    }

    await prisma.mascotMessage.create({
      data: { chatId, role: 'assistant', content: assistantText },
    });

    return NextResponse.json({ chatId, answer: assistantText });
  } catch (error) {
    console.log('[MASCOT_CHAT_POST] Error', error);
    return NextResponse.json({ message: 'Ошибка чата' }, { status: 500 });
  }
}
