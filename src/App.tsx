import { useEffect, useMemo, useState } from "react";
import { Activity, Bot, Gamepad2, Github, LoaderCircle, Send, ShieldCheck, Sparkles, Wifi, Mic, MicOff, Volume2, VolumeX, RotateCcw, Crown, Puzzle } from "lucide-react";

type Provider = "openrouter" | "ollama_cloud" | "ollama_local";
type Message = { role: "assistant" | "user"; text: string };
type SpeechRecognitionResultLike = { [index: number]: { transcript: string } };
type SpeechRecognitionLike = { lang: string; interimResults: boolean; onresult: ((event: { results: SpeechRecognitionResultLike[] }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type WindowWithSpeech = Window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const providerNames: Record<Provider, string> = { openrouter: "OpenRouter", ollama_cloud: "Ollama Cloud", ollama_local: "Ollama Local" };
const defaultModels: Record<Provider, string> = { openrouter: "openrouter/free", ollama_cloud: "gemma4:31b", ollama_local: "gemma4:e2b" };
const starterPrompts = [
  "Help me plan a productive day",
  "Explain a difficult topic simply",
  "Give me a Brookhaven RP house roleplay idea",
  "Teach me a chess opening for beginners",
];

function directChat(provider: Provider, key: string, localUrl: string, model: string, messages: Message[]) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let url = "";
  let body: Record<string, unknown>;
  if (provider === "openrouter") {
    url = "https://openrouter.ai/api/v1/chat/completions";
    headers.Authorization = `Bearer ${key}`;
    body = { model, messages, temperature: 0.7, max_tokens: 1200 };
  } else if (provider === "ollama_cloud") {
    url = "https://ollama.com/api/chat";
    headers.Authorization = `Bearer ${key}`;
    body = { model, messages, stream: false };
  } else {
    url = `${localUrl.replace(/\/$/, "")}/api/chat`;
    body = { model, messages, stream: false };
  }
  return fetch(url, { method: "POST", headers, body: JSON.stringify(body) }).then(async response => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || data.error?.message || `Provider returned HTTP ${response.status}`);
    const reply = provider === "openrouter" ? data.choices?.[0]?.message?.content : data.message?.content;
    if (!reply) throw new Error("The provider returned an empty reply.");
    return String(reply);
  });
}

function TicTacToe() {
  const [cells, setCells] = useState<(string | null)[]>(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const winner = useMemo(() => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,b,c] of lines) if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
    return null;
  }, [cells]);
  const draw = !winner && cells.every(Boolean);
  function play(index: number) {
    if (cells[index] || winner || draw) return;
    const next = [...cells]; next[index] = turn; setCells(next); setTurn(turn === "X" ? "O" : "X");
  }
  function reset() { setCells(Array(9).fill(null)); setTurn("X"); }
  return <div className="game-card"><div className="game-title"><b>Tic-tac-toe</b><span>{winner ? `${winner} wins!` : draw ? "It's a draw" : `Turn: ${turn}`}</span></div><div className="ttt-board">{cells.map((cell, i) => <button key={i} onClick={() => play(i)} aria-label={`Square ${i + 1}`}>{cell}</button>)}</div><button className="secondary-btn" onClick={reset}><RotateCcw size={15}/> New game</button></div>;
}

function MemoryGame() {
  const [deck, setDeck] = useState(["🚀","🌙","🐉","⚡","🎮","🪐","🚀","🌙","🐉","⚡","🎮","🪐"].sort(() => Math.random() - .5));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  function flip(i: number) {
    if (open.length === 2 || open.includes(i) || matched.includes(i)) return;
    const next = [...open, i]; setOpen(next);
    if (next.length === 2 && deck[next[0]] === deck[next[1]]) { setMatched(old => [...old, ...next]); setOpen([]); }
    else if (next.length === 2) window.setTimeout(() => setOpen([]), 750);
  }
  function reset() { setDeck(["🚀","🌙","🐉","⚡","🎮","🪐","🚀","🌙","🐉","⚡","🎮","🪐"].sort(() => Math.random() - .5)); setOpen([]); setMatched([]); }
  return <div className="game-card"><div className="game-title"><b>Memory match</b><span>{matched.length / 2} / 6 pairs</span></div><div className="memory-board">{deck.map((item, i) => <button key={i} onClick={() => flip(i)}>{open.includes(i) || matched.includes(i) ? item : "?"}</button>)}</div><button className="secondary-btn" onClick={reset}><RotateCcw size={15}/> Restart</button></div>;
}

