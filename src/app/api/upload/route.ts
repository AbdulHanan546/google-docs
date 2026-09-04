import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromHeaders } from "@/lib/auth-server";
import { parseMarkdownToHtml, parsePlainTextToHtml } from "@/lib/fileParsers";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUserFromHeaders();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || currentUser.id;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const filename = file.name;
    const ext = filename.split(".").pop()?.toLowerCase();

    const allowedExtensions = ["md", "markdown", "txt", "text", "json"];
    if (!ext || !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file format (.${ext}). Please upload Markdown (.md) or Plain Text (.txt) files.`,
        },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    let parsedTitle = filename.replace(/\.[^/.]+$/, "");
    let htmlContent = "<p></p>";

    if (ext === "md" || ext === "markdown") {
      const parsed = parseMarkdownToHtml(fileContent, parsedTitle);
      parsedTitle = parsed.title;
      htmlContent = parsed.htmlContent;
    } else if (ext === "json") {
      try {
        const json = JSON.parse(fileContent);
        parsedTitle = json.title || parsedTitle;
        htmlContent = json.content || `<p>${JSON.stringify(json, null, 2)}</p>`;
      } catch {
        const parsed = parsePlainTextToHtml(fileContent, parsedTitle);
        htmlContent = parsed.htmlContent;
      }
    } else {
      const parsed = parsePlainTextToHtml(fileContent, parsedTitle);
      htmlContent = parsed.htmlContent;
    }

    const newDocument = await prisma.document.create({
      data: {
        title: parsedTitle || "Imported Document",
        content: htmlContent,
        ownerId: userId,
      },
      include: {
        owner: true,
      },
    });

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to upload and parse file" }, { status: 500 });
  }
}
