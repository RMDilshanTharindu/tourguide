import { useState } from "react";
import axios from "axios";
import "./App.css";

// SVG Icons
const ClockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const DocIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const UploadIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const LoginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const RegisterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ViewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SmallDocIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

function App() {
  const API = "http://localhost:5000";

  const [page, setPage] = useState("auth");
  const [isRegister, setIsRegister] = useState(false);

  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");

  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    try {
      await axios.post(`${API}/api/users/register`, {
        name: email, // Using email as username for demo based on inputs
        email,
        password,
      });

      alert("Registration successful. Now login.");
      setIsRegister(false);
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API}/api/users/login`, {
        email,
        password,
      });

      setToken(res.data.token);
      setPage("dashboard");
    } catch {
      alert("Login failed");
    }
  };

  const uploadFile = async () => {
    try {
      if (!file) return alert("Please choose a file first");

      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`${API}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("File uploaded successfully");
      setFile(null);
      getFiles();
    } catch (error) {
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const getFiles = async () => {
    try {
      const res = await axios.get(`${API}/api/upload`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFiles(res.data);
      setPage("files");
    } catch {
      alert("Failed to load files");
    }
  };

  const deleteFile = async (id) => {
    try {
      await axios.delete(`${API}/api/upload/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("File deleted");
      getFiles();
    } catch {
      alert("Delete failed");
    }
  };

  const searchFiles = async () => {
    try {
      if (!query) return alert("Please enter search text");

      setLoading(true);

      const res = await axios.post(
        `${API}/api/search`,
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnswer(res.data.answer);
      setSearchResults(res.data.results);
    } catch {
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken("");
    setFiles([]);
    setSearchResults([]);
    setAnswer("");
    setPage("auth");
  };

  if (page === "auth") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo-circle">
            <ClockIcon />
          </div>

          <h1>{isRegister ? "Register" : "Admin"}</h1>
          <p className="subtitle">
            {isRegister ? "Create a new admin account" : "Manage our shared legacy"}
          </p>

          <div className="input-group">
            <label>Username</label>
            <input
              placeholder={isRegister ? "e.g. example@test.com" : "admin_name"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>{isRegister ? "Password" : "Password"}</label>
            <input
              type="password"
              placeholder={isRegister ? "Create a strong password" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <div className="input-group">
              <label>Secret</label>
              <input
                placeholder="Authorization Secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
          )}

          <button className="black-btn" onClick={isRegister ? register : login}>
            {isRegister ? (
              <>
                <RegisterIcon /> Register
              </>
            ) : (
              <>
                <LoginIcon /> Login
              </>
            )}
          </button>

          <div className="switch-text">
            {isRegister ? "Already have an account? " : ""}
            <span onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Login" : "Register"}
            </span>
          </div>

          <div className="footer-text">
            HERITAGE PRESERVATION SYSTEMS • EST. 2026
          </div>
        </div>
      </div>
    );
  }

  if (page === "files") {
    return (
      <div className="dashboard-page">
        <div className="mobile-card no-pad">
          <div className="panel-header">
            <div>
              <h1>Uploaded Assets</h1>
              <p>Archived records</p>
            </div>
            <div className="shield">
              <ShieldIcon />
            </div>
          </div>

          <div className="card-body">
            {files.length === 0 ? (
              <div className="empty-files">
                <DocIcon />
                <p>No files uploaded yet</p>
              </div>
            ) : (
              <div className="file-list">
                {files.map((f) => (
                  <div className="file-item" key={f._id}>
                    <div className="file-info">
                      <div className="file-icon-small">
                        <SmallDocIcon />
                      </div>
                      <h3>{f.filename}</h3>
                    </div>
                    <button className="delete-btn" onClick={() => deleteFile(f._id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 'auto' }}>
              <div className="divider"></div>
              <button className="black-btn" onClick={() => setPage("dashboard")}>
                Back to Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="mobile-card no-pad">
        <div className="panel-header">
          <div>
            <h1>Admin Panel</h1>
            <p>System Operations</p>
          </div>
          <div className="shield">
            <ShieldIcon />
          </div>
        </div>

        <div className="card-body">
          <div className="upload-box" onClick={() => document.getElementById('file-upload').click()}>
            <input
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <div>
              <div className="upload-icon">
                <UploadIcon />
              </div>
              <h2>{file ? file.name : "Upload a file"}</h2>
              <p>{file ? "Ready to ingest" : ".png/.jpg formats only"}</p>
            </div>
          </div>

          <button className="gold-btn" onClick={uploadFile}>
            {loading ? "Processing..." : "Upload & Ingest"}
          </button>

          {/* Optional: Add search feature inside here if needed or hide it */}
          {/* We hide the search card in this view to match screenshots strictly */}

          <div style={{ marginTop: 'auto' }}>
            <div className="divider"></div>
            <div className="two-buttons">
              <button className="outline-btn" onClick={getFiles}>
                View Files
              </button>
              <button className="outline-btn" onClick={logout}>
                <LogoutIcon /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;