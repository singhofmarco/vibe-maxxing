You are helping build a hackathon-scale web application.

PRODUCT NAME (working):
Voice Executive Assistant

PRODUCT OVERVIEW:
This is a voice-first, session-based AI executive assistant that converts messy human brain dumps into real-world actions by automating calendar events and sending emails on the user's behalf.

The user speaks freely (or types). The assistant reflects understanding, asks clarifying questions, then automatically:
- Creates calendar events
- Sends follow-up emails
- Generates and tracks tasks
- Builds a daily agenda

The product emphasizes conversational AI with personality (including sassy pushback) and visible follow-through.

This is not a passive productivity tool. It is an **acting assistant**.

---

CORE USER FLOW:
1. User clicks a microphone button to start a session.
2. User speaks freely (voice ends via 5-second silence detection) or types.
3. Audio is transcribed.
4. The AI responds with:
   - "Here's what I heard…" (reflection)
   - Up to 2 clarifying questions
5. User answers by clicking the mic again.
6. The AI:
   - Creates calendar events
   - Sends follow-up emails
   - Generates a task list
   - Produces a daily agenda
7. All actions are visible in the UI with status indicators (sent / scheduled / pending).

Sessions are short, intentional, and action-oriented.

---

AUTOMATION RULES:
- The user can choose between:
  - Manual approval mode
  - Automatic execution mode
- In automatic mode, the assistant may act without additional confirmation.
- If confidence is low, the assistant should still act but mark items clearly.
- Visibility is mandatory: the user must always see what was done.

---

TECH STACK:
Frontend:
- Next.js (App Router)
- Tailwind CSS

AI / Voice:
- Minimax (LLM for conversational reasoning)
- ElevenLabs (text-to-speech with expressive, characterful voice)
- Voice Activity Detection (5-second silence cutoff)

Backend:
- Firebase Firestore (users, sessions, actions, logs)
- Firebase Auth (optional)
- Calendar API (e.g., Google Calendar)
- Email API (e.g., Gmail / SMTP / transactional email service)

---

DATA MODEL OVERVIEW:
Users:
- id
- preferredTone
- automationMode (manual | automatic)
- createdAt

Sessions:
- id
- userId
- status (active | completed)
- createdAt

Messages:
- id
- sessionId
- role (user | assistant)
- content (text transcript)
- audioUrl (optional)
- timestamp

Actions:
- id
- sessionId
- type (calendar_event | email | task)
- payload (event details, email content, etc.)
- status (scheduled | sent | failed)
- confidenceLevel
- timestamp

---

AI BEHAVIOR SUMMARY:
- Voice-first and conversational
- Always reflects understanding before acting
- Asks a maximum of 2 clarifying questions per session
- Applies a selectable personality tone consistently
- Pushes back politely when users are vague or avoiding action
- Prioritizes action over perfection
- Acts autonomously when permitted

---

UI REQUIREMENTS:
- Large central microphone button
- Transcript view of the session
- Assistant response area (text + voice playback)
- Tone selection dropdown
- Automation mode toggle (manual vs auto)
- Action log showing:
  - Calendar events created
  - Emails sent
  - Tasks generated
  - Daily agenda

The UI should feel calm, confident, and executive—not cluttered.

---

IMPLEMENTATION GUIDELINES:
- Favor simple, reliable automation over complex logic.
- All automated actions must be logged.
- Assume hackathon timelines—avoid overengineering.
- Design AI calls to be debuggable and replaceable.
- The system should continue to function even if one automation fails.

---

NON-GOALS:
- No background listening
- No unlimited clarifying loops
- No long-term memory beyond sessions
- No heavy permissions or compliance logic

---

PRIMARY DEMO GOAL:
Demonstrate a messy, emotional, or rambling voice dump being transformed into:
- Clear understanding
- Confident, sassy pushback
- Real calendar events created
- Real emails sent
- A clean daily agenda

This transformation should be visible within 30–60 seconds.

---

When generating code:
- Always align with this product definition.
- Do not introduce features outside this scope.
- Optimize for clarity, reliability, and demo impact.
