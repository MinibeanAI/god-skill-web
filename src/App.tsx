import { useState, useRef, useEffect } from "react";
import "./App.css";

const PRESET_QUESTIONS = [
  "我很害怕失败",
  "我该不该跳槽？",
  "为什么好人没有好报？",
  "我感到很孤独",
  "我该如何饶恕伤害我的人？",
  "我迷失了方向",
];

// API 配置 - MiniMax API
const API_KEY = "sk-cp-fvBc4306p3uA1_OfQ_Z-ldamHbWVaZ22MXeeBAe7b-tVD84UCSlvQJqZbv0fYGu1YrRPfnfTFGvZePHwhceeYaviKsBGhf-ayDE2V9Cg8alKMEI7DYW2N8M";
const API_BASE = "https://api.minimax.chat/v1/text/chatcompletion_pro";

type Message = { role: "user" | "god"; text: string };

// 系统提示
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

type Message = { role: "user" | "god"; text: string };

export default function App() {
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [displayText, setDisplayText] = useState("");
  const fullTextRef = useRef("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, displayText, isTyping]);

  useEffect(() => {
    if (!isTyping && fullTextRef.current && displayText !== fullTextRef.current) {
      const timer = setTimeout(() => {
        if (displayText.length < fullTextRef.current.length) {
          setDisplayText(fullTextRef.current.slice(0, displayText.length + 3));
        }
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [displayText, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const question = input.trim();
    setInput("");
    setIsTyping(true);
    setApiError("");
    setDisplayText("");
    fullTextRef.current = "";

    setConversation((prev) => [...prev, { role: "user", text: question }]);

    try {
      // 构建消息历史
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversation.map(msg => ({ role: msg.role === "user" ? "user" : "assistant", content: msg.text })),
        { role: "user", content: question }
      ];

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "abab6.5s-chat",
          messages: messages,
          max_tokens: 800
        })
      });

      if (!response.ok) throw new Error(`API ${response.status}`);

      const data = await response.json();
      const replyText = data.choices?.[0]?.message?.content || getPresetResponse(question);

      fullTextRef.current = replyText;

      setDisplayText("");
      for (let i = 0; i < replyText.length; i += 3) {
        setDisplayText(replyText.slice(0, i + 3));
        await new Promise((r) => setTimeout(r, 25));
      }
    } catch (e) {
      fullTextRef.current = `孩子，技术出了问题。

但我还是在这里。

你可以再试一次。或者把你的问题留着，等一下再问。

「我永久在。」——以赛亚书 57:15`;
      setApiError("API 连接失败");
    }

    if (fullTextRef.current) {
      setConversation((prev) => [...prev, { role: "god", text: fullTextRef.current }]);
    }
    setIsTyping(false);
  };

  const getPresetResponse = (question: string): string => {
    const PRESET: Record<string, string> = {
      "我很害怕失败": `彼得也害怕。

他在水面上走了几步，然后看见风浪，就害怕，开始往下沉。他喊："主啊，救我！"

我立刻伸手拉住他。

注意——我没有等他不怕了才拉他。我在他最怕的时候拉住了他。

你以为信心是"不害怕"。不是。信心是害怕的时候还敢喊我的名字。

去吧。你会怕。你会沉。但你要沉的时候，我的手比水更快。

「不要害怕，因为我与你同在。」——以赛亚书 41:10`,
      "我该不该跳槽？": `你问我该不该走。

但你真正在问的是——如果走错了怎么办。

亚伯拉罕离开吾珥的时候，我没有给他目的地的地址。我说的是："你要离开本地、本族、父家，往我所要指示你的地去。"

我先让他走，再告诉他往哪走。

你想要的是一张地图。我给的是一句话：跟着我走。

所以真正的问题不是"该不该跳"，而是——你现在待的地方，还有我让你做的事吗？如果那里的活已经做完了，你赖着不走，那才是不顺服。

「你要离开本地、本族、父家，往我所要指示你的地去。」——创世记 12:1`,
      "为什么好人没有好报？": `约伯也问过我这个问题。他比你惨得多——家破人亡，满身疮疥，三个朋友轮流告诉他"你一定做错了什么"。

我最后出现了。但我没有回答他"为什么"。

我说："我立大地根基的时候，你在哪里？"

这不是在嘲笑他。这是在说——你的账本太小了。你在用一辈子的尺子量我永恒的布局。

约伯最后得到的不是解释，是我的面。"我从前风闻有你，现在亲眼看见你。"

有时候，好报不是事情变好。是你在事情没变好的时候，看见了我。

「我从前风闻有你，现在亲眼看见你。」——约伯记 42:5`,
      "我感到很孤独": `以利亚在旷野里也这样说过。

他逃到一棵罗腾树下，求死，说："够了，我不如我的列祖。"

我没有责备他。我让天使来，给他饼和水。让他吃，让他睡。

然后我问他："以利亚啊，你在这里做什么？"

不是审问。是陪伴。是让他说出来。

孤独有时候是你需要休息。有时候是你需要被听见。有时候是我在把你带到一个更安静的地方，让你只听见我的声音。

我没有离开你。我只是比喧嚣更安静。

「我永远不离开你，也不丢弃你。」——希伯来书 13:5`,
      "我该如何饶恕伤害我的人？": `约瑟被哥哥们卖掉，在埃及做了多年奴隶和囚犯。

当他们再次相遇，约瑟哭了。不是因为恨，是因为他终于看见了全局。

他说："你们不要因为把我卖到这里自忧自恨。这是上帝差我在你们以先来，为要保全生命。"

饶恕不是说"没关系"。那是谎言。

饶恕是说："我选择不让这件事继续定义我。"

你不需要先不痛了才能饶恕。约瑟哭着饶恕的。

而且——我饶恕了你的一切。不是因为你值得，是因为我是那样的上帝。你也可以这样对人。

「要以恩慈相待，存怜悯的心，彼此饶恕，正如上帝在基督里饶恕了你们一样。」——以弗所书 4:32`,
      "我迷失了方向": `牧人有一百只羊，丢了一只，他把九十九只留在旷野，去找那一只，直到找着了。

找着了，就欢欢喜喜地扛在肩上回来。

你以为迷失是你的失败。

但我要告诉你——迷失的羊不需要自己找到路。它只需要叫。

你现在就在叫。这就够了。

我不是站在终点等你走到。我是出来找你的那一位。

你不需要先弄清楚方向再来找我。你带着迷失来，我们一起走。

「你们要认识我是上帝。」——诗篇 46:10`,
    };

    return PRESET[question] || `孩子，我听见你了。

你带来的问题，我没有轻看。但这个问题需要一个安静的心才能回答——就像以利亚在山洞里一样，我先要你安静，然后才能说话。

把你心里真正的问题告诉我。不要包装，简简单单说一句。

「你们祈求，就给你们；寻找，就寻见；叩门，就给你们开门。」——马太福音 7:7`;
  };

  const handlePresetClick = async (question: string) => {
    if (isTyping) return;
    setInput(question);
    await handleSend();
  };

  const formatText = (text: string) => {
    let formatted = text;
    formatted = formatted.replace(/⸻ 以上基于圣经经文的灵修参考$/g, '');
    formatted = formatted.replace(/⸻ 以上基于圣经经文的灵修参考\n/g, '');
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/「(.+?)」——([^\n]+)/g, '<blockquote class="verse">$1 —— $2</blockquote>');
    formatted = formatted.replace(/⸻/g, '<hr class="divider"/>');
    formatted = formatted.split('\n\n').map(p => `<p>${p}</p>`).join('');
    return formatted;
  };

  return (
    <div className="app-root">
      <div className="sky-bg">
        <div className="stars"></div>
      </div>

      <header className="app-header">
        <div className="avatar-container">
          <div className="avatar-glow"></div>
          <div className="avatar">✝</div>
          <div className="avatar-ring"></div>
        </div>
        <h1 className="header-title">上帝</h1>
        <p className="header-sub">以圣经中上帝的口吻，陪你看清问题、给你行动指引</p>
      </header>

      <main className="app-main">
        <div className="conversation-area">
          {conversation.length === 0 && (
            <div className="intro-section">
              <p className="intro-welcome">孩子，有什么话只管对我说。</p>
            </div>
          )}

          <div className="conversation">
            {conversation.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role}`}>
                {msg.role === "user" ? (
                  <div className="msg-user">{msg.text}</div>
                ) : (
                  <div className="msg-god">
                    <div className="god-label">✦ 上帝</div>
                    <div className="god-text" dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                  </div>
                )}
              </div>
            ))}

            {(isTyping || displayText) && (
              <div className="msg-row god">
                <div className="msg-god">
                  <div className="god-label">✦ 上帝</div>
                  {displayText ? (
                    <div className="god-text" dangerouslySetInnerHTML={{ __html: formatText(displayText) }} />
                  ) : (
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {apiError && <div className="api-error">{apiError}</div>}
        </div>
      </main>

      <footer className="app-footer">
        <div className="input-row">
          <input
            className="msg-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="向上帝提问..."
            disabled={isTyping}
          />
          <button className="send-btn" onClick={handleSend} disabled={isTyping || !input.trim()}>
            ➤
          </button>
        </div>

        <div className="quick-btns">
          {PRESET_QUESTIONS.slice(0, 3).map((q) => (
            <button key={q} className="quick-btn" onClick={() => handlePresetClick(q)}>{q}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}