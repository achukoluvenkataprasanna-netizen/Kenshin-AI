import { useEffect, useState } from "react";
import { Activity, Bot, Gamepad2, Github, LoaderCircle, Send, ShieldCheck, Sparkles, Wifi } from "lucide-react";

type Message = { role: "assistant" | "user"; text: string };

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const features = [
  { icon: Bot, title: "AI chat", detail: "Gemini-powered answers with conversation context", status: "First module" },
  { icon: Gamepad2, title: "Games", detail: "Chess and original mini-games", status: "Planned" },
  { icon: Wifi, title: "Connectors", detail: "Secure, authorized API links", status: "Planned" },
];

export default function App() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [status, setStatus] = useState("Checking AI service…");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hello. I'm Kenshin. Send me a question and I'll answer using my AI brain when the secure backend is configured." }
  ]);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Backend unavailable");
        return response.json();
      })
      .then((data) => {
        setAiReady(Boolean(data.ai_configured));
        setStatus(data.ai_configured ? "AI service ready" : "API key needed");
      })
      .catch(() => setStatus("Backend not connected"));
  }, []);

  async function sendMessage() {
    const value = message.trim();
    if (!value || busy) return;
    const nextMessages = [...messages, { role: "user" as const, text: value }];
    setMessages(nextMessages);
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-12).map((item) => ({
            role: item.role,
            content: item.text,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Kenshin couldn't answer. Please try again.");
      setMessages((items) => [...items, { role: "assistant", text: data.reply }]);
      setAiReady(true);
      setStatus("AI service ready");
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Network error. Check your connection and try again.";
      setMessages((items) => [...items, { role: "assistant", text: `I couldn't reach my AI brain: ${reason}` }]);
    } finally {
      setBusy(false);
    }
  }

  return <main className="shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><Bot size={23} /></span><span>KENSHIN<span className="accent">.AI</span><small>PERSONAL INTELLIGENCE</small></span></a>
      <a className="github-link" href="https://github.com/achukoluvenkataprasanna-netizen/Kenshin-AI" target="_blank" rel="noreferrer" aria-label="Open GitHub"><Github size={20}/></a>
    </header>

    <section className="hero">
      <div className="eyebrow"><span className="pulse"/> KENSHIN CORE · AI ASSISTANT</div>
      <h1>Your world.<br/><span>Your intelligence.</span></h1>
      <p>A personal assistant with a real AI connection and room to grow.</p>
      <div className="hero-meta"><span><ShieldCheck size={15}/> API key protected by backend</span><span><Activity size={15}/> {status}</span></div>
    </section>

    <section className="workspace">
      <div className="section-heading"><div><span className="kicker">01 / ASSISTANT</span><h2>Talk to Kenshin</h2></div><span className={`demo-tag ${aiReady ? "ready-tag" : ""}`}>{aiReady ? "AI READY" : "SETUP REQUIRED"}</span></div>
      <div className="chat-panel">
        <div className="chat-head"><span className="avatar"><Sparkles size={17}/></span><div><b>Kenshin</b><small>OpenRouter AI · Secure backend</small></div><span className={`online ${aiReady ? "" : "offline"}`}>● {aiReady ? "Ready" : "Setup"}</span></div>
        <div className="messages" aria-live="polite">{messages.map((item, index) => <div className={`message ${item.role}`} key={index}>{item.text}</div>)}{busy && <div className="message assistant typing"><LoaderCircle size={15}/> Kenshin is thinking…</div>}</div>
        <form className="composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask Kenshin anything..." aria-label="Message Kenshin" disabled={busy}/>
          <button type="submit" aria-label="Send message" disabled={!message.trim() || busy}><Send size={18}/></button>
        </form>
        <p className="disclaimer">{busy ? "Generating a response…" : aiReady ? "Connected to Gemini through the secure backend" : "Add an OpenRouter API key and deploy the backend to activate live answers"}</p>
      </div>
    </section>

    <section className="workspace feature-section">
      <div className="section-heading"><div><span className="kicker">02 / CAPABILITIES</span><h2>Built to expand</h2></div></div>
      <div className="feature-grid">{features.map(({icon: Icon, title, detail, status}) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={20}/></span><h3>{title}</h3><p>{detail}</p><span className="planned">{status}</span></article>)}</div>
    </section>

    <footer><span><ShieldCheck size={15}/> Your API key stays server-side</span><span>KENSHIN AI · v0.2.0</span></footer>
  </main>;
}
