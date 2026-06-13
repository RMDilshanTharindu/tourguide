import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "./Explore.css";

export default function Explore({ onAskMore }) {
  const { authFetch } = useAuth();
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const inputRef = useRef();

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.match(/image\/(jpeg|jpg|png)/)) {
      setError("Please upload a JPEG or PNG image.");
      return;
    }
    setError(null);
    setResult(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(null); };

  const identify = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await authFetch("/api/image-search", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Identification failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAskMore = async () => {
    if (!result?.identifiedSubject) return;
    setCreatingChat(true);
    try {
      // 1. Create a new chat
      const createRes = await authFetch("/api/chat/create", { method: "POST" });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Failed to create chat");
      const chatId = createData.chatId;

      // 2. Set image context on that chat
      await authFetch(`/api/chat/${chatId}/image-context`, {
        method: "POST",
        body: JSON.stringify({ imageContext: result.identifiedSubject }),
      });

      // 3. Navigate to chat
      onAskMore(chatId, result.identifiedSubject);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <div className="explore">
      <div className="explore-hero">
        <p className="explore-eyebrow">Multimodal AI · Sri Lanka</p>
        <h1 className="explore-h1">What are you looking at?</h1>
        <p className="explore-sub">
          Upload a photo of any landmark. The AI identifies it and tells you everything about it.
        </p>
      </div>

      {!result && (
        <>
          <div
            className={`dropzone ${dragging ? "drag" : ""} ${preview ? "has-img" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
            onClick={() => !preview && inputRef.current.click()}
          >
            {preview ? (
              <div className="preview-wrap">
                <img src={preview} alt="Preview" className="preview-img" />
                <button className="preview-clear" onClick={(e) => { e.stopPropagation(); reset(); }}>✕</button>
              </div>
            ) : (
              <div className="dz-content">
                <div className="dz-icon">↑</div>
                <p className="dz-label">Drop an image here</p>
                <p className="dz-hint">or click to browse · JPEG / PNG</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files[0])} />
          </div>

          {error && <p className="error-msg" style={{ marginBottom: "1rem" }}>{error}</p>}

          {file && !loading && (
            <button className="btn-primary identify-btn" onClick={identify}>
              Identify this place
            </button>
          )}

          {loading && (
            <div className="loading-row">
              <span className="spinner" />
              <span>Analysing image…</span>
            </div>
          )}
        </>
      )}

      {result && (
        <div className="result-card fade-up">
          <div className="result-top">
            {preview && <img src={preview} alt="Uploaded" className="result-thumb" />}
            <div>
              <p className="result-topic">{result.topic || result.identifiedSubject}</p>
              <p className="result-subject">{result.identifiedSubject}</p>
            </div>
          </div>
          <div className="result-body">
            <p>{result.data?.response || result.response || "No description returned."}</p>
          </div>
          <div className="result-actions">
            <button className="btn-primary" onClick={handleAskMore} disabled={creatingChat}>
              {creatingChat && <span className="spinner" style={{ borderTopColor: "#fff", width: 14, height: 14 }} />}
              {creatingChat ? "Opening chat…" : "Ask more about this →"}
            </button>
            <button className="btn-ghost" onClick={reset}>Try another image</button>
          </div>
          {error && <p className="error-msg" style={{ margin: "0.75rem 1.25rem 1rem" }}>{error}</p>}
        </div>
      )}

      <div className="landmark-examples">
        <p className="ex-label">Great places to try</p>
        <div className="ex-chips">
          {["Sigiriya", "Temple of the Tooth", "Galle Fort", "Adam's Peak", "Polonnaruwa", "Dambulla Cave Temple"].map(n => (
            <span key={n} className="ex-chip">{n}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
