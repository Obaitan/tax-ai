import {
  IndividualIncomeInput,
  PayeBandResult,
  PayeResult,
  CorporateTaxDetails,
  CorporateTaxOutput,
} from "@/app/types";

/**
 * PROVISIONS OF THE NIGERIA TAX ACT 2025 (Effective Jan 1, 2026)
 */

/**
 * 1. INDIVIDUAL INCOME TAX (PAYE)
 */

/**
 * 1. INDIVIDUAL INCOME TAX (PAYE)
 */

export function computeTaxableIncome(input: IndividualIncomeInput) {
  const grossIncome =
    input.employmentIncome + input.benefitsInKind + input.otherChargeableIncome;

  // Statutory deductions (Pension, NHF, NHIS) are now the primary reliefs
  const statutoryDeductions =
    (input.statutoryDeductions.pension || 0) +
    (input.statutoryDeductions.nhf || 0) +
    (input.statutoryDeductions.nhis || 0) +
    (input.statutoryDeductions.otherApproved || 0);

  /**
   * Rent Relief System (Replaces the old Consolidated Relief Allowance)
   * Formula: Lower of 20% of rent paid OR 500,000 NGN
   */
  const rentRelief = input.rentPaid
    ? Math.min(input.rentPaid * 0.2, 500_000)
    : 0;

  const totalReliefs = statutoryDeductions + rentRelief;

  return {
    grossIncome,
    totalReliefs,
    taxableIncome: Math.max(0, grossIncome - totalReliefs),
  };
}

/**
 * NIGERIA TAX ACT 2025 PIT BANDS:
 * First ₦800,000      | 0%
 * Next ₦2,200,000     | 7%
 * Next ₦3,000,000     | 11%
 * Next ₦4,000,000     | 15%
 * Next ₦5,000,000     | 19%
 * Above ₦15,000,000   | 25%
 */
const PAYE_BANDS_2026 = [
  { min: 0, max: 800_000, rate: 0 },
  { min: 800_001, max: 3_000_000, rate: 0.07 },
  { min: 3_000_001, max: 6_000_000, rate: 0.11 },
  { min: 6_000_001, max: 10_000_000, rate: 0.15 },
  { min: 10_000_001, max: 15_000_000, rate: 0.19 },
  { min: 15_000_001, max: null, rate: 0.25 },
];

export function calculatePAYE(taxableIncome: number): PayeResult {
  // Refined band calculation
  const calculatedBands: PayeBandResult[] = [];

  for (const band of PAYE_BANDS_2026) {
    const bandMax = band.max ?? Infinity;
    const bandMin = band.min;

    if (taxableIncome > bandMin) {
      const taxableInThisBand =
        Math.min(taxableIncome, bandMax) - (bandMin === 0 ? 0 : bandMin - 1);
      const tax = taxableInThisBand * band.rate;

      calculatedBands.push({
        lowerBound: bandMin,
        upperBound: band.max,
        rate: band.rate,
        taxableAmount: taxableInThisBand,
        taxAmount: tax,
      });
    }
  }

  const totalAnnualTax = calculatedBands.reduce((s, b) => s + b.taxAmount, 0);

  return {
    bands: calculatedBands,
    totalAnnualTax,
    monthlyPAYE: totalAnnualTax / 12,
    lawReferences: [
      "Nigeria Tax Act 2025 - Individual Tax Scale",
      "Rent Relief Provision - Section 33",
    ],
  };
}

/**
 * 2. CORPORATE INCOME TAX (CIT)
 */

export function classifyCompany(revenue: number, fixedAssets: number) {
  if (revenue <= 50_000_000 && fixedAssets <= 250_000_000) {
    return "SMALL";
  } else if (revenue > 100_000_000) {
    return "LARGE";
  } else {
    return "MEDIUM"; // Intermediate category if not explicitly small or large
  }
}

export function calculateCorporateTax(
  details: CorporateTaxDetails,
): CorporateTaxOutput {
  // CIT Rates for 2026 onwards (Nigeria Tax Act 2025):
  // Small companies (Revenue <= N50M and Assets <= N250M): 0%
  // Large companies (Revenue > N100M): 30%

  let citRate = 0.3;
  if (
    details.annualRevenue <= 50_000_000 &&
    (details.fixedAssets ?? 0) <= 250_000_000
  ) {
    citRate = 0;
  } else if (details.annualRevenue <= 100_000_000) {
    citRate = 0.2; // Assumption for Medium based on standard practice if not explicitly 30%
    // Note: The REF.md says Small is 0% and Large is 30%. It doesn't explicitly state Medium.
    // I will stick to what's in REF or assume 30% for non-small for safety.
    citRate = 0.3;
  }

  const corporateTax = details.assessableProfit * citRate;

  // Consolidated Development Levy (replaces Education Tax)
  // Rate: 4% of assessable profit for Large companies (> N100M)
  const developmentLevyRate = details.annualRevenue > 100_000_000 ? 0.04 : 0;
  const developmentLevyAmount = details.assessableProfit * developmentLevyRate;

  return {
    corporateTax,
    developmentLevyAmount,
    totalTaxLiability: corporateTax + developmentLevyAmount,
  };
}

/**
 * 3. VALUE ADDED TAX (VAT)
 */

export function calculateVAT(outputs: number, inputs: number) {
  const rate = 0.075;
  const vatPayable = (outputs - inputs) * rate;

  return {
    rate,
    outputs,
    inputs,
    vatPayable: Math.max(0, vatPayable),
    vatRefundable: vatPayable < 0 ? Math.abs(vatPayable) : 0,
    lawReferences: ["Nigeria Tax Act 2025 - VAT Section"],
  };
}

/**
 * 4. CAPITAL GAINS TAX (CGT)
 */

export function calculateIndividualCGT(gain: number) {
  // Capital gains for individuals are now taxed at progressive PIT rates
  // This means they should be added to taxable income.
  // This function might be used to show the "effective" tax on the gain.
  return calculatePAYE(gain); // Approximation if gain was the only income
}

export function calculateCorporateCGT(gain: number, revenue: number) {
  // Corporate CGT is harmonized with CIT rate (30% for large)
  const rate = revenue > 100_000_000 ? 0.3 : 0.2; // Assuming 20% for medium/small non-exempt
  if (revenue <= 50_000_000) return 0; // Small companies 0% CGT per REF.md

  return gain * rate;
}
