// Message Types
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  options?: { label: string; value: string | boolean }[];
  pdfBlob?: Blob; // Optional PDF blob for bank statement downloads
  pdfFilename?: string; // Optional filename for the PDF
  // Optional file metadata for uploads
  fileName?: string;
  fileType?: 'image' | 'pdf' | 'bank';
  fileSize?: number;
  // Indicates a processing/loading assistant message (e.g., while a file is being analyzed)
  isProcessing?: boolean;
  processingProgress?: string;
  progressCurrent?: number;
  progressTotal?: number;
  // Editing metadata
  edited?: boolean;
  editedAt?: Date;
  // For tax estimator: separate content for PDF generation (markdown) vs display (HTML)
  pdfContent?: string;
};
