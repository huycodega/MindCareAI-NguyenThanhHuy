# Frontend — User App & Admin App

## User App (`:5173`)

### Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Gmail or username login + link to Register |
| Register | `/register` | 2-step: email+password → OTP verify |
| Consent | `/consent` | Informed consent before intake |
| Intake | `/intake` | 6-section clinical intake form |
| Chat | `/chat` | Main chat interface |

### Chat Interface

- **Sidebar**: conversation thread list (tasktab) + "+ New conversation" button
- **Memory box**: shows `recurring_themes` and `techniques_used` from user memory
- **Message area**: user messages (right) + AI responses (left, with triage badge)
- **Triage badges**: `L2 · PENDING REVIEW` (orange) / `L3 · ANSWERED` (green)
- **Typing indicator**: animated dots while waiting for Modal response

### Key API calls (`user_app/src/api.js`)

```javascript
api.register(email, password)     // POST /api/register
api.verifyOtp(email, otp)        // POST /api/verify-otp
api.chat(message, conversationId) // POST /api/chat
api.listConversations()           // GET  /api/conversations
api.getConversation(id)           // GET  /api/conversations/:id
api.myMemory()                    // GET  /api/memory
```

## Admin App (`:5174`)

- Review queue: pending L2 responses for clinician approval
- SOAP export: auto-generate clinical notes
- Audit log: all actions logged
