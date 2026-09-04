# Ajaia LLC — AI-Native Full Stack Developer Take-Home Submission

**Candidate**: Abdul Hanan  
**Email**: abdlhanan987@gmail.com  
**Google Drive Submission Folder**: `[Insert Google Drive Link Here]`  
**Walkthrough Video**: `[Insert Loom / YouTube Link Here]`  
**Live Deployed Application**: `[Insert Vercel / Deployed URL Here]`  

---

## 1. Seeded Evaluation Accounts & Test Scenarios

To ensure immediate, frictionless testing without setting up credentials, the application includes an **in-app User Switcher** in the top-right header:

- **Alice Chen** (`user_alice`) — *Product Lead*
  - **Owned**: *Q3 Product Velocity Roadmap*
  - **Shared with Alice**: *Design System Tokens & Accessibility Standards* (Viewer role)
- **Bob Miller** (`user_bob`) — *Staff Designer*
  - **Owned**: *Design System Tokens & Accessibility Standards*
  - **Shared with Bob**: *Q3 Product Velocity Roadmap* (Editor role)
- **Charlie Patel** (`user_charlie`) — *Founding Engineer*
  - **Owned**: *Infrastructure & DB Engine Evaluation* (Private, unshared)

---

## 2. Core Capabilities Implemented

### A. Document Creation & Rich Text Editing
- **TipTap / ProseMirror Engine**: Headings (H1, H2, H3), bold, italic, underline, bulleted lists, numbered lists, blockquotes, code blocks.
- **Inline Title Renaming**: Changes update and persist automatically on blur or typing.
- **Persistent Autosave**: Debounced background persistence with visual cloud indicators (`Saving...` $\rightarrow$ `Saved at hh:mm:ss`).
- **Read-Only Mode**: When viewed by a user with `VIEWER` permission, editing is disabled and an informative banner is displayed.

### B. File Upload & Document Conversion
- **Drag-and-Drop File Import**: Modal supporting `.md`, `.markdown`, and `.txt` files.
- **Intelligent Parser**: Automatically extracts the document title and formats markdown headings, lists, bold/italic, and quotes into rich text before saving.

### C. Granular Sharing & Access Control
- **Explicit Document Ownership**: Clear visual categorization on dashboard ("Owned by me" vs "Shared with me").
- **Permission Levels**: Document owners can grant collaborator access with explicit roles:
  - **Editor**: Full editing capabilities.
  - **Viewer**: Read-only access with locked toolbar.
- **Revoke Access**: Owners can remove collaborators at any time.

### D. Export Capabilities
- **1-Click Export to Markdown (.md)**: Downloads current document cleanly.
- **Print / PDF**: Pre-configured print styles for clean document printing.

---

## 3. Product & Engineering Quality

- **8/8 Automated Tests**: Run `npm test` (Vitest) validating permissions (owner vs editor vs viewer vs unauthorized 403) and file parsing.
- **Production Build Verified**: Zero TypeScript errors on Next.js 16 App Router with Turbopack.
- **Zero External DB Setup Required**: Uses SQLite via Prisma ORM for reproducible local runs.

---

## 4. Architecture & Key Tradeoffs

1. **TipTap over `contenteditable`**: Chosen to guarantee clean AST serialization and prevent browser DOM discrepancies.
2. **SQLite + Prisma over In-Memory State**: Chosen to guarantee real persistence across page reloads and user switching.
3. **Seeded Switcher over Third-Party Auth**: Avoids OAuth callback configuration and email verification friction for reviewers.
4. **Scope Prioritization**: Real-time multi-cursor WebSocket presence was intentionally deprioritized to focus deeply on rock-solid document editing, file conversion, access control, and persistence within the time limit.

---

## 5. AI-Native Workflow Reflection

- **Tools Used**: Antigravity AI Coding Agent (Gemini 3.7 Flash Thinking) + Autonomous Browser Subagents for full-journey visual and DOM verification.
- **Speedup Areas**: Rapid scaffolding of Next.js App Router, TipTap extensions, and synthesized Vitest test cases.
- **Outputs Rejected / Modified**:
  - Rejected custom in-memory WebSocket server in favor of durable SQLite persistence.
  - Decoupled server/client auth boundaries to prevent Turbopack build errors.

---

## 6. Local Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Setup SQLite database & seed accounts
npx prisma db push
npm run seed

# 3. Start development server
npm run dev

# 4. Run automated test suite
npm test
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
