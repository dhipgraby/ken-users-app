import { ReactNode } from "react";

export type ReportingContext = {
  reportingYear?: number;
  periodStart?: string;
  periodEnd?: string;
  organisationName?: string;
  organisationAddress?: string;
  organisationLogoUrl?: string;
  contactName?: string;
  contactPosition?: string;
  contactEmail?: string;
  companyNumber?: string;
  // Optional metrics
  scope1_tCO2e?: number | string;
  scope2_tCO2e?: number | string;
  scope3_tCO2e?: number | string;
  total_tCO2e?: number | string;
  biogenic_tCO2e?: number | string;
  biogenicRows?: Array<{ source: string; tCO2e: number }>;
  renewableElectricity_kWh?: number | string;
  marketBasedElectricity_tCO2e?: number | string;
  turnover?: number | string;
  employeesFTE?: number | string;
  intensityPerMillionTurnover?: number | string;
  intensityPerFTE?: number | string;
  consolidationApproach?: string;
  reportingMethod?: string;
};

export type Section = ReactNode;

export function fmt(value: number | string | undefined, fallback = "—"): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return fallback;
    // Limit to 5 decimal places for emission values
    const rounded = Math.round(value * 100000) / 100000;
    return rounded.toString();
  }

  // Check if it's an ISO date string and format it as DD/MM/YYYY
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      // Parse YYYY-MM-DD directly to avoid timezone issues
      const [year, month, day] = value.split("T")[0].split("-");
      return `${day}/${month}/${year}`;
    } catch {
      // If parsing fails, return the original value
      return value;
    }
  }

  return value;
}
