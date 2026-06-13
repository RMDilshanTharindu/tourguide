import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "./ChatPage.css";

export default function ChatPage({ initialChatId, initialImageContext, onBack }) {
  const { authFetch } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(initialChatId || null);
  const [messages, setMessages] = useState([]);
  const [imageContext, setImageContext] = useState(initialImageContext || null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef();
  const inputRef = useRef();

  // Load all chats for sidebar
  useEffect(() => { fetchChats(); }, []);

  // Load history when active chat changes
  useEffect(() => {
    if (activeChatId) loadHistory(activeChatId);
    else setMessages([]);
  }, [activeChatId]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const fetchChats = async () => {
    try {
      const res = await authFetch("/api/chat");
      const data = await res.json();
      if (data.success && Array.isArray(data.chats)) setChats(data.chats);
    } catch (e) { /* sidebar non-critical */ }
  };

  const loadHistory = async (chatId) => {
    setLoadingHistory(true);
    setMessages([]);
    setError(null);
    try {
      const res = await authFetch(`/api/chat/${chatId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load chat");
      setMessages(data.history || []);
      if (data.imageContext) setImageContext(data.imageContext);
      else if (chatId !== initialChatId) setImageContext(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const newChat = async () => {
    setCreatingChat(true);
    setError(null);
    try {
      const res = await authFetch("/api/chat/create", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create chat");
      setChats((prev) => [data, ...prev]);
      setActiveChatId(data.chatId);
      setImageContext(null);
      setMessages([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreatingChat(false);
    }
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg || sending || !activeChatId) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setSending(true);
    setError(null);
    try {
      const res = await authFetch(`/api/chat/${activeChatId}`, {
        method: "POST",
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      setMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
      if (data.imageContext && !imageContext) setImageContext(data.imageContext);
      // Refresh chat list to update titles
      fetchChats();
    } catch (e) {
      setMessages((prev) => [...prev, { role: "error", text: e.message }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const suggestions = imageContext
    ? ["Where is this located?", "Who built it and when?", "Best time to visit?", "How to get there from Colombo?"]
    : ["Tell me about Sigiriya", "What is Galle Fort?", "Best beaches in Sri Lanka", "Ancient cities of Sri Lanka"];

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-head">
          <button className="btn-primary new-chat-btn" onClick={newChat} disabled={creatingChat}>
            {creatingChat ? <span className="spinner" style={{ width: 14, height: 14, borderTopColor: "#fff" }} /> : "+"}
            New chat
          </button>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(false)} title="Close sidebar">‹</button>
        </div>

        <div className="chat-list">
          {chats.length === 0 && (
            <p className="chat-list-empty">No chats yet.</p>
          )}
          {chats.map((c) => (
            <button
              key={c.chatId || c._id}
              className={`chat-list-item ${(c.chatId || c._id) === activeChatId ? "active" : ""}`}
              onClick={() => setActiveChatId(c.chatId || c._id)}
            >
              <span className="cli-icon">{c.imageContext ? "⬡" : "◌"}</span>
              <span className="cli-label">
                {c.imageContext
                  ? c.imageContext.split(",")[0].slice(0, 28)
                  : c.title || "New conversation"}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="chat-main">
        <div className="chat-topbar">
          {!sidebarOpen && (
            <button className="sidebar-toggle open-btn" onClick={() => setSidebarOpen(true)} title="Open sidebar">›</button>
          )}
          <div className="chat-topbar-info">
            {imageContext && (
              <span className="ctx-badge">
                <span className="ctx-dot" /> {imageContext.split(",")[0].slice(0, 40)}
              </span>
            )}
            {!imageContext && activeChatId && (
              <span className="ctx-label">Direct chat</span>
            )}
          </div>
          {!activeChatId && (
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={onBack}>← Back to Explore</button>
          )}
        </div>

        <div className="messages">
          {!activeChatId && (
            <div className="no-chat-state">
              <p className="ncs-h">Start a conversation</p>
              <p className="ncs-sub">Create a new chat or pick one from the sidebar.</p>
              <button className="btn-primary" onClick={newChat} disabled={creatingChat}>
                {creatingChat && <span className="spinner" style={{ width: 14, height: 14, borderTopColor: "#fff" }} />}
                New chat
              </button>
            </div>
          )}

          {activeChatId && !loadingHistory && messages.length === 0 && (
            <div className="empty-state">
              <p className="es-h">
                {imageContext
                  ? `Ask about ${imageContext.split(" ").slice(0, 3).join(" ")}…`
                  : "What would you like to know?"}
              </p>
              <p className="es-sub">
                {imageContext
                  ? "You can ask follow-up questions like location, history, or visitor tips."
                  : "Ask anything about Sri Lanka's landmarks and tourism."}
              </p>
              <div className="suggestions">
                {suggestions.map((s) => (
                  <button key={s} className="suggestion-btn" onClick={() => { setInput(s); inputRef.current?.focus(); }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loadingHistory && (
            <div className="loading-center">
              <span className="spinner" />
              <span style={{ color: "var(--text2)", fontSize: 14 }}>Loading…</span>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg msg--${m.role}`}>
              {m.role === "assistant" && <div className="msg-avatar">AI</div>}
              <div className={`bubble bubble--${m.role}`}>{m.text}</div>
            </div>
          ))}

          {sending && (
            <div className="msg msg--assistant">
              <div className="msg-avatar">AI</div>
              <div className="bubble bubble--assistant typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          {error && (
            <div className="msg msg--error">
              <div className="bubble bubble--error">{error}</div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="input-bar">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={activeChatId ? "Ask a question…" : "Create or select a chat first"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={sending || !activeChatId}
          />
          <button
            className="send-btn"
            onClick={send}
            disabled={!input.trim() || sending || !activeChatId}
          >↑</button>
        </div>
        <p className="input-hint">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
