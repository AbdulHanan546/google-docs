# AI-Native Workflow Note

**Candidate**: Abdul Hanan  
**Role**: AI-Native Full Stack Developer Assessment  
**Evaluation Criteria**: Practical AI usage, discernment, and engineering judgment (not raw volume of AI usage).

---

## 1. AI Tools Utilized

- **Primary Coding Agent**: Google DeepMind Antigravity AI Agent (Gemini 3.7 Flash Thinking) for interactive architecture design, rapid scaffolding, and full-stack implementation.
- **Autonomous Subagents**: Antigravity Browser Automation Subagent for headless browser testing, interactive DOM verification, and recording artifact generation.
- **LLM APIs**: Google Gemini 1.5 Flash API for the live document Copilot features (Summarize, Polish, Action Items).

---

## 2. Where AI Materially Sped Up My Work

1. **Boilerplate Elimination & Scaffolding**:
   - Initializing Next.js 16 App Router configuration, TypeScript declarations, and Prisma schema definitions took minutes instead of hours.
2. **TipTap ProseMirror Extension Integration**:
   - TipTap's extension configuration (StarterKit, Underline, Link, TaskList, TaskItem) and custom CSS styling rules were generated rapidly with correct schema bindings.
3. **Automated Unit & Integration Test Generation**:
   - Synthesized unit tests in Vitest covering all corner cases of document permissions (owner vs editor vs viewer vs unshared 403) and edge-case markdown parsing in seconds.
4. **End-to-End Headless Browser Validation**:
   - Spawned an autonomous browser subagent that walked through the full user journey: opened the dashboard, validated seeded documents, tested TipTap formatting, invoked AI summarize, opened the share modal, switched user to Bob Miller, verified permission badges, and recorded the entire session.

---

## 3. What AI-Generated Output I Changed or Rejected

True AI-native engineering requires rigorous judgment. Several AI suggestions were explicitly modified or rejected:

1. **Rejected Over-Engineered Websocket Server for Persistence**:
   - Initial AI suggestions proposed spinning up a standalone Node WebSocket server with in-memory state.
   - *Why rejected*: A custom WebSocket server would have introduced ephemeral memory state, dropped connections on server restarts, and added high deployment complexity for reviewers.
   - *Action taken*: Replaced with a rock-solid, persistent SQLite + Prisma schema with debounced REST PATCH endpoints, guaranteeing zero data loss across page reloads.
2. **Fixed Client/Server Boundary Collision**:
   - An early AI-generated file placed `next/headers` inside `src/lib/auth.ts`, which was also imported by client components, causing Turbopack build errors.
   - *Action taken*: Decoupled into `src/lib/auth.ts` (client-safe models and pure helpers) and `src/lib/auth-server.ts` (server-side header extraction), creating clean architectural boundaries.
3. **Rejected Fragile External API Dependency for Core UI**:
   - AI initially generated the document copilot with an exclusive dependency on an external LLM API key.
   - *Why modified*: If an evaluator runs the code without setting up an API key, the copilot would fail with a 500 error.
   - *Action taken*: Engineered a resilient dual-mode handler in `/api/ai` that leverages live Gemini models when a key is present, but seamlessly switches to an embedded deterministic transformer engine when unkeyed.

---

## 4. How Correctness, UX Quality, and Reliability Were Verified

1. **Static Type Safety & Production Build**:
   - Ran `npm run build` with Turbopack to enforce strict TypeScript type-checking across all dynamic routes and server/client boundaries.
2. **Automated Vitest Test Suite**:
   - Executed `npm test` verifying 8 test assertions covering access control rules and markdown syntax parsing.
3. **Autonomous Browser Testing with Artifacts**:
   - Ran the application in a headless browser session, capturing high-resolution screenshots and video recordings of key flows:
     - Alice's dashboard view with owned vs shared badges.
     - Document editor toolbar and inline title editing.
     - Live AI summarization injection into the ProseMirror editor.
     - Sharing modal with owner designation and role dropdowns.
     - Bob's dashboard view confirming role-based access isolation.
