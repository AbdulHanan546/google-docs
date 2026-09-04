# Ajaia Docs — Collaborative Document Editor

> A lightweight, collaborative document workspace inspired by Google Docs, built for **Ajaia LLC's Full Stack Developer Assessment**.

---

## 🌟 Quick Start (Under 60 Seconds)

### 1. Prerequisites
- **Node.js**: v18+ (Tested on Node v20 & v24)
- **npm**: v9+

### 2. Install Dependencies & Setup Database
```bash
# Clone or navigate to the workspace
cd ajai

# Install dependencies
npm install

# Push SQLite schema and seed mock accounts & starter documents
npx prisma db push
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Test Suite
```bash
npm test
```
Runs the Vitest suite covering permissions, access control, and markdown parsing.

---

## 👥 Seeded Evaluation Accounts (Instant User Switcher)

To provide zero-friction review without requiring manual registration or auth setup, the app features an **Instant User Switcher** in the top-right header:

| User | Role | Default Accessible Documents |
| :--- | :--- | :--- |
| **Alice Chen** | *Product Lead* | • **Owner**: *Q3 Product Velocity Roadmap*<br/>• **Viewer**: *Design System Tokens & Accessibility Standards* |
| **Bob Miller** | *Staff Designer* | • **Owner**: *Design System Tokens & Accessibility Standards*<br/>• **Editor**: *Q3 Product Velocity Roadmap* |
| **Charlie Patel** | *Founding Engineer*| • **Owner**: *Infrastructure & DB Engine Evaluation (Internal)* (Private) |

Switching users immediately updates dashboard permissions, read/write access, and available documents.

---

## 🚀 Core Capabilities Implemented

### 1. Document Creation & Rich Text Editing
- **Create, Rename & Reopen**: Full document lifecycle with real-time inline renaming.
- **Rich-Text Formatting (TipTap / ProseMirror)**:
  - Headings (`H1`, `H2`, `H3`)
  - Typography: **Bold**, *Italic*, <u>Underline</u>, Inline Code, Blockquote, Code Blocks
  - Lists: Bulleted lists (`<ul>`) and Numbered lists (`<ol>`)
  - Undo / Redo history
- **Autosave Engine**: Debounced background persistence with real-time status indicators (`Saving...` $\rightarrow$ `Saved at hh:mm:ss`).

### 2. File Upload & Import
- **File Upload Modal**: Accessible via the "Import File" button on the dashboard.
- **Drag & Drop**: Supports `.md`, `.markdown`, and `.txt` files.
- **Parser Engine**: Converts markdown structures (headings, bold, lists, quotes) directly into editable TipTap document nodes with live preview before creation.

### 3. Granular Sharing & Access Control
- **Document Ownership**: Documents clearly designated as "Owned by me" vs "Shared with me".
- **Collaborator Management**: Document owners can grant access to team members with explicit roles:
  - **Editor**: Can modify document title and body content.
  - **Viewer**: Read-only access. Toolbar is locked, and a view-only warning banner is displayed.
- **Revocation**: Document owners can remove collaborator access in one click.

### 4. Export & Print
- **1-Click Export to Markdown**: Downloads the current document as a clean `.md` file.
- **Print / PDF**: Formats document for clean, distraction-free printing or PDF generation.

---

## 🧪 Automated Testing

Run the automated test suite:
```bash
npm test
```
The test suite validates:
- `src/tests/permissions.test.ts`: Owner full control, shared editor write rights, shared viewer read-only enforcement, and 403 access denial for uninvited users.
- `src/tests/fileParsers.test.ts`: Markdown title extraction, heading levels, inline styles, bullet/numbered lists, and plain text paragraph wrapping.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Editor Engine**: TipTap 3 & ProseMirror
- **Database & ORM**: SQLite + Prisma 6
- **Styling**: Tailwind CSS + Custom Prose Styling
- **Icons**: Lucide React
- **Test Runner**: Vitest