export default function App() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<Provider>("openrouter");
  const [model, setModel] = useState(defaultModels.openrouter);
  const [apiKey, setApiKey] = useState("");
  const [localUrl, setLocalUrl] = useState("http://127.0.0.1:11434");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Hey, Boss. I'm Kenshin. My cloud brain can connect directly from this phone once you add your provider key." }]);
  const [status, setStatus] = useState("Ready · no Render server required for direct cloud mode");
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [activeTab, setActiveTab] = useState<"assistant" | "games" | "roblox" | "connectors">("assistant");
  const [robloxGame, setRobloxGame] = useState("Brookhaven RP");
  const [robloxQuestion, setRobloxQuestion] = useState("");

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/health`).then(r => r.ok ? r.json() : Promise.reject()).then(() => setStatus("Optional Kenshin backend detected")).catch(() => setStatus("Direct phone mode · optional backend unavailable"));
  }, []);

  function speak(text: string) {
    if (!speakReplies || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  function startVoice() {
    const Speech = (window as WindowWithSpeech).SpeechRecognition || (window as WindowWithSpeech).webkitSpeechRecognition;
    if (!Speech) { setStatus("Speech recognition is not supported in this Android WebView/browser."); return; }
    const recognition = new Speech();
    recognition.lang = navigator.language || "en-IN";
    recognition.interimResults = false;
    recognition.onresult = event => { const heard = event.results[0]?.[0]?.transcript || ""; setMessage(old => old ? old + " " + heard : heard); };
    recognition.onerror = () => { setListening(false); setStatus("Microphone recognition failed. Check app microphone permission."); };
    recognition.onend = () => setListening(false);
    setListening(true); setStatus("Listening… speak now"); recognition.start();
  }

  async function sendMessage(override?: string) {
    const value = (override ?? message).trim();
    if (!value || busy) return;
    const nextMessages = [...messages, { role: "user" as const, text: value }];
    setMessages(nextMessages); setMessage(""); setBusy(true);
    try {
      const history = nextMessages.slice(-12).map(item => ({ role: item.role, content: item.text }));
      let reply: string;
      if (API_BASE) {
        const response = await fetch(`${API_BASE}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, model: model.trim(), messages: history }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Backend request failed.");
        reply = data.reply;
      } else {
        if (provider !== "ollama_local" && !apiKey.trim()) throw new Error(`Add your ${providerNames[provider]} API key above. It is kept in this app's current session only.`);
        reply = await directChat(provider, apiKey.trim(), localUrl, model.trim(), history);
      }
      setMessages(items => [...items, { role: "assistant", text: reply }]);
      setStatus(`Reply received · ${providerNames[provider]} / ${model}`);
      speak(reply);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Network error. Check your connection.";
      setMessages(items => [...items, { role: "assistant", text: `I couldn't connect: ${reason}` }]);
      setStatus("Connection needs attention");
    } finally { setBusy(false); }
  }

  function askRoblox() {
    const q = robloxQuestion.trim();
    if (!q) return;
    void sendMessage(`Act as a safe Roblox game guide. Game: ${robloxGame}. Help me with this question: ${q}. Use legitimate in-game strategies only. Do not suggest exploits, scripts, cheats, anti-cheat bypasses, account theft, or unauthorized bots.`);
    setActiveTab("assistant"); setRobloxQuestion("");
  }

  const ready = Boolean(API_BASE) || (provider === "ollama_local" ? Boolean(localUrl.trim()) : Boolean(apiKey.trim()));

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><Bot size={23}/></span><span>KENSHIN<span className="accent">.AI</span><small>PERSONAL INTELLIGENCE</small></span></a><a className="github-link" href="https://github.com/achukoluvenkataprasanna-netizen/Kenshin-AI" target="_blank" rel="noreferrer" aria-label="Open GitHub"><Github size={20}/></a></header>
    <section className="hero"><div className="eyebrow"><span className="pulse"/> KENSHIN CORE · PHONE EDITION</div><h1>Your world.<br/><span>Your intelligence.</span></h1><p>Your personal assistant, voice tools, games and Roblox guide.</p><div className="hero-meta"><span><ShieldCheck size={15}/> No Render required</span><span><Activity size={15}/> {status}</span></div></section>
    <nav className="tabs" aria-label="Kenshin sections">
      <button className={activeTab === "assistant" ? "selected" : ""} onClick={() => setActiveTab("assistant")}><Bot size={16}/> Assistant</button>
      <button className={activeTab === "games" ? "selected" : ""} onClick={() => setActiveTab("games")}><Gamepad2 size={16}/> Games</button>
      <button className={activeTab === "roblox" ? "selected" : ""} onClick={() => setActiveTab("roblox")}><Crown size={16}/> Roblox</button>
      <button className={activeTab === "connectors" ? "selected" : ""} onClick={() => setActiveTab("connectors")}><Wifi size={16}/> APIs</button>
    </nav>
    {activeTab === "assistant" && <section className="workspace"><div className="section-heading"><div><span className="kicker">01 / ASSISTANT</span><h2>Talk to Kenshin</h2></div><span className="demo-tag">MULTI-BRAIN</span></div><div className="chat-panel">
      <div className="chat-head"><span className="avatar"><Sparkles size={17}/></span><div><b>Kenshin</b><small>{providerNames[provider]} · direct phone connection</small></div><span className={ready ? "online" : "online offline"}>● {ready ? "Ready to configure" : "Needs key"}</span></div>
      <div className="brain-controls"><label htmlFor="brain-provider">AI brain</label><select id="brain-provider" value={provider} onChange={e => { const p = e.target.value as Provider; setProvider(p); setModel(defaultModels[p]); setApiKey(""); }}><option value="openrouter">OpenRouter</option><option value="ollama_cloud">Ollama Cloud</option><option value="ollama_local">Ollama Local (another device)</option></select>
      <label htmlFor="brain-model">Model name</label><input id="brain-model" value={model} onChange={e => setModel(e.target.value)} placeholder="Model name"/>
      {provider !== "ollama_local" ? <><label htmlFor="api-key">API key</label><input id="api-key" type="password" autoComplete="off" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Paste your private key here"/></> : <><label htmlFor="local-url">Ollama URL</label><input id="local-url" value={localUrl} onChange={e => setLocalUrl(e.target.value)} placeholder="http://192.168.1.10:11434"/></>}
      <small>Keys are held in memory only and cleared when the app closes. Never paste them into GitHub or chat. Direct provider calls depend on provider CORS support.</small></div>
      <div className="messages" aria-live="polite">{messages.map((item, i) => <div className={`message ${item.role}`} key={i}>{item.text}</div>)}{busy && <div className="message assistant typing"><LoaderCircle size={15}/> Kenshin is thinking…</div>}</div>
      <div className="voice-row"><button className="secondary-btn" onClick={listening ? () => setListening(false) : startVoice}>{listening ? <MicOff size={15}/> : <Mic size={15}/>} {listening ? "Listening" : "Speak"}</button><button className="secondary-btn" onClick={() => setSpeakReplies(v => !v)}>{speakReplies ? <Volume2 size={15}/> : <VolumeX size={15}/>} Voice replies {speakReplies ? "on" : "off"}</button></div>
      <form className="composer" onSubmit={e => { e.preventDefault(); void sendMessage(); }}><input value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask Kenshin anything..." aria-label="Message Kenshin" disabled={busy}/><button type="submit" aria-label="Send message" disabled={!message.trim() || busy}><Send size={18}/></button></form>
      <div className="starter-prompts">{starterPrompts.map(p => <button key={p} onClick={() => void sendMessage(p)}>{p}</button>)}</div>
      <p className="disclaimer">{busy ? "Generating…" : "For OpenRouter/Ollama Cloud, add your own key. Local Ollama needs a separate computer on the same network."}</p>
    </div></section>}
    {activeTab === "games" && <section className="workspace"><div className="section-heading"><div><span className="kicker">02 / PLAY</span><h2>Mini-games</h2></div></div><div className="game-grid"><TicTacToe/><MemoryGame/></div><div className="game-card"><div className="game-title"><b><Crown size={17}/> Chess</b><span>Chess lessons</span></div><p>Chessboard and legal-move engine are being prepared as the next game module. Ask Kenshin for opening lessons and puzzles meanwhile.</p><button className="secondary-btn" onClick={() => { setActiveTab("assistant"); void sendMessage("Teach me chess from beginner level. Start with how each piece moves and give me a small puzzle."); }}>Learn chess with Kenshin</button></div></section>}
    {activeTab === "roblox" && <section className="workspace"><div className="section-heading"><div><span className="kicker">03 / ROBLOX COMPANION</span><h2>Game guide</h2></div></div><div className="chat-panel roblox-panel"><label htmlFor="roblox-game">Choose a game</label><select id="roblox-game" value={robloxGame} onChange={e => setRobloxGame(e.target.value)}>{["Brookhaven RP","Blox Fruits","Adopt Me!","99 Nights in the Forest","Tower of Hell","Murder Mystery 2","Piggy","Royale High","Pet Simulator X","Welcome to Bloxburg"].map(g => <option key={g}>{g}</option>)}</select><label htmlFor="roblox-question">What do you need help with?</label><textarea id="roblox-question" value={robloxQuestion} onChange={e => setRobloxQuestion(e.target.value)} placeholder="Ask for strategies, roleplay ideas, beginner tips, quests..." rows={4}/><button className="primary-btn" onClick={askRoblox} disabled={!robloxQuestion.trim()}><Sparkles size={16}/> Ask Kenshin</button><p className="disclaimer">Kenshin provides fair-play guides and roleplay ideas. No cheats, exploits, account access or anti-cheat bypasses.</p></div></section>}
    {activeTab === "connectors" && <section className="workspace"><div className="section-heading"><div><span className="kicker">04 / CONNECTIVITY</span><h2>API hub</h2></div></div><div className="connector-grid">{[{name:"Weather",desc:"Forecasts and alerts",state:"Needs public data source"},{name:"Maps & transit",desc:"Places, routes and travel",state:"Needs location permission + provider"},{name:"News",desc:"Headlines and current events",state:"Needs news source"},{name:"Finance & crypto",desc:"Market data and watchlists",state:"Read-only data planned"},{name:"GitHub & developer",desc:"Repositories and coding workflows",state:"Connect authorized account"},{name:"Books, anime & games",desc:"Discovery and metadata",state:"Public catalog APIs planned"},{name:"Email & calendar",desc:"Personal productivity",state:"Requires explicit account connection"},{name:"Science, space & animals",desc:"Learning and open datasets",state:"Open data sources planned"}].map(item => <article className="feature-card" key={item.name}><span className="feature-icon"><Puzzle size={19}/></span><h3>{item.name}</h3><p>{item.desc}</p><span className="planned">{item.state}</span></article>)}</div><p className="disclaimer">Connectors will request permission before accessing personal accounts or data. Health and financial features will be informational, not professional advice.</p></section>}
    <footer><span><ShieldCheck size={15}/> Keys are not saved to source code</span><span>KENSHIN AI · PHONE EDITION</span></footer>
  </main>;
}
