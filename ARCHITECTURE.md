# Architecture Note: Ajaia Collaborative Document Editor

**Candidate**: Abdul Hanan  
**Role**: AI-Native Full Stack Developer Assessment  
**Date**: September 2026  

---

## 1. Executive Summary & Design Goals

The objective of this assignment is to ship a robust, lightweight collaborative document editor inspired by Google Docs within a strict 4–6 hour timebox. Rather than attempting a shallow recreation of every Google Docs feature, our architecture prioritizes **depth in core user workflows**, **bulletproof persistence**, **clean multi-user access control**, and **native AI integration**.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router UI                    │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │ Document Dashboard   │         │ TipTap Editor Canvas │  │
│  │ (Owned vs Shared)    │         │ (Autosave + AI Bar)  │  │
│  └──────────┬───────────┘         └──────────┬───────────┘  │
└─────────────┼────────────────────────────────┼──────────────┘
              │                                │
              ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js API Layer                       │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ /api/documents│  │  /api/share   │  │   /api/upload   │  │
│  └───────┬───────┘  └───────┬───────┘  └────────┬────────┘  │
│          │                  │                   │           │
│          ▼                  ▼                   ▼           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Prisma ORM (SQLite Persistent DB)           │  │
│  │     Users  ◄───►  Documents  ◄───►  DocumentShares   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Key Architecture Decisions & Prioritization

### A. Editor Engine: TipTap / ProseMirror vs `contenteditable`
- **Decision**: Selected **TipTap 3 (ProseMirror core)** over native `contenteditable` or basic textareas.
- **Rationale**: Direct DOM manipulation with `contenteditable` creates browser inconsistencies, broken undo stacks, and malformed HTML tags. TipTap provides an accessible schema-driven document model, robust undo/redo history, clean HTML serialization, and native extensibility for future collaborative CRDT plugins (Y.js).

### B. Persistence Layer: SQLite + Prisma ORM
- **Decision**: Adopted **SQLite** with **Prisma ORM**.
- **Rationale**: For an evaluation take-home assignment, SQLite delivers complete relational guarantees (foreign keys, cascade deletes, unique compound indexes on `[documentId, userId]`) with **zero external service setup** or credentials for the reviewer.
- **Tradeoff**: SQLite is single-file and node-process-bound. In a production enterprise deployment, the Prisma schema seamlessly transitions to PostgreSQL or Supabase with a single connection string change.

### C. Authentication Strategy: Mock Header & Seeded User Switcher
- **Decision**: Implemented an in-app **Instant User Switcher** with 3 seeded personas (`Alice [Product Lead]`, `Bob [Staff Designer]`, `Charlie [Founding Engineer]`).
- **Rationale**: Full Auth0/NextAuth setup introduces OAuth redirect callbacks, environment secret requirements, and email verification friction for reviewers. The switcher simulates realistic role-based access control instantly from the browser header.

### D. AI Copilot: Hybrid Cloud + Embedded Deterministic Engine
- **Decision**: Implemented a dual-path AI copilot in `/api/ai`. If `GEMINI_API_KEY` or `OPENAI_API_KEY` is present, it invokes Gemini 1.5 Flash. If not, it falls back to an embedded text transformer engine.
- **Rationale**: Ensures the reviewer never encounters a 500 error or broken feature due to missing API keys or quota exhaustion, while still demonstrating production AI prompt orchestration and streaming-ready endpoints.

---

## 3. Data Model & Access Control Matrix

```prisma
model User {
  id        String          @id
  name      String
  email     String          @unique
  avatar    String
  roleTitle String
  documents Document[]      @relation("UserDocuments")
  shares    DocumentShare[]
}

model Document {
  id        String          @id @default(cuid())
  title     String          @default("Untitled Document")
  content   String          @default("")
  ownerId   String
  owner     User            @relation("UserDocuments", fields: [ownerId], references: [id], onDelete: Cascade)
  shares    DocumentShare[]
  versions  DocumentVersion[]
  updatedAt DateTime        @updatedAt
}

model DocumentShare {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission String   @default("EDITOR") // "VIEWER" | "EDITOR"

  @@unique([documentId, userId])
}
```

### Access Control Matrix:
| Operation | Owner | Shared Editor | Shared Viewer | Unshared User |
| :--- | :---: | :---: | :---: | :---: |
| **View Document** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ❌ 403 Forbidden |
| **Edit Content / Title** | ✅ Allowed | ✅ Allowed | ❌ 403 (Read-Only) | ❌ 403 Forbidden |
| **Run AI Assistant** | ✅ Allowed | ✅ Allowed | ❌ 403 (Read-Only) | ❌ 403 Forbidden |
| **Manage Shares** | ✅ Allowed | ❌ Denied | ❌ Denied | ❌ 403 Forbidden |
| **Delete Document** | ✅ Allowed | ❌ Denied | ❌ Denied | ❌ 403 Forbidden |

---

## 4. What is Working vs Incomplete

### ✅ Fully Working End-to-End:
1. Document creation, inline title renaming, TipTap rich text editing (Headings, bold, italic, underline, lists, blockquotes, code blocks).
2. Debounced auto-save with persistent cloud status indicator (`Saving...` $\rightarrow$ `Saved at hh:mm:ss`).
3. File upload & conversion: Drag-and-drop `.md` and `.txt` files into fully formatted documents with preview.
4. Role-based sharing: Add/remove collaborators with explicit Editor or Viewer permissions.
5. Dynamic user switcher demonstrating isolated dashboard views ("Owned by me" vs "Shared with me").
6. AI Copilot: Summarize, Polish & Refine, Action Item extraction.
7. Export: 1-click download as Markdown (.md) and Print/PDF.
8. 8/8 passing automated tests for permissions and file parsing.

### ⚠️ Intentionally Deprioritized / Incomplete:
1. **Multiplayer WebSocket Cursor Presence**: Full CRDT (Y.js + WebSockets) for concurrent multi-caret typing was deprioritized to guarantee rock-solid single-source-of-truth persistence, access control, and AI integration within the 4–6 hour window.
2. **Granular Inline Comment Threads**: Mentions and highlight-anchored comments were deferred in favor of full document AI assistance.

---

## 5. What I Would Build Next (With 2–4 Additional Hours)

1. **Y.js Collaborative Real-Time Awareness**:
   - Integrate `y-prosemirror` and `y-websocket` or Liveblocks to render remote multi-user carets with names and presence indicators.
2. **Version History & Diff Viewer**:
   - UI drawer showing timestamped `DocumentVersion` snapshots with a visual diff comparison (green insertions / red deletions) and a "Restore this version" action.
3. **Slash Commands (`/`)**:
   - Notion-style floating command palette (`/h1`, `/ai`, `/table`, `/bullet`) for keyboard-first editing velocity.
