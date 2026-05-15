
---
# 🚀 TourGuide AI Backend

A **Multimodal RAG (Retrieval-Augmented Generation) System** with:

- 💬 Multi-chat AI (ChatGPT-style)
- 🖼️ Image understanding + contextual chat
- 🧠 Semantic search using embeddings
- 💾 Persistent vector storage with ChromaDB
- 🔐 JWT Authentication
- 🗄️ MongoDB for user & chat storage
- 📡 Fully documented API (Swagger)

---

# ⚙️ Setup Guide

##  Step 1: Clone Repository

Open CMD:

```bash
git clone https://github.com/RMDilshanTharindu/tourguide
cd tourguide
code .
````

---

## Step 2: Install Backend Dependencies

Open terminal in VS Code:

```bash
cd backend
npm install
```

---

## Step 3: Environment Setup

Create a `.env` file inside `backend/` and configure:

```
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key
```

👉 Contact **Dilshan Tharindu** if you don’t have values.

---

##  Step 4: Run MongoDB

Open a new terminal (CMD):

```bash
mongod
```

---

##  Step 5: Run ChromaDB

###  Option 1: Using Docker (Recommended)

```bash
docker run -p 8000:8000 chromadb/chroma
```

---

###  Option 2: Without Docker

```bash
pip install chromadb
chroma run --host localhost --port 8000
```

---

##  Step 6: Start Backend Server

Back to VS Code terminal:

```bash
node server.js
```

---

##  Step 7: Open API Documentation

Go to:

```
http://localhost:3000/api-docs
```

---

# 🧪 API Testing Guide (Swagger UI)

### 1️ Register

* Open `/auth/register`
* Provide:

  * username
  * email
  * password

---

### 2️ Login

* Open `/auth/login`
* Copy the returned token

---

### 3️ Authorize

* Click **"Authorize 🔐"** (top-right)
* Paste:

```
Bearer <your_token>
```

---

### 4️ Use APIs

Now you can access:

* `/chat`
* `/chat/create`
* `/chat/{chatId}`
* `/image-search`

---

#  Frontend Integration Guide

👉 Refer to the guide inside:

```
/frontend/
```

---

## ⚠️ Important Instructions for Frontend Developers

 Make sure you are inside the **root project folder (`tourguide/`)**, NOT inside `frontend/` or `backend/`, before running Git commands.

---

### 🔀 Before starting work

```bash
git checkout -b your-feature-branch
````

---

### 💾 After finishing work

```bash
git add .
git commit -m "your message"
git push origin your-feature-branch
```

---

### 🔄 Merge your work into main

```bash
git checkout main
git pull origin main
git merge your-feature-branch
git push origin main
```

---

### ❗ Notes

* ❌ Do NOT run Git commands inside `frontend/` or `backend/` folders
* ❌ Do NOT modify backend code unless instructed
* ✅ Always create a new branch for your work
* ✅ Keep your branch names meaningful (e.g., `feature/chat-ui`, `fix/login-form`)

---

### ❗ Important Rules

*  Do NOT modify backend code
*  Follow API documentation strictly
*  Use Bearer token for all protected routes

---

#  System Architecture

* **LLM**: Gemini API
* **Vector DB**: ChromaDB
* **Database**: MongoDB
* **Backend**: Node.js + Express
* **Auth**: JWT

---

#  Features

* Multi-chat system (chatId-based)
* Persistent chat history
* Image → context → chat flow
* RAG-based response generation
* Secure API access

---

#  Author

**Dilshan Tharindu**

---

#  Status

✅ Production-ready backend
🚧 Continuous improvements ongoing....

