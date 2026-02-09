import jsPDF from "jspdf";

/**
 * Adds a standardized footer to PDF documents
 * @param doc - jsPDF document instance
 * @param pageNumber - Current page number
 * @param totalPages - Total number of pages
 */
export function addFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number,
): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = pageHeight - 20;

  // Footer separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

  // Left side: Logo placeholder + App name + Subtext
  doc.setFontSize(10);
  doc.setTextColor(55, 42, 172); // update to #372aac (indigo-800)
  doc.setFont("helvetica", "bold");
  doc.text("taxai.ng", 20, footerY);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Based on the Nigerian Tax Act 2025", 20, footerY + 4);

  // Right side: Contact email
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const email = "[CONTACT_EMAIL]";
  const emailWidth = doc.getTextWidth(email);
  doc.text(email, pageWidth - 20 - emailWidth, footerY + 4);

  // Page number (center bottom)
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const pageText = `Page ${pageNumber} of ${totalPages}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.text(pageText, (pageWidth - pageTextWidth) / 2, footerY + 4);
}
