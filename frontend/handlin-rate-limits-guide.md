# 🛑 HANDLING RATE LIMITS (HTTP 429)

The backend enforces strict usage quotas to manage AI resources. When a limit is reached, the server returns an **HTTP 429** status code.

### Error Response Body

```
```text?code_stdout&code_event_index=1
File saved to handling_rate_limits.md

```json
{
  "error": "Too many messages sent. Please wait a moment before trying again."
}
```

---

### 💡 Frontend Implementation Rules

1. **Global Interceptor**: Set up an Axios or Fetch interceptor to catch 429 errors globally.
2. **User Feedback**: When a 429 occurs, display a "Toast" or "Alert" message using the error string provided by the backend.

### 📊 Quotas to Monitor

* **Text Chat**: 10 messages per minute.
* **Image Search**: 3 uploads per 24-hour window.

### 📑 Headers

You can check the following response headers to show "Remaining Hits" in your UI:

| Header | Description |
| :--- | :--- |
| `RateLimit-Limit` | Total quota allowed. |
| `RateLimit-Remaining` | How many hits the user has left. |
| `RateLimit-Reset` | Time (in seconds) until the quota resets. |
"""
