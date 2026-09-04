import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromHeaders } from "@/lib/auth-server";
import { ensureDatabaseSeeded } from "@/lib/ensure-seed";

export async function GET(request: Request) {
  try {
    await ensureDatabaseSeeded();
    const currentUser = await getCurrentUserFromHeaders();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || currentUser.id;

    // Fetch owned documents
    const owned = await prisma.document.findMany({
      where: { ownerId: userId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Fetch shared documents
    const sharedShares = await prisma.documentShare.findMany({
      where: { userId: userId },
      include: {
        document: {
          include: {
            owner: { select: { id: true, name: true, email: true, avatar: true } },
            shares: {
              include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const shared = sharedShares.map((s) => ({
      ...s.document,
      myPermission: s.permission,
    }));

    return NextResponse.json({
      currentUser: userId,
      owned,
      shared,
    });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUserFromHeaders();
    const body = await request.json();
    const { title = "Untitled Document", content = "<p></p>", userId = currentUser.id } = body;

    const newDoc = await prisma.document.create({
      data: {
        title,
        content,
        ownerId: userId,
      },
      include: {
        owner: true,
      },
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
