import { useEffect, useState } from "react";
import { Activity, Bot, Gamepad2, Github, LoaderCircle, Send, ShieldCheck, Sparkles, Wifi } from "lucide-react";

type Provider = "openrouter" | "ollama_cloud" | "ollama_local";
type Message = { role: "assistant" | "user"; text: string };

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const providerNames: Record<Provider, string> = {
  openrouter: "OpenRouter",
  ollama_cloud: "Ollama Cloud",
  ollama_local: "Ollama Local",
};
const defaultModels: Record<Provider, string> = {
  openrouter: "openrouter/free",
  ollama_cloud: "gemma4:31b",
  ollama_local: "gemma4:e2b",
};
const features = [
  { icon: Bot, title: "Multi-brain AI", detail: "Switch between OpenRouter, Ollama Cloud and your own Ollama server", status: "Core module" },
  { icon: Gamepad2, title: "Games", detail: "Chess and original mini-games", status: "Planned" },
  { icon: Wifi, title: "Connectors", detail: "Secure, authorized API links", status: "Planned" },
];

export default function App() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<Provider>("openrouter");
  const [model, setModel] = useState(defaultModels.openrouter);
  const [providerStatus, setProviderStatus] = useState<Record<Provider, boolean>>({
    openrouter: false, ollama_cloud: false, ollama_local: false,
  });
  const [status, setStatus] = useState("Checking AI service…");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hello. I'm Kenshin. Choose an AI brain and send me a question." }
  ]);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Backend unavailable");
        return response.json();
      })
      .then((data) => {
        setProviderStatus({
          openrouter: Boolean(data.providers?.openrouter),
          ollama_cloud: Boolean(data.providers?.ollama_cloud),
          ollama_local: Boolean(data.providers?.ollama_local),
        });
        setStatus("Backend connected · choose an available brain");
      })
      .catch(() => setStatus("Backend not connected"));
  }, []);

  function changeProvider(next: Provider) {
    setProvider(next);
    setModel(defaultModels[next]);
  }

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
          provider,
          model: model.trim(),
          messages: nextMessages.slice(-12).map((item) => ({ role: item.role, content: item.text })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Kenshin couldn't answer. Please try again.");
      setMessages((items) => [...items, { role: "assistant", text: data.reply }]);
      setStatus(`Reply from ${providerNames[provider]} · ${data.model || model}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Network error. Check your connection and try again.";
      setMessages((items) => [...items, { role: "assistant", text: `I couldn't reach ${providerNames[provider]}: ${reason}` }]);
    } finally {
      setBusy(false);
    }
  }

  const activeReady = providerStatus[provider];

  return <main className="shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><Bot size={23} /></span><span>KENSHIN<span className="accent">.AI</span><small>PERSONAL INTELLIGENCE</small></span></a>
      <a className="github-link" href="https://github.com/achukoluvenkataprasanna-netizen/Kenshin-AI" target="_blank" rel="noreferrer" aria-label="Open GitHub"><Github size={20}/></a>
    </header>

    <section className="hero">
      <div className="eyebrow"><span className="pulse"/> KENSHIN CORE · AI ASSISTANT</div>
      <h1>Your world.<br/><span>Your intelligence.</span></h1>
      <p>A personal assistant with three selectable AI brain routes.</p>
      <div className="hero-meta"><span><ShieldCheck size={15}/> Provider keys stay on backend</span><span><Activity size={15}/> {status}</span></div>
    </section>

    <section className="workspace">
      <div className="section-heading"><div><span className="kicker">01 / ASSISTANT</span><h2>Talk to Kenshin</h2></div><span className="demo-tag">MULTI-BRAIN</span></div>
      <div className="chat-panel">
        <div className="chat-head"><span className="avatar"><Sparkles size={17}/></span><div><b>Kenshin</b><small>{providerNames[provider]} · secure backend</small></div><span className={`online ${activeReady ? "" : "offline"}`}>● {activeReady ? "Configured" : "Needs setup"}</span></div>
        <div className="brain-controls">
          <label htmlFor="brain-provider">AI brain</label>
          <select id="brain-provider" value={provider} onChange={(event) => changeProvider(event.target.value as Provider)}>
            <option value="openrouter">OpenRouter</option>
            <option value="ollama_cloud">Ollama Cloud</option>
            <option value="ollama_local">Ollama Local</option>
          </select>
          <label htmlFor="brain-model">Model name</label>
          <input id="brain-model" value={model} onChange={(event) => setModel(event.target.value)} placeholder="Enter model name" />
          <small>Defaults are starting suggestions. The model must be available on the selected provider.</small>
        </div>
        <div className="messages" aria-live="polite">{messages.map((item, index) => <div className={`message ${item.role}`} key={index}>{item.text}</div>)}{busy && <div className="message assistant typing"><LoaderCircle size={15}/> Kenshin is thinking…</div>}</div>
        <form className="composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask Kenshin anything..." aria-label="Message Kenshin" disabled={busy}/>
          <button type="submit" aria-label="Send message" disabled={!message.trim() || busy}><Send size={18}/></button>
        </form>
        <p className="disclaimer">{busy ? "Generating a response…" : activeReady ? `Selected brain: ${providerNames[provider]}` : "Configure this provider's backend secret or local Ollama connection to use it."}</p>
      </div>
    </section>

    <section className="workspace feature-section">
      <div className="section-heading"><div><span className="kicker">02 / CAPABILITIES</span><h2>Built to expand</h2></div></div>
      <div className="feature-grid">{features.map(({icon: Icon, title, detail, status}) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={20}/></span><h3>{title}</h3><p>{detail}</p><span className="planned">{status}</span></article>)}</div>
    </section>

    <footer><span><ShieldCheck size={15}/> AI keys stay server-side</span><span>KENSHIN AI · v0.4.0</span></footer>
  </main>;
}
