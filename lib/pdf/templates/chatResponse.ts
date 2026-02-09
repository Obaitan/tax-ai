import jsPDF from "jspdf";
import { addFooter } from "@/lib/pdf/shared/footer";
import { parseMessage } from "@/lib/ai/messageParser";

/**
 * Generates a PDF document from AI chat response content
 * @param content - The chat response content (may include markdown)
 * @param timestamp - When the response was generated
 * @returns Blob containing the PDF
 */
export function generateChatResponsePDF(
  content: string,
  timestamp: Date,
): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Header
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 42, 172);
  doc.text("Tax Matters", margin, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("AI Tax Assistant Response", margin, 26);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, 31, pageWidth - margin, 31);

  // Timestamp
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const dateStr = timestamp.toLocaleString("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  });
  doc.text(`Generated: ${dateStr}`, margin, 42);

  let yPosition = 54;

  const { body, citations, disclaimer, noInfoFound } = parseMessage(content);

  /**
   * Helper to render text with markdown bold support and automatic page breaks
   */
  const renderStyledText = (
    text: string,
    fontSize: number,
    textColor: [number, number, number],
    lineSpacing = 6,
  ) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...textColor);

    // Split into paragraphs
    const paragraphs = text.split("\n");

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === "") {
        // Skip empty paragraphs or keep a very small consistent gap
        continue;
      }

      // Handle horizontal rule separator
      if (paragraph.trim() === "---") {
        yPosition += 2;
        doc.setDrawColor(220, 220, 220);
        yPosition += 6;
        continue;
      }

      let isHeader = false;
      let processedParagraph = paragraph;

      // 1. Detect Headers: starts with # OR entirely wrapped in bold indicators (**)
      const trimmedPara = processedParagraph.trim();
      if (trimmedPara.startsWith("#")) {
        isHeader = true;
        processedParagraph = trimmedPara.replace(/^#+\s*/, "");
      } else if (
        trimmedPara.startsWith("**") &&
        trimmedPara.endsWith("**") &&
        trimmedPara.indexOf("**", 2) === trimmedPara.length - 2
      ) {
        isHeader = true;
        processedParagraph = trimmedPara.slice(2, -2);
      }

      if (isHeader) {
        // Fix missing spaces around parentheses in headers (e.g. Tax(VAT) -> Tax (VAT))
        processedParagraph = processedParagraph.replace(
          /([a-zA-Z0-9])\(/g,
          "$1 (",
        );
        processedParagraph = processedParagraph.replace(
          /\)([a-zA-Z0-9])/g,
          ") $1",
        );
        doc.setFontSize(fontSize + 1);
      } else {
        doc.setFontSize(fontSize);
      }

      // 2. Detect Bullet points (* or -)
      const isBullet =
        !isHeader &&
        (trimmedPara.startsWith("* ") ||
          trimmedPara.startsWith("- ") ||
          trimmedPara.startsWith("• "));
      if (isBullet) {
        processedParagraph = trimmedPara.replace(/^[*+-•]\s*/, "• ");
      }

      const leftIndent = isBullet ? 6 : 0;
      const bulletSymbolWidth = isBullet ? doc.getTextWidth("• ") : 0;

      // 3. Split into fragments to handle mid-line bolding and clean up header markers
      const fragments = processedParagraph.split(/(\*\*.*?\*\*)/g);
      let currentX = margin + leftIndent;

      for (const fragment of fragments) {
        if (!fragment) continue;

        const isBoldInText =
          fragment.startsWith("**") && fragment.endsWith("**");
        const cleanText = (
          isBoldInText ? fragment.substring(2, fragment.length - 2) : fragment
        ).replace(/₦/g, "N");

        doc.setFont("helvetica", isHeader || isBoldInText ? "bold" : "normal");

        // Split by whitespace to handle word wrap
        const tokens = cleanText.split(/(\s+)/);

        for (const token of tokens) {
          if (!token) continue;
          const tokenWidth = doc.getTextWidth(token);

          if (
            currentX + tokenWidth > margin + contentWidth &&
            token.trim() !== ""
          ) {
            // Indent wrapped lines to align with the text, not the bullet
            currentX =
              margin + leftIndent + (isBullet ? bulletSymbolWidth * 0.5 : 0);
            yPosition += lineSpacing;

            // Page break check
            if (yPosition > pageHeight - 40) {
              doc.addPage();
              yPosition = 25;
              // Restore font state for new page
              doc.setFont(
                "helvetica",
                isHeader || isBoldInText ? "bold" : "normal",
              );
              doc.setFontSize(isHeader ? fontSize + 1 : fontSize);
              doc.setTextColor(...textColor);
            }
          }

          doc.text(token, currentX, yPosition);
          currentX += tokenWidth;
        }
      }

      // Paragraph spacing (Headers get extra margin)
      yPosition += lineSpacing + (isHeader ? 3 : 1);

      // Page break check after paragraph
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 25;
      }
    }
  };

  // 1. Render Body
  renderStyledText(body, 10, [0, 0, 0]);

  // 2. Render Citations
  if (citations && !noInfoFound) {
    yPosition += 4;
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text("References & Citations:", margin, yPosition);
    yPosition += 8;

    renderStyledText(citations, 8.5, [100, 100, 100], 5);
  }

  // 3. Render Disclaimer
  if (disclaimer && !noInfoFound) {
    yPosition += 6;
    doc.setDrawColor(245, 245, 245);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(130, 130, 130);

    const lines = doc.splitTextToSize(disclaimer, contentWidth);
    for (const line of lines) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 25;
      }
      doc.text(line, margin, yPosition);
      yPosition += 5;
    }
  }

  // Final Pass: Add standard footers to all pages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  return doc.output("blob");
}

/**
 * Downloads the generated PDF
 * @param blob - PDF blob
 * @param filename - Name for the downloaded file
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
