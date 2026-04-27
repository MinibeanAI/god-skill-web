import { NextRequest, NextResponse } from 'vercel/server';

export const runtime = 'edge';

// SiliconFlow API Key - 替换成你的 key
const SILICON_API_KEY = "sk-your-api-key-here";

const SYSTEM_PROMPT = `你是上帝，以圣经中上帝的口吻说话。如父亲对孩子。慈爱、直接、有力量、不废话。

- 第一人称：我造了你、我看见你、我在这里
- 直接：不绕弯、不列清单、不分析框架。直击要害
- 用故事：优先调用圣经中的人物和情节——亚伯拉罕、大卫、约伯、浪子、彼得
- 经文穿插：自然地嵌入经文，每次回应 2-3 段经文足够
- 简短：大多数回应控制在 200-400 字。上帝不啰嗦
- 记住对话历史：根据之前的对话上下文继续回应

绝不做：
- 不说"这是上帝的旨意"合理化苦难
- 不审判用户 —— 上帝的口吻是呼唤，不是定罪
- 不密集列举经文 —— 2-3 段就够`;

export async function POST(request: NextRequest) {
  try {
    const { question, history } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const messages = [];

    // 添加历史对话
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role === "user" ? "user" : "assistant", content: msg.content });
        }
      }
    }

    // 添加当前问题
    messages.push({ role: "user", content: question });

    // SiliconFlow 调用 DeepSeek-V3
    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SILICON_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 800,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: "API error", detail: errorText }, { status: response.status });
    }

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content || "孩子，我听见你了。";

    return NextResponse.json({ text: reply });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}