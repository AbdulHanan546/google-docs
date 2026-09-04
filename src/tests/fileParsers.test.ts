import { describe, it, expect } from "vitest";
import { parseMarkdownToHtml, parsePlainTextToHtml } from "../lib/fileParsers";

describe("File Parser Engine", () => {
  it("parses markdown headings and extracts the primary title", () => {
    const md = `# Project Roadmap 2026\n\n## Goals\n\nAccelerate AI tooling.`;
    const result = parseMarkdownToHtml(md);

    expect(result.title).toBe("Project Roadmap 2026");
    expect(result.htmlContent).toContain("<h1>Project Roadmap 2026</h1>");
    expect(result.htmlContent).toContain("<h2>Goals</h2>");
    expect(result.htmlContent).toContain("<p>Accelerate AI tooling.</p>");
  });

  it("parses inline formatting (bold, italic, inline code)", () => {
    const md = `This has **bold text**, *italic text*, and \`const x = 42;\`.`;
    const result = parseMarkdownToHtml(md);

    expect(result.htmlContent).toContain("<strong>bold text</strong>");
    expect(result.htmlContent).toContain("<em>italic text</em>");
    expect(result.htmlContent).toContain("<code>const x = 42;</code>");
  });

  it("converts bulleted lists and numbered lists into HTML structures", () => {
    const md = `- First item\n- Second item\n* Third item`;
    const result = parseMarkdownToHtml(md);

    expect(result.htmlContent).toContain("<ul>");
    expect(result.htmlContent).toContain("<li>First item</li>");
    expect(result.htmlContent).toContain("<li>Second item</li>");
    expect(result.htmlContent).toContain("<li>Third item</li>");
    expect(result.htmlContent).toContain("</ul>");
  });

  it("parses plain text files into clean HTML paragraphs", () => {
    const txt = `Paragraph one with thoughts.\n\nParagraph two with conclusions.`;
    const result = parsePlainTextToHtml(txt, "executive-summary.txt");

    expect(result.title).toBe("executive-summary");
    expect(result.htmlContent).toContain("<p>Paragraph one with thoughts.</p>");
    expect(result.htmlContent).toContain("<p>Paragraph two with conclusions.</p>");
  });
});
