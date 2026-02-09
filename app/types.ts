// Message Types
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: { label: string; value: string | boolean }[];
  pdfBlob?: Blob; // Optional PDF blob for bank statement downloads
  pdfFilename?: string; // Optional filename for the PDF
  // Optional file metadata for uploads
  fileName?: string;
  fileType?: "image" | "pdf" | "bank";
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

// Bank Statement Types
export interface Transaction {
  date: string;
  description: string;
  amount: number;
  balance: number;
  type: "credit" | "debit";
}

export interface BankStatementData {
  accountName: string;
  accountNumber: string;
  bankName: string;
  startDate: string;
  endDate: string;
  transactions: Transaction[];
  totalCredits: number;
}

// Tax Estimator Types
export type TaxpayerType = "INDIVIDUAL" | "CORPORATE";

export type TaxEstimatorState = {
  step: number;
  history: string[];
  taxpayerType?: TaxpayerType;
  // Individual Fields
  isResident?: boolean;
  hasForeignIncome?: boolean;
  hasNigerianIncome?: boolean;
  employmentIncome?: number;
  benefitsInKind?: {
    hasAccommodation: boolean;
    accommodationValue: number;
    hasAssets: boolean;
    assetsValue: number;
  };
  extraordinaryIncome?: {
    hasAny: boolean;
    prizes: number;
    cryptoGains: number;
    professionalFees: number;
  };
  deductions?: {
    isRenter: boolean;
    rentPaid: number;
    pension: number;
    nhis: number;
    compensation: number;
  };
  capitalGains?: {
    hasDisposals: boolean;
    netGain?: number;
    disposals: {
      type: string;
      cost: number;
      value: number;
      isExempt: boolean;
    }[];
  };
  // Corporate Fields
  annualTurnover?: number;
  fixedAssetValue?: number;
  assessableProfit?: number;
  capitalExpenditure?: number;
  researchExpenditure?: number;
  isMultinational?: boolean;
  globalTurnover?: number;
  vatOutputs?: number;
  vatInputs?: number;
  corporateNetGain?: number;
  corporateDisposals?: {
    cost: number;
    value: number;
  }[];
};

// Tax Calculation Types
export type IndividualIncomeInput = {
  taxYear: 2026;
  employmentIncome: number; // salaries, wages, benefits in cash
  benefitsInKind: number; // taxable per Act definitions
  otherChargeableIncome: number;
  statutoryDeductions: {
    pension: number; // approved pension schemes
    nhf: number;
    nhis: number;
    otherApproved: number;
  };
  rentPaid?: number; // only if relief applies per Act
};

export type PayeBandResult = {
  lowerBound: number;
  upperBound: number | null;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
};

export type PayeResult = {
  bands: PayeBandResult[];
  totalAnnualTax: number;
  monthlyPAYE: number;
  lawReferences: string[];
};

export type CorporateTaxDetails = {
  annualRevenue: number;
  assessableProfit: number;
  fixedAssets: number;
  isSmallCompany: boolean; // Computed: Revenue <= ₦50M & assets <= ₦250M
  corporateRate: number; // 30% standard for large
  developmentLevy: number; // 4% assessable profits for large
  globalMinimumTax?: number; // Typically 15% for multinationals
};

export type CorporateTaxOutput = {
  corporateTax: number;
  developmentLevyAmount: number;
  totalTaxLiability: number;
};
