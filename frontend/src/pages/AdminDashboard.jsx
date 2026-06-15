import { useState, useEffect, useRef } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { logout, adminFetch } = useAdminAuth();
  const [files, setFiles] = useState([]);
  const [filesError, setFilesError] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [logs, setLogs] = useState([]);
  const inputRef = useRef();
  const consoleRef = useRef();

  useEffect(() => { fetchFiles(); }, []);

  useEffect(() => {
    consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  const log = (text, kind = "info") => {
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), text, kind }]);
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    setFilesError(null);
    try {
      const res = await adminFetch("/api/admin/files");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to load files");
      setFiles(data.files || []);
    } catch (err) {
      setFilesError(err.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  const pickFile = (f) => {
    if (!f) return;
    const ok = /\.(txt|pdf)$/i.test(f.name);
    if (!ok) {
      log(`Rejected "${f.name}" — only .txt and .pdf files are supported.`, "err");
      return;
    }
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    log(`Uploading "${file.name}"…`, "info");
    log("Processing / training AI… this may take a moment.", "info");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await adminFetch("/api/admin/upload-and-ingest", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Upload failed");
      log(`✓ ${data.message || "File uploaded and ingestion completed."}`, "ok");
      log(`Saved as: ${data.file}`, "info");
      setFile(null);
      fetchFiles();
    } catch (err) {
      log(`✗ ${err.message}`, "err");
    } finally {
      setUploading(false);
    }
  };

  const extOf = (name) => name.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <div className="admin-page">
      <nav className="admin-nav">
        <div className="admin-nav-inner">
          <div className="admin-logo">
            <span className="auth-logo-mark" style={{ width: 32, height: 32, fontSize: 15 }}>⬡</span>
            TourGuide AI · Admin
          </div>
          <button className="nav-logout" onClick={logout}>Sign out</button>
        </div>
      </nav>

      <main className="admin-main">
        <div>
          <h1 className="admin-title">Knowledge base</h1>
          <p className="admin-sub">Upload travel guides and documents to train the AI's retrieval index.</p>
        </div>

        <div className="admin-grid">
          {/* Upload card */}
          <div className="admin-card">
            <h2>Upload &amp; ingest</h2>
            <p className="admin-card-sub">Adding a document immediately re-trains the vector index. This can take a moment.</p>

            <div className="status-row">
              <span className="status-dot" />
              Knowledge base: up to date
            </div>

            <div
              className={`admin-dropzone ${dragging ? "drag" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current.click()}
            >
              <div className="admin-dz-icon">↑</div>
              <p className="admin-dz-label">Drop a document here</p>
              <p className="admin-dz-hint">or click to browse · .txt / .pdf</p>
              <input
                ref={inputRef}
                type="file"
                accept=".txt,.pdf"
                style={{ display: "none" }}
                onChange={(e) => pickFile(e.target.files[0])}
              />
            </div>

            {file && (
              <div className="admin-selected-file">
                <span>{file.name}</span>
                {!uploading && <button onClick={() => setFile(null)}>✕</button>}
              </div>
            )}

            <button className="btn-primary" onClick={upload} disabled={!file || uploading} style={{ width: "100%" }}>
              {uploading && <span className="spinner" style={{ borderTopColor: "#fff" }} />}
              {uploading ? "Processing / training AI…" : "Upload & ingest"}
            </button>
          </div>

          {/* Files card */}
          <div className="admin-card">
            <h2>Recently uploaded documents</h2>
            <p className="admin-card-sub">Files currently in the ingestion source directory.</p>

            {loadingFiles && (
              <div className="loading-row" style={{ justifyContent: "center", padding: "20px 0" }}>
                <span className="spinner" />
                <span>Loading files…</span>
              </div>
            )}

            {filesError && <p className="error-msg">{filesError}</p>}

            {!loadingFiles && !filesError && (
              <div className="admin-file-list">
                {files.length === 0 && <p className="admin-file-empty">No documents uploaded yet.</p>}
                {files.slice().reverse().map((f) => (
                  <div className="admin-file-item" key={f}>
                    <span className="admin-file-icon">{extOf(f)}</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System log */}
        <div className="admin-card">
          <h2>System log</h2>
          <p className="admin-card-sub">Output from the ingestion trigger.</p>
          <div className="admin-console" ref={consoleRef}>
            {logs.length === 0 && <p className="admin-console-empty">No activity yet.</p>}
            {logs.map((l) => (
              <p key={l.id} className={`admin-console-line ${l.kind}`}>{l.text}</p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
