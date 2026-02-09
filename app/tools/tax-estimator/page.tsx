"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TaxEstimatorMessages } from "@/components/tax-estimator/TaxEstimatorMessages";
import { TaxEstimatorInput } from "@/components/tax-estimator/TaxEstimatorInput";
import { ProcessProgression } from "@/components/tax-estimator/ProcessProgression";
import { TaxEstimatorSummary } from "@/components/tax-estimator/TaxEstimatorSummary";
import {
  Message,
  TaxEstimatorState,
  TaxpayerType,
  Stage,
  StageId,
} from "@/app/types";
import {
  computeTaxableIncome,
  calculatePAYE,
  classifyCompany,
  calculateCorporateTax,
  calculateVAT,
} from "@/lib/functions";

type QuestionType = "choice" | "number" | "boolean" | "text" | "summary";

export const INDIVIDUAL_STAGES: Stage[] = [
  { id: "profile", label: "Taxpayer Profile" },
  { id: "residency", label: "Tax Residency Status" },
  { id: "employment", label: "Income Streams" },
  { id: "other_income", label: "Investments & Other Income" },
  { id: "reliefs", label: "Reliefs & Deductions" },
  { id: "cgt", label: "Capital Gains" },
  { id: "result", label: "Tax Summary" },
];

export const CORPORATE_STAGES: Stage[] = [
  { id: "profile", label: "Taxpayer Profile" },
  { id: "company_info", label: "Company Profile" },
  { id: "expenditure", label: "Expenditure & R&D" },
  { id: "group_structure", label: "Corporate Structure" },
  { id: "vat_cgt", label: "VAT & Capital Gains" },
  { id: "result", label: "Tax Summary" },
];

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: { label: string; value: string | boolean }[];
  field: string;
  branch?: TaxpayerType;
  stage: StageId;
  next?: (state: TaxEstimatorState) => string | null;
  validate?: (value: string | number | boolean) => string | null;
}

