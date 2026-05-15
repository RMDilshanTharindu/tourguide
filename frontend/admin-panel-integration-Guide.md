# TourGuide AI Backend – Admin Integration Guide (v2.1.0)

This guide covers the integration for the **Admin Dashboard**, allowing authorized staff to manage the knowledge base through document uploads and automated RAG (Retrieval-Augmented Generation) ingestion.

---

# 🚀 ADMIN AUTHENTICATION FLOW

Admin routes are separated from regular user routes to ensure high security and isolation of administrative actions.

```text
Base URL: http://localhost:3000/api/admin
Auth: Bearer Token (JWT) required for all /upload-and-ingest actions.
```

---

# 1. ADMIN ONBOARDING & ACCESS

---

## Scenario 1: Registering a New Admin
**Behavior:** A developer or lead admin creates a new administrative account using a system-wide secret key.

### API Flow:
```text
POST /api/admin/auth/register
```
**Request Body:**
```json
{
  "username": "admin_user",
  "password": "securepassword123",
  "secret": "your_system_admin_secret" 
}
```
> **Note:** The `secret` must match the `ADMIN_SECRET` defined in the server's `.env` file.

---

## Scenario 2: Admin Login
**Behavior:** Admin logs in to receive a privileged JWT token valid for 24 hours.

### API Flow:
```text
POST /api/admin/auth/login
```
**Request Body:**
```json
{
  "username": "admin_user",
  "password": "securepassword123"
}
```
**Response:** `{"token": "eyJhbG..."}` (Store this in `localStorage` or `sessionStorage` as the Admin Token)

---

# 2. DATA MANAGEMENT (RAG INGESTION)

---

## Scenario 3: Uploading Documents for AI Training
**Behavior:** Admin uploads a new travel guide or document. The system saves the file and immediately triggers the ingestion script to update the vector database.

### API Flow:
```text
POST /api/admin/upload-and-ingest
Header: Authorization: Bearer <ADMIN_TOKEN>
```

### Request (multipart/form-data):
| Key  | Type | Value         |
| ---- | ---- | ------------- |
| file | file | [Document.pdf / .txt] |

### Expected Behavior:
1. **Validation:** Server checks the JWT.
2. **Storage:** File is saved to the `/backend/uploads` directory.
3. **Ingestion:** The RAG pipeline parses the new file, creates embeddings, and updates the vector store.
4. **Response:** 
```json
{
  "message": "File uploaded and ingestion completed successfully!",
  "file": "1777604930102-sri_dalada_maligawa.txt"
}
```

---

# 🛠 ADMIN SYSTEM SUMMARY

| Action | API Path | Requirement | Purpose |
| :--- | :--- | :--- | :--- |
| **Register** | `/auth/register` | `ADMIN_SECRET` | Create admin identity |
| **Login** | `/auth/login` | Credentials | Obtain Admin JWT |
| **Ingest** | `/upload-and-ingest`| Admin JWT + File | Update AI Knowledge |

---

# ⚠️ CRITICAL RULES FOR ADMIN FRONTEND

### 1. Token Distinction
Do not confuse User JWTs with Admin JWTs. Admin tokens contain specific IDs that grant access to the ingestion engine. If an Admin token is used on a user route, it will work (as admins are users), but a User token **will not** work on admin routes.

### 2. File Constraints
* **Format:** Primarily supports `.txt` and `.pdf` (depending on your `ingest.js` configuration).
* **Size:** Standard `multer` limits apply (default is usually ~5MB unless configured otherwise).

### 3. Ingestion Latency
The `/upload-and-ingest` route is **synchronous**. The request will stay "pending" until the ingestion process is finished. 
* **Frontend Tip:** Display a "Processing/Training AI..." loading spinner to the admin while waiting for the response.

---

# ADMIN UI SUGGESTIONS

### 📊 Dashboard Home
* Display a status indicator: **"Knowledge Base: Up to Date"**.
* Show a list of "Recently Uploaded Documents".

### 📤 Upload Zone
* **UI Component:** A Drag-and-Drop file uploader.
* **Security:** A "Logout" button that clears the Admin JWT and redirects to the Admin Login page.

### ⚙️ System Logs
* Display a console-like output window to show success/error messages returned from the ingestion trigger.