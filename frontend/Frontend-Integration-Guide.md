---

# TourGuide AI Backend – Frontend Integration Guide

This backend supports **3 user interaction modes**:

  Direct Chat (text-only RAG)
  Image Search (single response)
  Image → Chat (Ask More / conversational mode)

---

#  BASE URL

```text id="base1"
http://localhost:3000/api
```

---

# 1. USER FLOW SCENARIOS

---

## Scenario 1: Direct Chat User

### User behavior:

User opens chat and asks questions directly.

---

### API Flow:

```text id="flow1"
POST /chat
```

---

### Request:

```json id="req1"
{
  "sessionId": "user123",
  "message": "What is Sigiriya?"
}
```

---

### Response:

```json id="res1"
{
  "success": true,
  "sessionId": "user123",
  "response": "Sigiriya is an ancient rock fortress in Sri Lanka...",
  "imageContext": null,
  "history": [...]
}
```

---

###  Use Case:

* Normal chatbot usage
* No image involved

---

# Scenario 2: Image Search Only (No follow-up)

### User behavior:

User uploads image → gets answer → leaves

---

### API Flow:

```text id="flow2"
POST /image-search
```

---

### Request (form-data):

| Key   | Type | Value        |
| ----- | ---- | ------------ |
| image | file | upload image |

---

### Response:

```json id="res2"
{
  "success": true,
  "topic": "Sigiriya Rock Fortress",
  "identifiedSubject": "Sigiriya Rock Fortress in Sri Lanka",
  "data": {
    "context-about": "Sigiriya",
    "response": "Sigiriya is a UNESCO World Heritage site..."
  }
}
```

---

###  Use Case:

* Quick image explanation
* No chat continuation needed

---

# Scenario 3: Image → Ask More → Chat

### User behavior:

User uploads image → wants deeper questions

---

## STEP 1: Upload image

```text id="flow3a"
POST /image-search
```

### Response contains:

```json id="r3a"
{
  "identifiedSubject": "Sigiriya Rock Fortress in Sri Lanka",
  "response": "..."
}
```

---

## STEP 2: Click “Ask More” button

Frontend stores:

```js id="ctx1"
identifiedSubject
```

---

## STEP 3: Set image context

```text id="flow3b"
POST /chat/set-image-context
```

---

### Request:

```json id="req3b"
{
  "sessionId": "user123",
  "imageContext": "Sigiriya Rock Fortress in Sri Lanka"
}
```

---

###  Response:

```json id="res3b"
{
  "success": true,
  "message": "Image context stored",
  "imageContext": "Sigiriya Rock Fortress in Sri Lanka"
}
```

---

## STEP 4: Open Chat & Ask Questions

Now user can ask:

 “Where is it located?”
 “Who built it?”
 “Why is it famous?”

---

###  API:

```text id="flow3c"
POST /chat
```

---

###  Request:

```json id="req3c"
{
  "sessionId": "user123",
  "message": "Where is it located?"
}
```

---

###  Response:

```json id="res3c"
{
  "success": true,
  "response": "Sigiriya is located in the central Matale District of Sri Lanka...",
  "imageContext": "Sigiriya Rock Fortress in Sri Lanka",
  "history": [...]
}
```

---

#  SYSTEM BEHAVIOR SUMMARY

| Mode         | API Used                                              | Behavior                |
| ------------ | ----------------------------------------------------- | ----------------------- |
| Direct Chat  | `/chat`                                               | RAG + memory            |
| Image Only   | `/image-search`                                       | single response         |
| Image + Chat | `/image-search` → `/chat/set-image-context` → `/chat` | contextual conversation |

---

#  IMPORTANT RULES FOR FRONTEND

### 1️. sessionId is required everywhere

```text id="rule1"
Must be unique per user session
```

---

### 2️. Image context must be set before chat (if using Ask More)

```text id="rule2"
Always call /chat/set-image-context first
```

---

### 3️. Chat history is automatic

Frontend does NOT need to manage memory manually

---

# FRONTEND DESIGN SUGGESTION

### Image Page

* Upload image
* Show response
* Show button: “Ask More about this”

---

### Chat Page

* Load previous sessionId
* Continue conversation
* Image context automatically applied

---

# END RESULT UX FLOW

```text id="ux1"
Image → AI identifies → User reads result
     → (Ask More)
     → Chat opens with image memory
     → Natural conversation continues
```

---

# WHAT THIS BACKEND SUPPORTS

Multimodal AI (text + image)
Session-based memory
RAG knowledge retrieval
Conversational context switching
Production-ready API structure

---
