import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromHeaders } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUserFromHeaders();
    const body = await request.json();
    const { documentId, targetUserId, permission = "EDITOR", userId = currentUser.id } = body;

    if (!documentId || !targetUserId) {
      return NextResponse.json(
        { error: "Missing documentId or targetUserId" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Only owner can manage shares
    if (doc.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can share or modify permissions." },
        { status: 403 }
      );
    }

    if (targetUserId === doc.ownerId) {
      return NextResponse.json(
        { error: "Cannot share document with its owner." },
        { status: 400 }
      );
    }

    // Upsert share record
    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId: targetUserId,
        },
      },
      update: {
        permission: permission === "VIEWER" ? "VIEWER" : "EDITOR",
      },
      create: {
        documentId,
        userId: targetUserId,
        permission: permission === "VIEWER" ? "VIEWER" : "EDITOR",
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, roleTitle: true } },
      },
    });

    return NextResponse.json(share);
  } catch (error) {
    console.error("Failed to share document:", error);
    return NextResponse.json({ error: "Failed to share document" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUserFromHeaders();
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");
    const targetUserId = searchParams.get("targetUserId");
    const userId = searchParams.get("userId") || currentUser.id;

    if (!documentId || !targetUserId) {
      return NextResponse.json(
        { error: "Missing documentId or targetUserId" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can remove collaborators." },
        { status: 403 }
      );
    }

    await prisma.documentShare.deleteMany({
      where: {
        documentId,
        userId: targetUserId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to revoke share:", error);
    return NextResponse.json({ error: "Failed to revoke share" }, { status: 500 });
  }
}
