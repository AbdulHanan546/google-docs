export interface ParsedDocumentResult {
  title: string;
  htmlContent: string;
}

export function parseMarkdownToHtml(markdownText: string, fallbackTitle = "Imported Document"): ParsedDocumentResult {
  const lines = markdownText.split(/\r?\n/);
  let extractedTitle = fallbackTitle;
  const htmlLines: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Handle code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        htmlLines.push(`<pre><code>${escapeHtml(codeBlockBuffer.join("\n"))}</code></pre>`);
        inCodeBlock = false;
        codeBlockBuffer = [];
      } else {
        if (inList) {
          htmlLines.push(`</${inList}>`);
          inList = null;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(rawLine);
      continue;
    }

    // Close open list if line is blank or not a list item
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const isNumbered = /^\d+\.\s+/.test(trimmed);

    if (!isBullet && !isNumbered && inList) {
      htmlLines.push(`</${inList}>`);
      inList = null;
    }

    // Blank line
    if (!trimmed) {
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      const headingText = trimmed.replace(/^#\s+/, "");
      if (extractedTitle === fallbackTitle) {
        extractedTitle = headingText;
      }
      htmlLines.push(`<h1>${formatInlineMarkdown(headingText)}</h1>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      const headingText = trimmed.replace(/^##\s+/, "");
      htmlLines.push(`<h2>${formatInlineMarkdown(headingText)}</h2>`);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      const headingText = trimmed.replace(/^###\s+/, "");
      htmlLines.push(`<h3>${formatInlineMarkdown(headingText)}</h3>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed.replace(/^>\s+/, "");
      htmlLines.push(`<blockquote><p>${formatInlineMarkdown(quoteText)}</p></blockquote>`);
      continue;
    }

    // Bullet list
    if (isBullet) {
      if (inList !== "ul") {
        if (inList) htmlLines.push(`</${inList}>`);
        htmlLines.push("<ul>");
        inList = "ul";
      }
      const itemText = trimmed.replace(/^[-*]\s+/, "");
      htmlLines.push(`<li>${formatInlineMarkdown(itemText)}</li>`);
      continue;
    }

    // Numbered list
    if (isNumbered) {
      if (inList !== "ol") {
        if (inList) htmlLines.push(`</${inList}>`);
        htmlLines.push("<ol>");
        inList = "ol";
      }
      const itemText = trimmed.replace(/^\d+\.\s+/, "");
      htmlLines.push(`<li>${formatInlineMarkdown(itemText)}</li>`);
      continue;
    }

    // Standard paragraph
    htmlLines.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
  }

  if (inList) {
    htmlLines.push(`</${inList}>`);
  }
  if (inCodeBlock && codeBlockBuffer.length > 0) {
    htmlLines.push(`<pre><code>${escapeHtml(codeBlockBuffer.join("\n"))}</code></pre>`);
  }

  return {
    title: extractedTitle,
    htmlContent: htmlLines.join("") || `<p>${escapeHtml(markdownText)}</p>`,
  };
}

export function parsePlainTextToHtml(text: string, filename = "Untitled Document"): ParsedDocumentResult {
  const cleanTitle = filename.replace(/\.[^/.]+$/, "");
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return {
      title: cleanTitle,
      htmlContent: "<p></p>",
    };
  }

  const htmlContent = paragraphs
    .map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, "<br/>")}</p>`)
    .join("");

  return {
    title: cleanTitle,
    htmlContent,
  };
}

export function formatInlineMarkdown(text: string): string {
  let escaped = escapeHtml(text);
  // Bold: **text** or __text__
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  escaped = escaped.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Italic: *text* or _text_
  escaped = escaped.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  escaped = escaped.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, "<em>$1</em>");
  // Underline: <u>text</u> or ~text~
  escaped = escaped.replace(/~(.*?)~/g, "<u>$1</u>");
  // Inline code: `code`
  escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
  return escaped;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
