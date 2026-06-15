
---
# 🚀 TourGuide AI Full-Stack App

A **Multimodal RAG (Retrieval-Augmented Generation) System** built with a containerized microservices architecture:

- 💬 Multi-chat AI (ChatGPT-style)
- 🖼️ Image understanding + contextual chat
- 🧠 Semantic search using embeddings
- 💾 Persistent vector storage with ChromaDB
- 🔐 JWT Authentication
- 🗄️ MongoDB for user & chat storage
- 📡 Fully documented API (Swagger)
- 🌐 Containerized Frontend & Backend routed via Nginx

---

# ⚙️ Setup Guide (Dockerized)

The easiest and fastest way to run this entire ecosystem (Frontend, Backend, MongoDB, and ChromaDB) is by using **Docker Compose**. You don't need to install Node, MongoDB, or ChromaDB on your local host system.

## Step 1: Prerequisites

Make sure you have the following installed on your machine:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
* Git

---

## Step 2: Clone the Repository

Open your terminal or command prompt:

```bash
git clone [https://github.com/RMDilshanTharindu/tourguide](https://github.com/RMDilshanTharindu/tourguide)
cd tourguide
code .

```

---

## Step 3: Environment Setup

Create a `.env` file in the **root directory** of the project (`tourguide/`). This file sits alongside the `docker-compose.yml` file. Configure it as follows:

```env
# Database & Infrastructure URLs
MONGO_URI=mongodb://mongodb:27017/mydatabase
CHROMA_HOST=chromadb
CHROMA_PORT=8000

# Application Configurations & Secrets
PORT=3000
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key

```

👉 *Contact **Dilshan Tharindu** if you don’t have API values.*

---

## Step 4: Fire Up the Application Stack

From the project root directory where `docker-compose.yml` is located, execute the following command:

```bash
docker compose up --build

```

Docker will automatically pull the required MongoDB and ChromaDB instances, build your local frontend and backend images, link them on an isolated internal network, and boot up the system.

---

## Step 5: Accessing the Applications

Once the terminal logs settle, open your web browser to access the ecosystem:

* 🌐 **Frontend Application:** `http://localhost:3030` (or whichever port you mapped to Nginx)
* 📡 **API Documentation (Swagger UI):** `http://localhost:3030/api/api-docs`
* 🔌 **Direct Backend Access:** `http://localhost:3000`

> 💡 **Routing Tip:** Thanks to our integrated Nginx reverse proxy, all frontend routes work seamlessly (including refreshing on paths like `/admin`), and any request directed at `/api/*` is automatically forwarded directly to the backend service.

---

# 🧪 API Testing Guide (Swagger UI)

### 1️ Register

* Open `/api/api-docs`
* Locate `/auth/register`
* Provide: `username`, `email`, and `password`

### 2️ Login

* Run `/auth/login`
* Copy the returned JWT token

### 3️ Authorize

* Click **"Authorize 🔐"** (top-right of Swagger)
* Paste: `Bearer <your_token>`

### 4️ Use APIs

Now you can test protected paths securely:

* `/chat`
* `/chat/create`
* `/image-search`

---

# 🛠️ Git & Workflow Rules for Developers

Make sure you are inside the **root project folder (`tourguide/`)**, **NOT** inside `frontend/` or `backend/`, before executing Git commands.

### 🔀 Before starting work

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-branch

```

### 💾 After finishing work

```bash
git add .
git commit -m "feat: description of changes matching conventional commits"
git push origin feature/your-feature-branch

```

### ❗ Important Rules

* ❌ **Do NOT commit your local `.env` file.** It is already ignored in git, keep it that way.
* ❌ Do NOT run Git commands inside sub-folders (`frontend/` or `backend/`).
* ❌ Do NOT modify backend configurations or runtime structures unless instructed.
* ✅ Always build/test locally using `docker compose up --build` before submitting code.

---

# 🧭 System Architecture

* **Web Proxy & Server**: Nginx (serving static files and routing API calls)
* **LLM / Embedding Engine**: Gemini API (`@google/genai`)
* **Vector Database**: ChromaDB (isolated service)
* **Database**: MongoDB (persistent volumes mapped locally)
* **Backend Runtime**: Node.js + Express
* **Frontend Runtime**: Single Page Application (SPA)

---

# 👤 Authors

**Dilshan Tharindu**
**Sahan Kiridena**
**Sidath Wasala**
**Senith Karunarathna**
**Madushaka Thilakarathna**

---

# 📊 Status

✅ Architecture Dockerized & Containerized
✅ Multi-container Networking Setup Complete
🚧 Continuous UI/UX and algorithmic improvements ongoing...


