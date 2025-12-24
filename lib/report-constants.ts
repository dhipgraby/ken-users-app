export const GHG_GASES = {
  CO2: "CO2",
  CO2E: "CO2e",
  CH4: "CH4",
  N2O: "N2O",
  NF3: "NF3",
  HFC: "HFC",
  PFC: "PFC",
  SF6: "SF6"
} as const;

export type DataQualityGrade =
  | "Very Good Data Quality"
  | "Good Data Quality"
  | "Fair Data Quality"
  | "Basic Data Quality";

export const DATA_QUALITY_INFORMATION: Record<
  DataQualityGrade,
  {
    DEFINITION: string;
    ACTIVITY_DATA_CRITERIA: string;
    EMISSION_FACTOR_CRITERIA: string;
  }
> = {
  "Very Good Data Quality": {
    DEFINITION: "Very Good Data Quality",
    ACTIVITY_DATA_CRITERIA:
      "Direct measurement data for the reporting period. Reliable primary data for the reporting period. Reliable estimates based on recent operational data.",
    EMISSION_FACTOR_CRITERIA: ""
  },
  "Good Data Quality": {
    DEFINITION: "Good Data Quality",
    ACTIVITY_DATA_CRITERIA:
      "Data derived from financial or operational estimations with a justified method. Verified data partly based on assumptions.",
    EMISSION_FACTOR_CRITERIA: ""
  },
  "Fair Data Quality": {
    DEFINITION: "Fair Data Quality",
    ACTIVITY_DATA_CRITERIA:
      "Historical data used with justified adjustments to make them reliable. Estimates with limited direct measurement.",
    EMISSION_FACTOR_CRITERIA: ""
  },
  "Basic Data Quality": {
    DEFINITION: "Basic Data Quality",
    ACTIVITY_DATA_CRITERIA:
      "Broadly allocated estimates with no direct measurement, high uncertainty, and low direct measurement correlation. Spend-based calculations.",
    EMISSION_FACTOR_CRITERIA: ""
  }
};
