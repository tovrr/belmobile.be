---
description: Implementation plan for AI Chatbot Handover (Bot Muting)
---

# 🛑 AI Chatbot Handover (Bot Muting) Implementation Plan

## Objective
Prevent the AI Bot from interfering when a Human Admin takes over the conversation. The transition should be seamless and reversible.

## Architecture
1.  **Firestore Schema Update**: Add `botMuted` (boolean) field to `chatbot_sessions`.
2.  **Admin Logic**: 
    - Auto-mute bot when Admin sends a message.
    - Providing a manual "Mute/Unmute Bot" toggle in the UI.
3.  **Client Logic (`AIChatAssistant`)**: 
    - Check `botMuted` flag before calling the AI API.
    - If muted, just save user message to Firestore but DO NOT call `/api/chat`.

## Step-by-Step Implementation

### Phase 1: Client-Side Logic (The Gatekeeper)

1.  **Update `AIChatAssistant.tsx`**:
    - Listen for `botMuted` in the `onSnapshot` listener.
    - In `handleSend`, check: `if (session.botMuted) { ...skip API call... }`.
    - If muted, user message is saved, but no "Thinking..." state is triggered.

### Phase 2: Admin-Side Logic (The Controller)

2.  **Update `ChatManagement.tsx`**:
    - **Auto-Mute**: Inside `handleAdminReply`, update Firestore: `botMuted: true`.
    - **UI Toggle**: Add a button in the Chat Header (e.g., Robot Icon with slash) to manually toggle `botMuted` status.
    - **Visual Indicator**: Show a small badge "🤖 PAUSED" in the chat view when muted.

### Phase 3: Verification

3.  **Test Flow**:
    - User types "Hello". Bot replies.
    - Admin clicks "Mute Bot" (or sends a reply).
    - User types "Can you help me?". Bot DOES NOT reply. Admin sees message.
    - Admin replies "Yes".
    - Admin toggles "Unmute".
    - User types "Thanks". Bot replies.

---

## Technical Details

### `chatbot_sessions` Document Structure
```typescript
interface ChatSession {
    // ... existing fields
    botMuted?: boolean; // New Field
}
```

### `AIChatAssistant.tsx` modification
```typescript
// Inside handleSend
if (botMuted) {
    // Save to Firestore ONLY
    await setDoc(..., { messages: [...newMessages] }, { merge: true });
    return; // EXIT before calling AI
}
// ... continue to fetch('/api/chat')
```

### `ChatManagement.tsx` modification
```typescript
{/* Header Toggle */}
<button onClick={toggleMute} className={isMuted ? 'bg-red-100' : 'bg-green-100'}>
    {isMuted ? 'Resume AI' : 'Pause AI'}
</button>
```
