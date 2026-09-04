import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromHeaders } from "@/lib/auth-server";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const currentUser = await getCurrentUserFromHeaders();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || currentUser.id;

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true, roleTitle: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, roleTitle: true } },
          },
        },
        versions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Access control check
    const isOwner = doc.ownerId === userId;
    const shareRecord = doc.shares.find((s) => s.userId === userId);

    if (!isOwner && !shareRecord) {
      return NextResponse.json(
        { error: "Access denied. You do not have permission to view this document." },
        { status: 403 }
      );
    }

    const permission = isOwner ? "OWNER" : shareRecord?.permission || "VIEWER";

    return NextResponse.json({
      ...doc,
      permission,
      isOwner,
    });
  } catch (error) {
    console.error("Failed to retrieve document:", error);
    return NextResponse.json({ error: "Failed to retrieve document" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const currentUser = await getCurrentUserFromHeaders();
    const body = await request.json();
    const { title, content, userId = currentUser.id, createSnapshot } = body;

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { shares: true },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const isOwner = doc.ownerId === userId;
    const shareRecord = doc.shares.find((s) => s.userId === userId);

    if (!isOwner && (!shareRecord || shareRecord.permission !== "EDITOR")) {
      return NextResponse.json(
        { error: "Forbidden: You have view-only access and cannot edit this document." },
        { status: 403 }
      );
    }

    const updateData: { title?: string; content?: string } = {};
    if (typeof title === "string") updateData.title = title.trim() || "Untitled Document";
    if (typeof content === "string") updateData.content = content;

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    // Optionally create a version snapshot
    if (createSnapshot && (title || content)) {
      await prisma.documentVersion.create({
        data: {
          documentId: id,
          title: updatedDoc.title,
          content: updatedDoc.content,
          createdById: userId,
        },
      });
    }

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const currentUser = await getCurrentUserFromHeaders();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || currentUser.id;

    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can delete this document." },
        { status: 403 }
      );
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
