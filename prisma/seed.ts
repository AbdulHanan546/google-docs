import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database for Ajaia assessment...");

  // Clean existing data
  await prisma.documentShare.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

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

  console.log("✅ Created users: Alice, Bob, Charlie");

  // Document 1: Owned by Alice, shared with Bob (Editor)
  const doc1 = await prisma.document.create({
    data: {
      id: "doc_roadmap_q3",
      title: "Ajaia AI Productivity Suite - Q3 Roadmap",
      ownerId: alice.id,
      content: `<h1>Ajaia AI Productivity Suite - Q3 Roadmap</h1><p><strong>Executive Summary:</strong> Accelerating cross-functional velocity through unified real-time document intelligence.</p><h2>Key Objectives</h2><ul><li>Ship lightweight collaborative document editor with native AI assistance.</li><li>Enable single-click file import (.md, .txt) to active drafts.</li><li>Deliver intuitive role-based sharing model (Viewer vs Editor).</li></ul><h2>Action Items</h2><ul><li>Conduct architecture review on CRDT vs operational transform tradeoffs.</li><li>Benchmark client-side TipTap editor performance on 50-page docs.</li><li>Finalize unlisted walkthrough video for executive assessment.</li></ul>`,
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc1.id,
      userId: bob.id,
      permission: "EDITOR",
    },
  });

  // Document 2: Owned by Bob, shared with Alice (Viewer)
  const doc2 = await prisma.document.create({
    data: {
      id: "doc_design_system",
      title: "Design System Tokens & Accessibility Standards",
      ownerId: bob.id,
      content: `<h1>Design System Tokens &amp; Accessibility Standards</h1><p>This document outlines the core styling guidelines, typography hierarchy, and color tokens for our internal productivity tools.</p><h2>Typography</h2><p>We adopt <em>Inter</em> for clean legibility across density levels. Heading scales strictly follow H1 (32px), H2 (24px), and H3 (18px).</p><h2>Contrast &amp; Accessibility</h2><ul><li>WCAG AA compliance across both light and dark themes.</li><li>Visual focus rings on all interactive toolbar elements.</li></ul>`,
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: doc2.id,
      userId: alice.id,
      permission: "VIEWER",
    },
  });

  // Document 3: Owned by Charlie, private (unshared)
  await prisma.document.create({
    data: {
      id: "doc_infra_charlie",
      title: "Infrastructure & DB Engine Evaluation (Internal)",
      ownerId: charlie.id,
      content: `<h1>Infrastructure &amp; DB Engine Evaluation</h1><p>Private research notes comparing embedded SQLite, Postgres on RDS, and distributed edge storage.</p><h2>Conclusion</h2><p>For zero-latency local development and self-contained review builds, an embedded SQLite database with Prisma provides unbeatable reliability and instantaneous test iteration.</p>`,
    },
  });

  console.log("✅ Seeded initial documents and access shares successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
