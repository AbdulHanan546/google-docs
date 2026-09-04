import { prisma } from "./db";

let isSeedingPromise: Promise<void> | null = null;

export async function ensureDatabaseSeeded() {
  if (isSeedingPromise) {
    return isSeedingPromise;
  }

  isSeedingPromise = (async () => {
    try {
      // Check if documents already exist
      const existingDocCount = await prisma.document.count().catch(() => 0);
      if (existingDocCount > 0) {
        return;
      }

      console.log("🌱 Auto-seeding database on serverless environment...");

      // Clean existing records if any
      await prisma.documentShare.deleteMany().catch(() => {});
      await prisma.documentVersion.deleteMany().catch(() => {});
      await prisma.document.deleteMany().catch(() => {});
      await prisma.user.deleteMany().catch(() => {});

      // Create Users
      const alice = await prisma.user.create({
        data: {
          id: "user_alice",
          name: "Alice Chen",
          email: "alice@ajaia.internal",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
          roleTitle: "Product Lead",
        },
      });

      const bob = await prisma.user.create({
        data: {
          id: "user_bob",
          name: "Bob Miller",
          email: "bob@ajaia.internal",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
          roleTitle: "Staff Designer",
        },
      });

      const charlie = await prisma.user.create({
        data: {
          id: "user_charlie",
          name: "Charlie Patel",
          email: "charlie@ajaia.internal",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
          roleTitle: "Founding Engineer",
        },
      });

      // Doc 1: Owned by Alice, shared with Bob (Editor) and Charlie (Viewer)
      const doc1 = await prisma.document.create({
        data: {
          id: "doc_roadmap_q3",
          title: "Q3 Product Velocity Roadmap",
          ownerId: alice.id,
          content: `<h1>Q3 Product Velocity Roadmap</h1><p><strong>Executive Summary:</strong> Accelerating cross-functional velocity through unified real-time document workflows.</p><h2>Key Objectives</h2><ul><li>Ship lightweight collaborative document editor with rich-text formatting.</li><li>Enable single-click file import (.md, .txt) to active drafts.</li><li>Deliver intuitive role-based sharing model (Viewer vs Editor).</li></ul><h2>Action Items</h2><ul><li>Conduct architecture review on CRDT vs operational transform tradeoffs.</li><li>Benchmark client-side TipTap editor performance on 50-page docs.</li><li>Deploy production-ready build for team evaluation.</li></ul>`,
        },
      });

      await prisma.documentShare.createMany({
        data: [
          { documentId: doc1.id, userId: bob.id, permission: "EDITOR" },
          { documentId: doc1.id, userId: charlie.id, permission: "VIEWER" },
        ],
      });

      // Doc 2: Owned by Bob, shared with Alice (Viewer) and Charlie (Viewer)
      const doc2 = await prisma.document.create({
        data: {
          id: "doc_design_system",
          title: "Design System Tokens & Accessibility Standards",
          ownerId: bob.id,
          content: `<h1>Design System Tokens &amp; Accessibility Standards</h1><p>This document outlines the core styling guidelines, typography hierarchy, and color tokens for our internal productivity tools.</p><h2>Typography</h2><p>We adopt <em>Inter</em> for clean legibility across density levels. Heading scales strictly follow H1 (32px), H2 (24px), and H3 (18px).</p><h2>Contrast &amp; Accessibility</h2><ul><li>WCAG AA compliance across both light and dark themes.</li><li>Visual focus rings on all interactive toolbar elements.</li></ul>`,
        },
      });

      await prisma.documentShare.createMany({
        data: [
          { documentId: doc2.id, userId: alice.id, permission: "VIEWER" },
          { documentId: doc2.id, userId: charlie.id, permission: "VIEWER" },
        ],
      });

      // Doc 3: Owned by Charlie, shared with Alice (Viewer) and Bob (Editor)
      const doc3 = await prisma.document.create({
        data: {
          id: "doc_infra_charlie",
          title: "Infrastructure & DB Engine Evaluation (Internal)",
          ownerId: charlie.id,
          content: `<h1>Infrastructure &amp; DB Engine Evaluation</h1><p>Engineering research notes comparing embedded SQLite, Postgres on RDS, and distributed edge storage.</p><h2>Key Findings</h2><p>For zero-latency local development and self-contained review builds, an embedded SQLite database with Prisma provides unbeatable reliability and instantaneous test iteration.</p><h2>Next Steps</h2><ul><li>Benchmark query throughput under 100 concurrent read streams.</li><li>Evaluate Turso / libSQL for distributed edge replicas.</li></ul>`,
        },
      });

      await prisma.documentShare.createMany({
        data: [
          { documentId: doc3.id, userId: alice.id, permission: "VIEWER" },
          { documentId: doc3.id, userId: bob.id, permission: "EDITOR" },
        ],
      });

      console.log("✅ Database auto-seeded successfully with Alice, Bob, and Charlie documents!");
    } catch (err) {
      console.error("Auto-seeding error:", err);
    } finally {
      isSeedingPromise = null;
    }
  })();

  return isSeedingPromise;
}
