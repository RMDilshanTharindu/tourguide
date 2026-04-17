# TourGuide AI Backend – Frontend Integration Guide (v2.0.0)

This backend supports **3 user interaction modes** using JWT Authentication and MongoDB persistence:

1.  **Direct Chat** (Text-only RAG & History)
2.  **Image Search** (Identification & Quick Info)
3.  **Image → Chat** (Contextual Follow-up/Conversational)

---

# 🚀 BASE URL & AUTH

```text
URL: http://localhost:3000/api
Auth: Bearer Token (JWT) required for all /chat and /image endpoints.
```

---

# 1. USER FLOW SCENARIOS

---

## Scenario 1: Direct Chat User
**Behavior:** User creates a chat room and asks questions directly without an image.

### STEP 1: Create a Chat
```text
POST /chat/create
Header: Authorization: Bearer <token>
```
**Response:** `{"success": true, "chatId": "65f1..."}` (Save this `chatId`)

### STEP 2: Send Message
```text
POST /chat/{chatId}
```
**Request Body:**
```json
{
  "message": "Tell me about Sigiriya"
}
```
**Response:**
```json
{
  "response": "Sigiriya is an ancient rock fortress...",
  "history": [...],
  "imageContext": null
}
```

---

## Scenario 2: Image Search Only
**Behavior:** User uploads an image to identify a landmark and gets a quick summary.

### API Flow:
```text
POST /image-search
Header: Authorization: Bearer <token>
```

### Request (multipart/form-data):
| Key   | Type | Value         |
| ----- | ---- | ------------- |
| image | file | [Binary File] |

### Response:
```json
{
  "success": true,
  "topic": "Sigiriya Rock Fortress",
  "identifiedSubject": "Sigiriya Rock Fortress, Sri Lanka",
  "data": { "response": "Summary text..." }
}
```

---

## Scenario 3: Image → Ask More (Multimodal Chat)
**Behavior:** User identifies an image, then enters a chat to ask deeper questions about that specific subject.

### STEP 1: Upload Image
Call `POST /image-search` as shown in Scenario 2. 
**Capture:** `identifiedSubject` from the response.

### STEP 2: Initialize Chat Context
Create a chat via `/chat/create`, then link the image subject to it.
```text
POST /chat/{chatId}/image-context
```
**Request:**
```json
{
  "imageContext": "Sigiriya Rock Fortress, Sri Lanka"
}
```

### STEP 3: Contextual Conversation
The user can now ask "How do I get there?" without repeating "Sigiriya".
```text
POST /chat/{chatId}
```
**Request:** `{"message": "How do I get there?"}`
**Response:** `{"response": "To get to Sigiriya, you can take a bus from Dambulla..."}`

---

# 🛠 SYSTEM BEHAVIOR SUMMARY

| Mode | API Sequence | Memory Type |
| :--- | :--- | :--- |
| **Direct Chat** | `/chat/create` → `/chat/{id}` | History + RAG |
| **Image Only** | `/image-search` | No Persistence |
| **Image + Chat**| `/image-search` → `/chat/{id}/image-context` → `/chat/{id}` | Image Context + History |

---

# ⚠️ IMPORTANT RULES FOR FRONTEND

### 1. JWT Persistence
The token obtained from `/auth/login` must be included in the `Authorization` header for all functional requests.

### 2. chatId vs sessionId
This API uses `chatId` (MongoDB ObjectId). Ensure the ID is passed correctly in the URL path for history and messaging.

### 3. Image Context is Sticky
Once `image-context` is set for a specific `chatId`, the AI will assume all future messages in that chat relate to that image until the chat is deleted or changed.

---

# FRONTEND DESIGN SUGGESTIONS

### 📸 Image UI
* **Button:** "Identify Landmark"
* **Action:** On success, display "Ask More about [Subject]" which redirects to the Chat Page.

### 💬 Chat UI
* **Sidebar:** Fetch all user chats using `GET /chat`.
* **Header:** If `imageContext` exists in the chat object, display a small badge: *"Chatting about: Sigiriya"*.
* **Auto-Scroll:** Use the `history` array returned in each POST to sync the UI state.

---

# BACKEND CAPABILITIES
* **JWT Auth:** Secure user registration and login.
* **Persistent Storage:** MongoDB keeps chat history and context safe across sessions.
* **Multimodal RAG:** Combines image identification with a vector knowledge base.