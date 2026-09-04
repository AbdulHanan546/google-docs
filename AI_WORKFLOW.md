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

True AI-native engineering requires rigorous discernment and product judgment. Rather than accepting raw AI output, several architectural, design, and UX decisions were deliberately revised:

1. **Elimination of Artificial Banners & AI Watermarks**:
   - *AI Output*: Initial AI drafts added artificial banners across the top of the app (e.g. *"Live Assessment Build • AI-Native Document Workspace"*) and cluttered footer tech tags (*"Editor: TipTap ProseMirror • Persistence: SQLite"*).
   - *Why Rejected*: These gave the application the appearance of a temporary prototype or AI hackathon project rather than a polished, production-grade workplace tool.
   - *Action Taken*: Stripped all artificial banners, boilerplate badges, and meta-commentary. Restructured the application to feel like a real, authentic enterprise product (inspired by Google Docs simplicity).

2. **Transitioned to a Refined, Paper-Like Light Mode Aesthetic**:
   - *AI Output*: The initial scaffolding defaulted to dark mode with heavy charcoal backgrounds.
   - *Why Modified*: A collaborative document editor's primary job is reading and writing text. Prolonged document drafting in heavy dark mode causes visual fatigue and strays from the familiar, high-contrast readability of Google Docs.
   - *Action Taken*: Refactored the global styling to enforce a clean, modern Light Mode palette (`bg-zinc-50/50`, crisp `#ffffff` canvas containers, subtle `border-zinc-200` lines, and tailored indigo accent tokens). The resulting visual hierarchy is clean, distraction-free, and legible.

3. **Fixed CSS Flexbox Layout Overflow & Button Misalignment ("Overfitting / Overflow")**:
   - *AI Output*: In the Share modal, the AI generated a naive flex row (`flex-1` on the user select dropdown without `min-w-0`). Because HTML `<select>` elements default to intrinsic `min-content` width, long collaborator names (e.g., *"Charlie Davis (Engineering Lead)"*) forced the dropdown beyond the available dialog container width. This pushed the purple **Share** button ~20px past the right boundary of the modal.
   - *Action Taken*: Applied `min-w-0 flex-1` to the select input, standardized all three controls to a uniform `h-9` (36px) height, aligned items to `items-stretch sm:items-center`, and streamlined permission labels. The dialog elements now align pixel-perfectly with the card borders.

4. **Removed Redundant Action Buttons (Duplicate Import & New Doc)**:
   - *AI Output*: AI redundantly placed *"Import File"* and *"New Document"* in both the top sticky navigation bar AND in the page's dashboard header directly below it on the same screen.
   - *Why Modified*: Having the identical pair of buttons stacked twice within 100px of vertical screen space created unnecessary visual clutter and duplicated modal state.
   - *Action Taken*: Removed the buttons from the top navbar—reserving the navbar strictly for brand identity and user switching—and consolidated document creation controls cleanly into the "Documents" header.

5. **Rejected Over-Engineered In-Memory WebSocket Server**:
   - *AI Output*: Initial AI suggestions proposed spinning up an ephemeral WebSocket server with in-memory state.
   - *Why Rejected*: A standalone WebSocket server would have introduced ephemeral memory state, dropped connections on server restarts, and created deployment headaches for reviewers.
   - *Action Taken*: Replaced with persistent SQLite + Prisma models with debounced autosaving, guaranteeing durable data persistence across page reloads and user switches.

6. **Resolved Serverless Database Persistence & Cascade Constraints**:
   - *AI Output*: AI assumed a standard writable server file system. On serverless platforms like Vercel Lambda, the root filesystem (`/var/task`) is strictly read-only, and SQLite foreign key constraints can fail on delete if child records aren't explicitly handled.
   - *Action Taken*: Engineered dynamic routing to `/tmp/dev.db` when `process.env.VERCEL` is active, built an idempotent self-healing schema initialization script (`ensureDatabaseSeeded`), and added explicit `deleteMany` cascades for `DocumentShare` and `DocumentVersion` prior to document deletion.

---

## 4. How Correctness, UX Quality, and Reliability Were Verified

1. **Automated Vitest Test Suite**:
   - Executed `npm test` verifying 8 test assertions across two suites:
     - `src/tests/permissions.test.ts`: Owner full control, shared editor write rights, shared viewer read-only enforcement, and 403 access denial for uninvited users.
     - `src/tests/fileParsers.test.ts`: Title extraction, heading levels, inline styles, lists, and plain text paragraph wrapping.
2. **Headless Browser Validation & Visual Regression Checks**:
   - Used autonomous browser subagents to test the entire application lifecycle end-to-end:
     - Verified clean light-mode rendering on both dashboard and editor views.
     - Validated modal dialog alignments (Share modal, File Import modal).
     - Confirmed multi-user switching between Alice (Product Lead), Bob (Designer), and Charlie (Engineer).
3. **Strict Static Type Checking**:
   - Ran `npm run build` with Turbopack to enforce zero TypeScript or compilation errors across dynamic routes and server/client boundaries.
4. **Live Production Deployment**:
   - Deployed and verified on Vercel at [https://google-docs-sand.vercel.app](https://google-docs-sand.vercel.app) with live endpoint testing.
