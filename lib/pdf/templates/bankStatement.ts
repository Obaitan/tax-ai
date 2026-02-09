import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BankStatementData } from "@/app/types";
import { addFooter } from "../shared/footer";

/**
 * Generates a PDF document from bank statement credit analysis
 * @param data - Parsed bank statement data
 * @returns Blob containing the PDF
 */
export function generateBankStatementPDF(data: BankStatementData): Blob {
  // Create PDF in landscape orientation
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const footerHeight = 30; // Space reserved for footer

  let yPosition = 20;

  // Header
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Tax AI", margin, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 110, 110);
  doc.text("Bank Statement Credit Analysis", margin, 26);

  // Decorative line below "Bank Statement Credit Analysis"
  yPosition = 32;
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  // Account Information Section
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Account Information", margin, yPosition);

  yPosition += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);

  const accountInfo = [
    `Account Number: ${data.accountNumber}`,
    `Bank: ${data.bankName}`,
  ];

  accountInfo.forEach((info) => {
    doc.text(info, margin, yPosition);
    yPosition += 5; // Slightly more gap between lines
  });

  yPosition += 5; // More padding before summary

  // Credit Transactions Summary
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Credit Transactions: ${data.transactions.length}`,
    margin,
    yPosition,
  );

  yPosition += 7;
  const totalCreditLabel = "Total Credit: ";
  doc.text(totalCreditLabel, margin, yPosition);

  const totalValue = `N${data.totalCredits.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const totalLabelWidth = doc.getTextWidth(totalCreditLabel);
  doc.setTextColor(90, 90, 90); // Real Emerald color
  doc.text(totalValue, margin + totalLabelWidth, yPosition);

  doc.setTextColor(0, 0, 0);
  yPosition += 7;

  // Ensure transactions are sorted by date (ascending) so the period covers earliest to latest credit/inflow
  const parseDate = (d: string): Date => {
    if (!d) return new Date(0);
    const s = d.trim();

    // Try DD/MM/YYYY or MM/DD/YYYY
    const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m1) {
      const [p1, p2, p3] = m1.slice(1);
      const year = p3.length === 2 ? parseInt(`20${p3}`, 10) : parseInt(p3, 10);
      const v1 = parseInt(p1, 10);
      const v2 = parseInt(p2, 10);

      // Robust logic:
      // If one is > 12, it must be the day.
      // If p1 > 12, it's DD/MM/YYYY
      if (v1 > 12) {
        return new Date(year, v2 - 1, v1);
      }
      // If p2 > 12, it's MM/DD/YYYY
      if (v2 > 12) {
        return new Date(year, v1 - 1, v2);
      }
      // Ambiguous: Assume DD/MM/YYYY as it's standard in Nigeria
      return new Date(year, v2 - 1, v1);
    }

    // Try YYYY-MM-DD
    const m2 = s.match(/^(\d{4})[\-](\d{1,2})[\-](\d{1,2})$/);
    if (m2) {
      const [yyyy, mm, dd] = m2.slice(1);
      return new Date(
        parseInt(yyyy, 10),
        parseInt(mm, 10) - 1,
        parseInt(dd, 10),
      );
    }

    const dt = new Date(s);
    return isNaN(dt.getTime()) ? new Date(0) : dt;
  };

  // Sort all transactions ascending first to pick earliest/latest for the label
  const sortedAsc = [...data.transactions].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
  );
  const derivedStart =
    sortedAsc.length > 0 ? sortedAsc[0].date : data.startDate;
  const derivedEnd =
    sortedAsc.length > 0 ? sortedAsc[sortedAsc.length - 1].date : data.endDate;

  // Make a shallow copy and sort - latest to earliest (descending) for the display table
  const txns = [...data.transactions].sort((a, b) => {
    return parseDate(b.date).getTime() - parseDate(a.date).getTime();
  });

  // Period Covered - render 'Period:' in bold and keep the dates in normal weight
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const periodLabel = "Credit Period:";
  doc.text(periodLabel, margin, yPosition);

  const labelWidth = doc.getTextWidth(periodLabel + " ");
  doc.setFont("helvetica", "normal");
  doc.text(
    `${derivedStart} to ${derivedEnd}`,
    margin + labelWidth + 2,
    yPosition,
  );

  yPosition += 7;

  // Prepare table data with 4 columns: Date, Narration, Credit, Balance
  const tableData = txns.map((txn) => [
    txn.date,
    txn.description, // Full narration text - will wrap
    `N${txn.amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    `N${txn.balance.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
  ]);

  // Compute available width and set column widths so table spans margins
  const availableWidth = pageWidth - margin * 2;
  const dateColWidth = 28; // mm
  const creditColWidth = 40; // mm
  const balanceColWidth = 40; // mm
  const narrationColWidth = Math.max(
    availableWidth - (dateColWidth + creditColWidth + balanceColWidth),
    60,
  );

  // Add table using autoTable
  autoTable(doc, {
    startY: yPosition,
    head: [["Date", "Narration", "Credit", "Balance"]],
    body: tableData,
    tableWidth: availableWidth,
    theme: "striped",
    headStyles: {
      fillColor: [55, 42, 172], // indigo colour
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      font: "helvetica",
    },
    styles: {
      fontSize: 8, // Smaller font to fit more content
      cellPadding: 3,
      overflow: "linebreak", // Enable text wrapping
      cellWidth: "wrap", // Allow cells to wrap
      font: "helvetica", // Monospaced font for all cells by default (best for alignment)
    },
    columnStyles: {
      0: { cellWidth: dateColWidth, halign: "left", font: "helvetica" }, // Date - revert to helvetica
      1: {
        cellWidth: narrationColWidth,
        halign: "left",
        font: "helvetica",
        cellPadding: { left: 3, right: 3, top: 2, bottom: 2 },
        overflow: "linebreak",
      }, // Narration - widest, revert to helvetica
      2: { cellWidth: creditColWidth, halign: "left" }, // Credit - inherits courier
      3: { cellWidth: balanceColWidth, halign: "left" }, // Balance - inherits courier
    },
    margin: { left: margin, right: margin, bottom: footerHeight },
    pageBreak: "auto",
    showHead: "everyPage",
  });

  // Add Disclaimer at the end
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yPosition = (doc as any).lastAutoTable?.finalY ?? yPosition + 12;

  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 25;
  }

  doc.setDrawColor(245, 245, 245);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(130, 130, 130);
  const disclaimer =
    "Note: Credit information extraction from bank statements may not be 100% accurate. Please confirm before using this document for important purposes.";
  const lines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
  doc.text(lines, margin, yPosition);

  // Add footer to all pages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  // Return as Blob
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
