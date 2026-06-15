import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Explore from "./Explore";
import ChatPage from "./ChatPage";
import "./Layout.css";

export default function Layout() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("explore");
  const [activeChatId, setActiveChatId] = useState(null);
  const [imageContext, setImageContext] = useState(null);

  const goToChat = (chatId, imgCtx) => {
    setActiveChatId(chatId);
    setImageContext(imgCtx || null);
    setPage("chat");
  };

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-inner">
          <button className="nav-logo" onClick={() => setPage("explore")}>
            <span className="nav-mark">⬡</span>
            TourGuide AI
          </button>
          <div className="nav-center">
            <button className={`nav-tab ${page === "explore" ? "active" : ""}`} onClick={() => setPage("explore")}>
              Explore
            </button>
            <button className={`nav-tab ${page === "chat" ? "active" : ""}`} onClick={() => setPage("chat")}>
              Chat
            </button>
          </div>
          <div className="nav-right">
            <span className="nav-user">{user?.username || user?.email?.split("@")[0]}</span>
            <button className="nav-logout" onClick={logout}>Sign out</button>
          </div>
        </div>
      </nav>

      <main className="layout-main">
        {page === "explore" && (
          <Explore onAskMore={goToChat} />
        )}
        {page === "chat" && (
          <ChatPage
            key={activeChatId}
            initialChatId={activeChatId}
            initialImageContext={imageContext}
            onBack={() => setPage("explore")}
          />
        )}
      </main>
    </div>
  );
}
