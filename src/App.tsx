import { useState } from "react";
import { Activity, Bot, Gamepad2, Github, Mic, Send, ShieldCheck, Sparkles, Volume2, Wifi } from "lucide-react";

type Message = { role: "assistant" | "user"; text: string };

const features = [
  { icon: Mic, title: "Voice", detail: "Speech input and spoken replies", status: "Planned" },
  { icon: Gamepad2, title: "Games", detail: "Chess and original mini-games", status: "Planned" },
  { icon: Wifi, title: "Connectors", detail: "Secure, authorized API links", status: "Planned" },
];

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hello. I'm Kenshin — your assistant prototype. My live AI connection is not configured yet, but the foundation is ready." }
  ]);

  function sendMessage() {
    const value = message.trim();
    if (!value) return;
    setMessages((items) => [...items, { role: "user", text: value }, {
      role: "assistant",
      text: "I received your message. Live AI responses will be enabled when we connect a secure backend and AI provider."
    }]);
    setMessage("");
  }

  return <main className="shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><Bot size={23} /></span><span>KENSHIN<span className="accent">.AI</span><small>PERSONAL INTELLIGENCE</small></span></a>
      <a className="github-link" href="https://github.com/achukoluvenkataprasanna-netizen/Kenshin-AI" target="_blank" rel="noreferrer" aria-label="Open GitHub"><Github size={20}/></a>
    </header>

    <section className="hero">
      <div className="eyebrow"><span className="pulse"/> SYSTEM ONLINE · PROTOTYPE</div>
      <h1>Your world.<br/><span>Your intelligence.</span></h1>
      <p>A personal assistant foundation built to grow with you.</p>
      <div className="hero-meta"><span><ShieldCheck size={15}/> Private-by-design foundation</span><span><Activity size={15}/> Early access build</span></div>
    </section>

    <section className="workspace">
      <div className="section-heading"><div><span className="kicker">01 / ASSISTANT</span><h2>Talk to Kenshin</h2></div><span className="demo-tag">DEMO MODE</span></div>
      <div className="chat-panel">
        <div className="chat-head"><span className="avatar"><Sparkles size={17}/></span><div><b>Kenshin</b><small>Assistant prototype</small></div><span className="online">● Ready</span></div>
        <div className="messages">{messages.map((item, index) => <div className={`message ${item.role}`} key={index}>{item.text}</div>)}</div>
        <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message Kenshin..." aria-label="Message Kenshin"/>
          <button type="submit" aria-label="Send message" disabled={!message.trim()}><Send size={18}/></button>
        </form>
        <p className="disclaimer">Demo replies only · AI provider not connected</p>
      </div>
    </section>

    <section className="workspace feature-section">
      <div className="section-heading"><div><span className="kicker">02 / CAPABILITIES</span><h2>Built to expand</h2></div></div>
      <div className="feature-grid">{features.map(({icon: Icon, title, detail, status}) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={20}/></span><h3>{title}</h3><p>{detail}</p><span className="planned">{status}</span></article>)}</div>
    </section>

    <footer><span><Volume2 size={15}/> Voice support planned</span><span>KENSHIN AI · v0.1.0</span></footer>
  </main>;
}
