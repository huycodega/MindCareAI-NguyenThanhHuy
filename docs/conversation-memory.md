# Multi-Turn Conversations & User Memory

## Conversation Threads (Tasktab)

Each user can have multiple conversation threads. Threads are listed in the sidebar and persist across sessions.

- `POST /api/conversations` — create new thread
- `GET /api/conversations` — list all threads
- `GET /api/conversations/{id}` — load thread messages
- `PATCH /api/conversations/{id}` — rename
- `DELETE /api/conversations/{id}` — archive

The last 6 turns of a thread are injected into the LLM prompt as `[CONVERSATION SO FAR]`.

## Per-User Durable Memory

Stored in `user_memory` table (Postgres), encrypted with AES-256-GCM.

| Field | Description |
|---|---|
| `turn_count` | Total turns across all sessions |
| `recurring_themes` | Top emotions + distortions (frequency-ranked) |
| `techniques_used` | CBT techniques applied (frequency-ranked) |
| `summary` | Short gist injected into every prompt |

Updated after every L2/L3 turn via `user_memory.update_after_turn()`.
Retrieved at prompt-build time via `user_memory.load_for_prompt()`.