const QUESTIONS: Record<string, Question> = {
  START: {
    id: "START",
    text: "What type of taxpayer are you?",
    type: "choice",
    options: [
      { label: "Individual", value: "INDIVIDUAL" },
      { label: "Corporate", value: "CORPORATE" },
    ],
    field: "taxpayerType",
    stage: "profile",
    next: (state) =>
      state.taxpayerType === "INDIVIDUAL" ? "IND_RESIDENT" : "CORP_TURNOVER",
  },
  // INDIVIDUAL FLOW
  IND_RESIDENT: {
    id: "IND_RESIDENT",
    text: "Are you a tax resident of Nigeria? (Stayed 183+ days in a year or have strong economic ties)",
    type: "boolean",
    field: "isResident",
    stage: "residency",
    next: () => "IND_FOREIGN_INCOME",
  },
  IND_FOREIGN_INCOME: {
    id: "IND_FOREIGN_INCOME",
    text: "Do you earn income from outside Nigeria?",
    type: "boolean",
    field: "hasForeignIncome",
    stage: "residency",
    next: (state) => {
      if (state.isResident === false && state.hasForeignIncome) {
        return "IND_NIGERIAN_INCOME_ASK";
      }
      return "IND_SALARY";
    },
  },
  IND_NIGERIAN_INCOME_ASK: {
    id: "IND_NIGERIAN_INCOME_ASK",
    text: "Do you also earn any income (salary, fees, or gains) from within Nigeria?",
    type: "boolean",
    field: "hasNigerianIncome",
    stage: "residency",
    next: (state) =>
      state.hasNigerianIncome ? "IND_SALARY" : "IND_NO_TAX_SUMMARY",
  },
  IND_NO_TAX_SUMMARY: {
    id: "IND_NO_TAX_SUMMARY",
    text: "Based on your status as a non-resident with exclusively foreign income, you may have no Nigerian tax obligation. Generating your zero-tax summary...",
    type: "summary",
    field: "none",
    stage: "result",
  },
  IND_SALARY: {
    id: "IND_SALARY",
    text: "What is your annual gross salary/emoluments? (Basic, housing, transport, etc.)",
    type: "number",
    field: "employmentIncome",
    stage: "employment",
    next: () => "IND_BIK_ACCOM_ASK",
  },
  IND_BIK_ACCOM_ASK: {
    id: "IND_BIK_ACCOM_ASK",
    text: "Did you have employer-provided accommodation?",
    type: "boolean",
    field: "benefitsInKind.hasAccommodation",
    stage: "employment",
    next: (state) =>
      state.benefitsInKind?.hasAccommodation
        ? "IND_BIK_ACCOM_VAL"
        : "IND_BIK_ASSETS_ASK",
  },
  IND_BIK_ACCOM_VAL: {
    id: "IND_BIK_ACCOM_VAL",
    text: "What is the value/cost of the employer-provided accommodation?",
    type: "number",
    field: "benefitsInKind.accommodationValue",
    stage: "employment",
    next: () => "IND_BIK_ASSETS_ASK",
  },
  IND_BIK_ASSETS_ASK: {
    id: "IND_BIK_ASSETS_ASK",
    text: "Did you use employer-provided assets (e.g., cars, equipment)?",
    type: "boolean",
    field: "benefitsInKind.hasAssets",
    stage: "employment",
    next: (state) =>
      state.benefitsInKind?.hasAssets ? "IND_BIK_ASSETS_VAL" : "IND_EXTRA_ASK",
  },
  IND_BIK_ASSETS_VAL: {
    id: "IND_BIK_ASSETS_VAL",
    text: "What is the cost of the employer-provided assets?",
    type: "number",
    field: "benefitsInKind.assetsValue",
    stage: "employment",
    next: () => "IND_EXTRA_ASK",
  },
  IND_EXTRA_ASK: {
    id: "IND_EXTRA_ASK",
    text: "Did you receive any extraordinary income (Prizes, Crypto gains, Professional fees)?",
    type: "boolean",
    field: "extraordinaryIncome.hasAny",
    stage: "other_income",
    next: (state) =>
      state.extraordinaryIncome?.hasAny ? "IND_EXTRA_PRIZES" : "IND_RENT_ASK",
  },
  IND_EXTRA_PRIZES: {
    id: "IND_EXTRA_PRIZES",
    text: "What was your income from prizes or winnings?",
    type: "number",
    field: "extraordinaryIncome.prizes",
    stage: "other_income",
    next: () => "IND_EXTRA_CRYPTO",
  },
  IND_EXTRA_CRYPTO: {
    id: "IND_EXTRA_CRYPTO",
    text: "How much did you earn from digital assets (Crypto, NFTs)?",
    type: "number",
    field: "extraordinaryIncome.cryptoGains",
    stage: "other_income",
    next: () => "IND_EXTRA_FEES",
  },
  IND_EXTRA_FEES: {
    id: "IND_EXTRA_FEES",
    text: "How much did you earn from professional fees or commissions?",
    type: "number",
    field: "extraordinaryIncome.professionalFees",
    stage: "other_income",
    next: () => "IND_RENT_ASK",
  },
  IND_RENT_ASK: {
    id: "IND_RENT_ASK",
    text: "Do you rent your home? (If yes, this allows you to claim Rent Relief)",
    type: "boolean",
    field: "deductions.isRenter",
    stage: "reliefs",
    next: (state) =>
      state.deductions?.isRenter ? "IND_DED_RENT" : "IND_DED_PENSION",
  },
  IND_DED_RENT: {
    id: "IND_DED_RENT",
    text: "How much did you pay in rent this year? (For Rent Relief calculation)",
    type: "number",
    field: "deductions.rentPaid",
    stage: "reliefs",
    next: () => "IND_DED_PENSION",
  },
  IND_DED_PENSION: {
    id: "IND_DED_PENSION",
    text: "What was your total annual pension contributions?",
    type: "number",
    field: "deductions.pension",
    stage: "reliefs",
    next: () => "IND_DED_NHIS",
  },
  IND_DED_NHIS: {
    id: "IND_DED_NHIS",
    text: "How much was your annual NHIS or Life Assurance premium contribution?",
    type: "number",
    field: "deductions.nhis",
    stage: "reliefs",
    next: () => "IND_DED_COMP",
  },
  IND_DED_COMP: {
    id: "IND_DED_COMP",
    text: "How much did you receive in compensation for loss of employment or injury?",
    type: "number",
    field: "deductions.compensation",
    stage: "reliefs",
    next: () => "IND_CGT_ASK",
  },
  IND_CGT_ASK: {
    id: "IND_CGT_ASK",
    text: "Did you sell any taxable assets (shares, land, etc.)? (Property/Cars for personal use are tax exempt)",
    type: "boolean",
    field: "capitalGains.hasDisposals",
    stage: "cgt",
    next: (state) =>
      state.capitalGains?.hasDisposals ? "IND_CGT_VAL" : "IND_SUMMARY",
  },
  IND_CGT_VAL: {
    id: "IND_CGT_VAL",
    text: "What was the total net gain from asset sales?",
    type: "number",
    field: "capitalGains.netGain",
    stage: "cgt",
    next: () => "IND_SUMMARY",
  },
  IND_SUMMARY: {
    id: "IND_SUMMARY",
    text: "Calculation complete! Generating your individual tax summary...",
    type: "summary",
    field: "none",
    stage: "result",
  },

  // CORPORATE FLOW
  CORP_TURNOVER: {
    id: "CORP_TURNOVER",
    text: "What is your company's annual turnover (revenue)?",
    type: "number",
    field: "annualTurnover",
    stage: "company_info",
    next: () => "CORP_ASSETS",
  },
  CORP_ASSETS: {
    id: "CORP_ASSETS",
    text: "What is the total value of your company's fixed assets?",
    type: "number",
    field: "fixedAssetValue",
    stage: "company_info",
    next: () => "CORP_PROFIT",
  },
  CORP_PROFIT: {
    id: "CORP_PROFIT",
    text: "What is your assessable profit? (Net profit adjusted for tax)",
    type: "number",
    field: "assessableProfit",
    stage: "company_info",
    next: () => "CORP_CAPEX",
  },
  CORP_CAPEX: {
    id: "CORP_CAPEX",
    text: "What is your qualifying capital expenditure for the year?",
    type: "number",
    field: "capitalExpenditure",
    stage: "expenditure",
    next: () => "CORP_RD",
  },
  CORP_RD: {
    id: "CORP_RD",
    text: "What is your total Research & Development (R&D) expenditure?",
    type: "number",
    field: "researchExpenditure",
    stage: "expenditure",
    next: () => "CORP_GROUP",
  },
  CORP_GROUP: {
    id: "CORP_GROUP",
    text: "Is the company part of a multinational group (Global turnover ≥ €750M)?",
    type: "boolean",
    field: "isMultinational",
    stage: "group_structure",
    next: (state) =>
      state.isMultinational ? "CORP_GLOBAL_TURNOVER" : "CORP_VAT_OUT",
  },
  CORP_GLOBAL_TURNOVER: {
    id: "CORP_GLOBAL_TURNOVER",
    text: "What is the global group turnover?",
    type: "number",
    field: "globalTurnover",
    stage: "group_structure",
    next: () => "CORP_VAT_OUT",
  },
  CORP_VAT_OUT: {
    id: "CORP_VAT_OUT",
    text: "What is the total VAT output (taxable supplies)?",
    type: "number",
    field: "vatOutputs",
    stage: "vat_cgt",
    next: () => "CORP_VAT_IN",
  },
  CORP_VAT_IN: {
    id: "CORP_VAT_IN",
    text: "What is the total VAT input (recoverable on expenses/capex)?",
    type: "number",
    field: "vatInputs",
    stage: "vat_cgt",
    next: () => "CORP_CGT",
  },
  CORP_CGT: {
    id: "CORP_CGT",
    text: "What is the total net gain from capital asset disposals?",
    type: "number",
    field: "corporateNetGain",
    stage: "vat_cgt",
    next: () => "CORP_SUMMARY",
  },
  CORP_SUMMARY: {
    id: "CORP_SUMMARY",
    text: "Calculation complete! Generating your corporate tax summary...",
    type: "summary",
    field: "none",
    stage: "result",
  },
};

export default function TaxEstimatorPage() {
  const getInitialMessage = (): Message => {
    const firstQ = QUESTIONS["START"];
    return {
      id: "q-start",
      role: "assistant",
      content: firstQ.text,
      timestamp: new Date(),
      options: firstQ.options,
    };
  };

  const [state, setState] = useState<TaxEstimatorState>({
    step: 0,
    history: [],
  });
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("START");
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const setNestedField = (
    obj: TaxEstimatorState,
    path: string,
    value: string | number | boolean,
  ): TaxEstimatorState => {
    const keys = path.split(".");
    const current = { ...obj } as Record<string, unknown>;
    let temp: Record<string, unknown> = current;
    for (let i = 0; i < keys.length - 1; i++) {
      temp[keys[i]] = { ...((temp[keys[i]] as Record<string, unknown>) || {}) };
      temp = temp[keys[i]] as Record<string, unknown>;
    }
    temp[keys[keys.length - 1]] = value;
    return current as TaxEstimatorState;
  };

  const handleNewSession = () => {
    const firstQ = QUESTIONS["START"];
    const questionMsg: Message = {
      id: "q-start",
      role: "assistant",
      content: firstQ.text,
      timestamp: new Date(),
      options: firstQ.options,
    };

    setMessages([questionMsg]);
    setState({
      step: 0,
      history: [],
    });
    setCurrentQuestionId("START");
    setInput("");
    setIsComplete(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResponse = (value: string | number | boolean) => {
    if (isComplete) return;
    const currentQuestion = QUESTIONS[currentQuestionId];

    // 1. Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content:
        currentQuestion.type === "number" && typeof value === "number"
          ? `₦ ${value.toLocaleString()}`
          : typeof value === "boolean"
            ? value
              ? "Yes"
              : "No"
            : String(value),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Update state
    const newState = setNestedField(state, currentQuestion.field, value);
    newState.history = [...(state.history || []), currentQuestionId];
    setState(newState);

    // 3. Move to next question
    const nextId = currentQuestion.next?.(newState);
    if (nextId) {
      const nextQ = QUESTIONS[nextId];
      setCurrentQuestionId(nextId);

      setIsLoading(true);
      setTimeout(() => {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: nextQ.text,
          timestamp: new Date(),
          options:
            nextQ.type === "boolean"
              ? [
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]
              : nextQ.options,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsLoading(false);

        // If it's a summary, trigger calculation
        if (nextQ.type === "summary") {
          handleSummary(newState);
        }
      }, 600);
    }
  };

  const handleSummary = (finalState: TaxEstimatorState) => {
    setIsLoading(true);
    setTimeout(() => {
      let summaryContent = "";
      let pdfContent = "";

      if (finalState.taxpayerType === "INDIVIDUAL") {
        if (
          finalState.isResident === false &&
          finalState.hasForeignIncome &&
          finalState.hasNigerianIncome === false
        ) {
          summaryContent = `<div class="tax-summary">
<h3 class="text-lg font-bold mb-5 text-center text-indigo-900 dark:text-indigo-400">No Tax Obligation</h3>
<div class="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800 mb-6">
  <p class="text-emerald-900 dark:text-emerald-100 text-center font-medium">
    Based on the information provided, you do not have a personal income tax obligation in Nigeria for the upcoming tax year.
  </p>
</div>
<div class="explanation bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 mb-6 font-medium">
  <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Why you aren't liable:</h4>
  <ul class="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
    <li><strong>Non-Residency Status:</strong> You indicated that you are not a tax resident of Nigeria (stayed less than 183 days and no strong economic ties).</li>
    <li><strong>Foreign-Source Income:</strong> Your income is earned from work performed outside Nigeria.</li>
    <li><strong>Source Principle:</strong> Under the Nigeria Tax Act 2025 (and PITA), non-residents are only liable for tax on income that accrues in or is derived from Nigeria.</li>
  </ul>
</div>
<div class="citations-section border-t border-zinc-200 dark:border-zinc-700 pt-4">
  <p class="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">References & Citations:</p>
  <div class="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
    Nigeria Tax Act 2025 (Part III - Taxation of Non-Resident Persons, Section 17); Personal Income Tax Act (PITA)
  </div>
</div>
<div class="disclaimer-section border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3">
  <p class="text-xs text-zinc-500 dark:text-zinc-500 italic leading-snug">
    This assessment is for informational purposes only. If your residency status or income source changes, your tax liability may be affected.
  </p>
</div>
</div>`;
          pdfContent = `### Individual Tax Summary (NTA 2025)
**Tax Obligation Status:** No Tax Obligation

**Assessment Summary:**
As a non-tax resident of Nigeria earning income exclusively from work performed outside Nigeria, you would generally **not** owe tax to the Nigerian government on that foreign-sourced income.

**Key Reasons:**
1. **Non-Residency:** You are not a tax resident of Nigeria.
2. **Foreign-Sourced Income:** Your work is performed outside Nigeria.
3. **Source Principle:** Under Nigerian law, non-residents are only liable for tax on income derived from Nigeria.

---CITATIONS---
**Nigeria Tax Act 2025** - Part III, Section 17 (Taxation of Non-Resident Persons)
---DISCLAIMER---
This estimate is for informational purposes only and is based on the **Nigeria Tax Act 2025**. It does not constitute professional tax advice.`;
        } else {
          const bikValue =
            (finalState.benefitsInKind?.accommodationValue || 0) * 0.2 +
            (finalState.benefitsInKind?.assetsValue || 0) * 0.05;

          const extraIncome =
            (finalState.extraordinaryIncome?.prizes || 0) +
            (finalState.extraordinaryIncome?.cryptoGains || 0) +
            (finalState.extraordinaryIncome?.professionalFees || 0);

          const compValue = Math.max(
            0,
            (finalState.deductions?.compensation || 0) - 50_000_000,
          );

          const indInput = {
            taxYear: 2026 as const,
            employmentIncome: Number(finalState.employmentIncome || 0),
            benefitsInKind: bikValue,
            otherChargeableIncome:
              extraIncome +
              compValue +
              Number(finalState.capitalGains?.netGain || 0),
            statutoryDeductions: {
              pension: Number(finalState.deductions?.pension || 0),
              nhf: 0,
              nhis: Number(finalState.deductions?.nhis || 0),
              otherApproved: 0,
            },
            rentPaid: Number(finalState.deductions?.rentPaid || 0),
          };

          const taxableIncomeRes = computeTaxableIncome(indInput);
          const payeRes = calculatePAYE(taxableIncomeRes.taxableIncome);

          // Calculate individual reliefs for display
          const reliefs = [];
          if (indInput.statutoryDeductions.pension > 0) {
            reliefs.push({
              name: "Pension Contributions",
              amount: indInput.statutoryDeductions.pension,
            });
          }
          if (indInput.statutoryDeductions.nhf > 0) {
            reliefs.push({
              name: "NHF Contributions",
              amount: indInput.statutoryDeductions.nhf,
            });
          }
          if (indInput.statutoryDeductions.nhis > 0) {
            reliefs.push({
              name: "NHIS Contributions",
              amount: indInput.statutoryDeductions.nhis,
            });
          }
          if (indInput.statutoryDeductions.otherApproved > 0) {
            reliefs.push({
              name: "Other Approved Deductions",
              amount: indInput.statutoryDeductions.otherApproved,
            });
          }
          const rentRelief = indInput.rentPaid
            ? Math.min(indInput.rentPaid * 0.2, 500_000)
            : 0;
          if (rentRelief > 0) {
            reliefs.push({ name: "Rent Relief", amount: rentRelief });
          }

          // HTML version for display
          summaryContent = `<div class="tax-summary">
<h3 class="text-lg font-bold mb-5 text-center">Individual Tax Summary</h3>

<div class="summary-grid grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
  <div class="summary-item bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
    <div class="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Gross Income</div>
    <div class="text-xl font-bold text-blue-900 dark:text-blue-100">₦ ${taxableIncomeRes.grossIncome.toLocaleString()}</div>
  </div>
  <div class="summary-item bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
    <div class="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Reliefs/Deductions</div>
    <div class="text-xl font-bold text-green-900 dark:text-green-100">₦ ${taxableIncomeRes.totalReliefs.toLocaleString()}</div>
  </div>
  <div class="summary-item bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
    <div class="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Taxable Income</div>
    <div class="text-xl font-bold text-purple-900 dark:text-purple-100">₦ ${taxableIncomeRes.taxableIncome.toLocaleString()}</div>
  </div>
</div>

${
  reliefs.length > 1 && taxableIncomeRes.totalReliefs > 0
    ? `
<hr class="my-6 border-zinc-200 dark:border-zinc-700">

<div class="reliefs-deductions mb-6">
  <h4 class="text-base font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Reliefs & Deductions Applied</h4>
  <div class="space-y-2">
    ${reliefs
      .map(
        (
          relief,
        ) => `<div class="relief-item flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <span class="text-sm font-medium">${relief.name}</span>
      <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">₦ ${relief.amount.toLocaleString()}</span>
    </div>`,
      )
      .join("")}
    <div class="relief-total flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 mt-3">
      <span class="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Total Reliefs Applied</span>
      <span class="text-sm font-bold text-emerald-900 dark:text-emerald-100">₦ ${taxableIncomeRes.totalReliefs.toLocaleString()}</span>
    </div>
  </div>
</div>
`
    : ""
}

<div class="pit-breakdown mb-6">
  <h4 class="text-base font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Detailed PIT Breakdown</h4>
  <div class="space-y-1">
    ${payeRes.bands
      .map(
        (
          b,
        ) => `<div class="relief-item flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm">
        <div class="flex items-center gap-1.5"><span>${(b.rate * 100).toFixed(2)}% tax rate</span>
      <span class="font-medium">on ₦ ${b.taxableAmount.toLocaleString()}</span></div>
      <span class="font-bold text-indigo-600 dark:text-indigo-400">₦ ${b.taxAmount.toLocaleString()}</span>
    </div>`,
      )
      .join("")}
  </div>
</div>

<div class="tax-obligations grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
  <div class="obligation-item bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
    <div class="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Total Estimated Tax Payable</div>
    <div class="text-2xl font-bold text-orange-900 dark:text-orange-100">₦ ${payeRes.totalAnnualTax.toLocaleString()}</div>
  </div>
  <div class="obligation-item bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
    <div class="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Monthly Obligation</div>
    <div class="text-2xl font-bold text-red-900 dark:text-red-100">₦ ${payeRes.monthlyPAYE.toLocaleString()}</div>
  </div>
</div>

<div class="explanation bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 mb-6">
  <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Summary Explanation</h4>
  <p class="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
    ${(() => {
      const effectiveRate = (
        (payeRes.totalAnnualTax / taxableIncomeRes.grossIncome) *
        100
      ).toFixed(2);
      const reliefCount = reliefs.length;
      const hasRentRelief = reliefs.some((r) => r.name === "Rent Relief");
      const explanationParts = [];

      explanationParts.push(
        `Your estimated annual tax liability is ₦ ${payeRes.totalAnnualTax.toLocaleString()} with a ${effectiveRate}% effective tax rate.`,
      );

      if (reliefCount > 0) {
        explanationParts.push(
          `We've applied ${reliefCount} relief${reliefCount > 1 ? "s" : ""} totaling ₦ ${taxableIncomeRes.totalReliefs.toLocaleString()}${hasRentRelief ? ", including the ₦500,000 rent relief cap where applicable" : ""}.`,
        );
      }

      if (payeRes.bands.length > 1) {
        explanationParts.push(
          `Your taxable income of ₦ ${taxableIncomeRes.taxableIncome.toLocaleString()} falls across ${payeRes.bands.length} tax band${payeRes.bands.length > 1 ? "s" : ""} under the 2026 progressive system.`,
        );
      }

      explanationParts.push(
        `Monthly tax obligation is ₦ ${payeRes.monthlyPAYE.toLocaleString()}.`,
      );

      return explanationParts.join(" ");
    })()}
  </p>
</div>

<div class="citations-section border-t border-zinc-200 dark:border-zinc-700 pt-4">
  <p class="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">References & Citations:</p>
  <div class="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
    ${payeRes.lawReferences.join("; ")}
  </div>
</div>

<div class="disclaimer-section border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3">
  <p class="text-xs text-zinc-500 dark:text-zinc-500 italic leading-snug">
    This estimate is for informational purposes only and is based on the Nigeria Tax Act 2025. It does not constitute professional tax advice. Consult with a qualified tax consultant for official filings.
  </p>
</div>
</div>`;

          // Markdown version for PDF (cleaner spacing)
          pdfContent = `### Individual Tax Summary (NTA 2025)
**Gross Income:** ₦ ${taxableIncomeRes.grossIncome.toLocaleString()}
**Total Reliefs/Deductions:** ₦ ${taxableIncomeRes.totalReliefs.toLocaleString()}
**Taxable Income:** ₦ ${taxableIncomeRes.taxableIncome.toLocaleString()}
${
  reliefs.length > 1 && taxableIncomeRes.totalReliefs > 0
    ? `---
**Reliefs & Deductions Applied:**
${reliefs.map((relief) => `• ${relief.name}: ₦ ${relief.amount.toLocaleString()}`).join("\n")}
• **Total Reliefs Applied:** ₦ ${taxableIncomeRes.totalReliefs.toLocaleString()}
---`
    : "---"
}
**Detailed PIT Breakdown:**
${payeRes.bands.map((b) => `• ${(b.rate * 100).toFixed(2)}% on ₦ ${b.taxableAmount.toLocaleString()} = ₦ ${b.taxAmount.toLocaleString()}`).join("\n")}
**Total Estimated Tax Payable:** ₦${payeRes.totalAnnualTax.toLocaleString()}
**Monthly Obligation:** ₦${payeRes.monthlyPAYE.toLocaleString()}
**Summary Explanation:**
${(() => {
  const effectiveRate = (
    (payeRes.totalAnnualTax / taxableIncomeRes.grossIncome) *
    100
  ).toFixed(2);
  const reliefCount = reliefs.length;
  const hasRentRelief = reliefs.some((r) => r.name === "Rent Relief");
  const explanationParts = [];

  explanationParts.push(
    `Your estimated annual tax liability is ₦ ${payeRes.totalAnnualTax.toLocaleString()} with a ${effectiveRate}% effective tax rate.`,
  );

  if (reliefCount > 0) {
    explanationParts.push(
      `We've applied ${reliefCount} relief${reliefCount > 1 ? "s" : ""} totaling ₦ ${taxableIncomeRes.totalReliefs.toLocaleString()}${hasRentRelief ? ", including the ₦500,000 rent relief cap where applicable" : ""}.`,
    );
  }

  if (payeRes.bands.length > 1) {
    explanationParts.push(
      `Your taxable income of ₦ ${taxableIncomeRes.taxableIncome.toLocaleString()} falls across ${payeRes.bands.length} tax band${payeRes.bands.length > 1 ? "s" : ""} under the 2026 progressive system.`,
    );
  }

  explanationParts.push(
    `Monthly tax obligation is ₦ ${payeRes.monthlyPAYE.toLocaleString()}.`,
  );

  return explanationParts.join(" ");
})()}
---CITATIONS---
**Nigeria Tax Act 2025** - Individual Tax Scale; Rent Relief Provision - Section 33
---DISCLAIMER---
This estimate is for informational purposes only and is based on the **Nigeria Tax Act 2025**. It does not constitute professional tax advice. Please consult with a qualified tax consultant for official filings.`;
        }
      } else {
        // Corporate
        const turnover = Number(finalState.annualTurnover || 0);
        const assets = Number(finalState.fixedAssetValue || 0);
        const rawProfit = Number(finalState.assessableProfit || 0);
        const rdExpenditure = Number(finalState.researchExpenditure || 0);
        const capEx = Number(finalState.capitalExpenditure || 0);

        // Apply R&D Cap: Capped at 5% of turnover
        const rdCap = turnover * 0.05;
        const disallowedRD = Math.max(0, rdExpenditure - rdCap);
        const adjustedProfit = rawProfit + disallowedRD;

        const classification = classifyCompany(turnover, assets);

        const corpRes = calculateCorporateTax({
          annualRevenue: turnover,
          assessableProfit: adjustedProfit,
          fixedAssets: assets,
          isSmallCompany: classification === "SMALL",
          corporateRate: classification === "LARGE" ? 0.3 : 0.2, // Defaulting to 20% for medium
          developmentLevy: classification === "LARGE" ? 0.04 : 0,
        });

        // Economic Development Tax Incentive (EDTI) Credit - 5% of qualifying capital expenditure
        const edtiCredit = capEx * 0.05;
        const finalCit = Math.max(0, corpRes.corporateTax - edtiCredit);

        const vAtRes = calculateVAT(
          Number(finalState.vatOutputs || 0),
          Number(finalState.vatInputs || 0),
        );

        let cgtAmount = 0;
        if (finalState.corporateNetGain) {
          const cgtRate = classification === "LARGE" ? 0.3 : 0.2;
          cgtAmount =
            classification === "SMALL"
              ? 0
              : Number(finalState.corporateNetGain) * cgtRate;
        }

        const totalLiability =
          finalCit +
          corpRes.developmentLevyAmount +
          vAtRes.vatPayable +
          cgtAmount;

        // HTML version for display
        summaryContent = `<div class="tax-summary">
<h3 class="text-lg font-semibold mb-4 text-center">Corporate Tax Summary (NTA 2025)</h3>

<div class="company-info grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
  <div class="company-category bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
    <div class="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">Company Category</div>
    <div class="text-lg font-bold text-indigo-900 dark:text-indigo-100">${classification} Company</div>
  </div>
  <div class="adjusted-profit bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
    <div class="text-sm font-medium text-teal-700 dark:text-teal-300 mb-1">Adjusted Assessable Profit</div>
    <div class="text-lg font-bold text-teal-900 dark:text-teal-100">₦ ${adjustedProfit.toLocaleString()}</div>
    ${disallowedRD > 0 ? `<div class="text-xs text-teal-600 dark:text-teal-400 mt-1 italic">Note: ₦${disallowedRD.toLocaleString()} R&D expenditure disallowed per 5% cap</div>` : ""}
  </div>
</div>

<div class="liability-breakdown mb-6">
  <h4 class="text-base font-semibold mb-3 text-zinc-900 dark:text-zinc-100">Tax Liability Breakdown</h4>
  <div class="space-y-3">
    <div class="breakdown-item flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <span class="text-sm font-medium">Company Income Tax (CIT)</span>
      <div class="text-right">
        <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">₦ ${finalCit.toLocaleString()}</span>
        ${edtiCredit > 0 ? `<div class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">After ₦ ${edtiCredit.toLocaleString()} EDTI cap-ex credit</div>` : ""}
      </div>
    </div>
    <div class="breakdown-item flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <span class="text-sm font-medium">Development Levy (4%)</span>
      <span class="text-sm font-bold text-orange-600 dark:text-orange-400">₦ ${corpRes.developmentLevyAmount.toLocaleString()}</span>
    </div>
    <div class="breakdown-item flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <span class="text-sm font-medium">VAT Net Payable</span>
      <span class="text-sm font-bold text-blue-600 dark:text-blue-400">₦ ${vAtRes.vatPayable.toLocaleString()}</span>
    </div>
    ${
      vAtRes.vatRefundable > 0
        ? `<div class="breakdown-item flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
      <span class="text-sm font-medium">VAT Refundable</span>
      <span class="text-sm font-bold text-green-600 dark:text-green-400">₦ ${vAtRes.vatRefundable.toLocaleString()}</span>
    </div>`
        : ""
    }
    <div class="breakdown-item flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <span class="text-sm font-medium">Capital Gains Tax</span>
      <span class="text-sm font-bold text-purple-600 dark:text-purple-400">₦ ${cgtAmount.toLocaleString()}</span>
    </div>
  </div>
</div>

<hr class="my-6 border-zinc-200 dark:border-zinc-700">

<div class="total-liability grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
  <div class="total-item bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
    <div class="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Total Estimated Liability</div>
    <div class="text-2xl font-bold text-red-900 dark:text-red-100">₦ ${totalLiability.toLocaleString()}</div>
  </div>
  <div class="rate-item bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
    <div class="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Effective Tax Rate</div>
    <div class="text-2xl font-bold text-yellow-900 dark:text-yellow-100">${((totalLiability / (adjustedProfit || 1)) * 100).toFixed(2)}%</div>
  </div>
</div>

<div class="explanation bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 mb-6">
  <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Summary Explanation</h4>
  <p class="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
    This summary classifies your company as ${classification} based on both turnover and asset value. The calculation accounts for the 4% Development Levy and specific 2025 Act incentives like the EDTI credit for capital expenditure. R&D expenses have been capped at 5% of turnover as per current regulations.
  </p>
</div>

<div class="citations-section border-t border-zinc-200 dark:border-zinc-700 pt-4">
  <p class="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">References & Citations:</p>
  <div class="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
    Nigeria Tax Act 2025 - CIT Sections; R&D Deduction Cap (5% of Turnover); EDTI Credit (Qualifying Capital Expenditure)
  </div>
</div>

<div class="disclaimer-section border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3">
  <p class="text-xs text-zinc-500 dark:text-zinc-500 italic leading-snug">
    This corporate tax estimate is provided for planning purposes under the NTA 2025 framework. It assumes standard compliance and does not account for specific industry-based exemptions or pioneer status incentives.
  </p>
</div>
</div>`;

        // Markdown version for PDF (cleaner spacing)
        pdfContent = `### Corporate Tax Summary (NTA 2025)
**Company Category:** ${classification} Company
**Adjusted Assessable Profit:** ₦ ${adjustedProfit.toLocaleString()}
${disallowedRD > 0 ? `*(Note: ₦ ${disallowedRD.toLocaleString()} R&D expenditure disallowed per 5% cap)*` : ""}
**Tax Liability Breakdown:**
• **Company Income Tax (CIT):** ₦ ${finalCit.toLocaleString()}
  ${edtiCredit > 0 ? `  *(After ₦ ${edtiCredit.toLocaleString()} EDTI cap-ex credit)*` : ""}
• **Development Levy (4%):** ₦ ${corpRes.developmentLevyAmount.toLocaleString()}
• **VAT Net Payable:** ₦ ${vAtRes.vatPayable.toLocaleString()}
${vAtRes.vatRefundable > 0 ? `• **VAT Refundable:** ₦ ${vAtRes.vatRefundable.toLocaleString()}` : ""}
• **Capital Gains Tax:** ₦ ${cgtAmount.toLocaleString()}
---
**Total Estimated Liability:** ₦ ${totalLiability.toLocaleString()}
**Effective Tax Rate:** ${((totalLiability / (adjustedProfit || 1)) * 100).toFixed(2)}%
**Summary Explanation:**
This summary classifies your company as ${classification} based on both turnover and asset value. The calculation accounts for the 4% Development Levy and specific 2025 Act incentives like the EDTI credit for capital expenditure. R&D expenses have been capped at 5% of turnover as per current regulations.
---CITATIONS---
**Nigeria Tax Act 2025** - CIT Sections; R&D Deduction Cap (5% of Turnover); EDTI Credit (Qualifying Capital Expenditure)
---DISCLAIMER---
This corporate tax estimate is provided for planning purposes under the NTA 2025 framework. It assumes standard compliance and does not account for specific industry-based exemptions or pioneer status incentives.`;
      }

      const summaryMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: summaryContent,
        pdfContent: pdfContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, summaryMsg]);
      setIsLoading(false);
      setIsComplete(true);
    }, 1500);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentQuestion = QUESTIONS[currentQuestionId];
    if (currentQuestion.type === "number") {
      const val = parseFloat(input.replace(/,/g, ""));
      if (isNaN(val)) {
        // Handle error
        return;
      }
      handleResponse(val);
    } else {
      handleResponse(input.trim());
    }
    setInput("");
  };

  const handleOptionClick = (value: string | number | boolean) => {
    handleResponse(value);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100dvh-64px)] bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        <main className="grow flex flex-col min-h-0">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12 xl:px-0 pt-6 flex flex-col h-full">
            <div className="shrink-0 space-y-4">
              <div className="max-w-2xl">
                <p className="text-lg md:text-[22px] text-zinc-800 dark:text-zinc-400 max-w-3xl leading-relaxed font-medium">
                  Our{" "}
                  <span className="text-indigo-800 dark:text-indigo-400 font-bold">
                    Tax Estimator
                  </span>{" "}
                  will guide you through estimating your taxes based on the new
                  tax Act.{" "}
                  <span className="font-bold underline decoration-indigo-500 underline-offset-4">
                    Start below...
                  </span>
                </p>
              </div>
              {/* Process progression with numbering on top of the section/stage name */}
              <div className="mt-8 mb-6">
                <ProcessProgression
                  currentStageId={
                    QUESTIONS[currentQuestionId]?.stage || "profile"
                  }
                  stages={
                    state.taxpayerType === "CORPORATE"
                      ? CORPORATE_STAGES
                      : INDIVIDUAL_STAGES
                  }
                />
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-10 lg:gap-10 grow min-h-0 pb-2">
              {/* Main Chat Area (Prompts/Questions) - Takes 2/3 width on LG */}
              <div className="lg:col-span-6 flex flex-col h-full min-h-0">
                <div className="h-full overflow-y-auto px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <TaxEstimatorMessages
                    messages={messages}
                    isLoading={isLoading}
                    onOptionClick={handleOptionClick}
                    isComplete={isComplete}
                    onNewSession={handleNewSession}
                  />
                </div>
              </div>

              {/* Summary Component (Right Sidebar) - Takes 1/3 width on LG */}
              <div className="hidden lg:block lg:col-span-4 h-full min-h-0 pt-0">
                <div className="h-full">
                  <TaxEstimatorSummary
                    state={state}
                    questions={QUESTIONS}
                    stages={
                      state.taxpayerType === "CORPORATE"
                        ? CORPORATE_STAGES
                        : INDIVIDUAL_STAGES
                    }
                    onUpdate={(field, value) => {
                      const newState = setNestedField(state, field, value);
                      setState(newState);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="shrink-0 z-40 bg-zinc-50/60 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200/50 dark:border-zinc-800/50 w-full">
          <TaxEstimatorInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            isComplete={isComplete}
            onSubmit={handleSubmit}
            onNewSession={handleNewSession}
            hasMessages={messages.length > 0}
            questionType={QUESTIONS[currentQuestionId]?.type}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
