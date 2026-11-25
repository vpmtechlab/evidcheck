/**
 * Metropol CRB (Credit Reference Bureau) Profile Fixtures & Deterministic Generator
 * Conforms to Metropol API Developer Guide Version 3.8
 */

export interface MetropolAccountInfo {
  account_number: string;
  account_status: string; // "Active" | "Closed" | "Write-Off" | "Fully Settled"
  product_type_name: string; // "Personal Loan" | "Mobile Banking Loan" | "Overdraft" | "Credit Card"
  original_amount: number;
  current_balance: number;
  overdue_balance: number;
  days_in_arrears: number;
  delinquency_code: string;
  date_opened: string;
  currency: string;
}

export interface MetropolProfileData {
  identity_number: string;
  identity_type: string;
  first_name: string;
  last_name: string;
  names: string[];
  credit_score: number;
  credit_rating: "Excellent" | "Good" | "Fair" | "Poor";
  delinquency_code: "001" | "002" | "003" | "004" | "005";
  delinquency_summary: string;
  is_guarantor: boolean;
  clearance_certificate_eligible: boolean;
  total_active_accounts: number;
  total_performing_accounts: number;
  total_npa_accounts: number;
  total_outstanding_balance: number;
  total_overdue_balance: number;
  account_info: MetropolAccountInfo[];
  lender_sector: {
    sector_bank: { account_npa: number; account_performing: number; account_performing_npa_history: number };
    sector_other: { account_npa: number; account_performing: number; account_performing_npa_history: number };
  };
  no_of_bounced_cheques: { last_12_months: number; last_6_months: number; last_3_months: number };
  no_of_enquiries: { last_12_months: number; last_6_months: number; last_3_months: number };
  bureaus_checked: string[];
  trx_id: string;
}

/**
 * Metropol Official Sandbox Test Profiles
 */
export const METROPOL_SANDBOX_PROFILES: Record<string, Partial<MetropolProfileData>> = {
  // 1. Pristine / Prime Record
  "550000055": {
    credit_score: 785,
    credit_rating: "Excellent",
    delinquency_code: "003",
    delinquency_summary: "No delinquency - Clean Record",
    clearance_certificate_eligible: true,
    total_active_accounts: 3,
    total_performing_accounts: 3,
    total_npa_accounts: 0,
    total_outstanding_balance: 45000,
    total_overdue_balance: 0,
    is_guarantor: false,
    no_of_bounced_cheques: { last_12_months: 0, last_6_months: 0, last_3_months: 0 },
    no_of_enquiries: { last_12_months: 3, last_6_months: 1, last_3_months: 0 },
    lender_sector: {
      sector_bank: { account_npa: 0, account_performing: 2, account_performing_npa_history: 0 },
      sector_other: { account_npa: 0, account_performing: 1, account_performing_npa_history: 0 },
    },
    account_info: [
      {
        account_number: "DM_55100921214881",
        account_status: "Active",
        product_type_name: "Personal Loan",
        original_amount: 150000,
        current_balance: 38000,
        overdue_balance: 0,
        days_in_arrears: 0,
        delinquency_code: "003",
        date_opened: "2023-03-15",
        currency: "KES",
      },
      {
        account_number: "DM_55204891238492",
        account_status: "Active",
        product_type_name: "Credit Card",
        original_amount: 50000,
        current_balance: 7000,
        overdue_balance: 0,
        days_in_arrears: 0,
        delinquency_code: "003",
        date_opened: "2024-01-10",
        currency: "KES",
      },
    ],
  },

  // 2. Currently Delinquent (Active Default / NPA)
  "880000088": {
    credit_score: 316,
    credit_rating: "Poor",
    delinquency_code: "004",
    delinquency_summary: "Currently delinquent True - Active Default",
    clearance_certificate_eligible: false,
    total_active_accounts: 2,
    total_performing_accounts: 1,
    total_npa_accounts: 1,
    total_outstanding_balance: 138713.39,
    total_overdue_balance: 10144.44,
    is_guarantor: false,
    no_of_bounced_cheques: { last_12_months: 2, last_6_months: 0, last_3_months: 0 },
    no_of_enquiries: { last_12_months: 14, last_6_months: 8, last_3_months: 4 },
    lender_sector: {
      sector_bank: { account_npa: 1, account_performing: 1, account_performing_npa_history: 0 },
      sector_other: { account_npa: 0, account_performing: 0, account_performing_npa_history: 0 },
    },
    account_info: [
      {
        account_number: "DM_8820191767488",
        account_status: "Non-Performing",
        product_type_name: "Mobile Banking Loan",
        original_amount: 15000,
        current_balance: 9291.34,
        overdue_balance: 9291.34,
        days_in_arrears: 516,
        delinquency_code: "004",
        date_opened: "2021-08-17",
        currency: "KES",
      },
      {
        account_number: "DM_88100521214888",
        account_status: "Active",
        product_type_name: "Asset Finance Loan",
        original_amount: 600000,
        current_balance: 129422.05,
        overdue_balance: 853.1,
        days_in_arrears: 15,
        delinquency_code: "003",
        date_opened: "2022-04-29",
        currency: "KES",
      },
    ],
  },

  // 3. Historical Delinquency (Past Default, Cleared / Performing now)
  "770000077": {
    credit_score: 545,
    credit_rating: "Fair",
    delinquency_code: "005",
    delinquency_summary: "Historical delinquency True - Past Default Settled",
    clearance_certificate_eligible: true,
    total_active_accounts: 2,
    total_performing_accounts: 2,
    total_npa_accounts: 0,
    total_outstanding_balance: 24000,
    total_overdue_balance: 0,
    is_guarantor: false,
    no_of_bounced_cheques: { last_12_months: 0, last_6_months: 0, last_3_months: 0 },
    no_of_enquiries: { last_12_months: 5, last_6_months: 2, last_3_months: 1 },
    lender_sector: {
      sector_bank: { account_npa: 0, account_performing: 1, account_performing_npa_history: 1 },
      sector_other: { account_npa: 0, account_performing: 1, account_performing_npa_history: 0 },
    },
    account_info: [
      {
        account_number: "DM_7720191298492",
        account_status: "Fully Settled",
        product_type_name: "Personal Loan",
        original_amount: 80000,
        current_balance: 0,
        overdue_balance: 0,
        days_in_arrears: 0,
        delinquency_code: "005",
        date_opened: "2021-05-12",
        currency: "KES",
      },
      {
        account_number: "DM_77100492819201",
        account_status: "Active",
        product_type_name: "Overdraft",
        original_amount: 30000,
        current_balance: 24000,
        overdue_balance: 0,
        days_in_arrears: 0,
        delinquency_code: "003",
        date_opened: "2023-11-20",
        currency: "KES",
      },
    ],
  },

  // 4. Moderate Performer
  "660000066": {
    credit_score: 670,
    credit_rating: "Good",
    delinquency_code: "003",
    delinquency_summary: "No delinquency - Clean Record",
    clearance_certificate_eligible: true,
    total_active_accounts: 2,
    total_performing_accounts: 2,
    total_npa_accounts: 0,
    total_outstanding_balance: 18500,
    total_overdue_balance: 0,
    is_guarantor: false,
    no_of_bounced_cheques: { last_12_months: 0, last_6_months: 0, last_3_months: 0 },
    no_of_enquiries: { last_12_months: 2, last_6_months: 1, last_3_months: 0 },
    lender_sector: {
      sector_bank: { account_npa: 0, account_performing: 2, account_performing_npa_history: 0 },
      sector_other: { account_npa: 0, account_performing: 0, account_performing_npa_history: 0 },
    },
    account_info: [
      {
        account_number: "DM_66192849102911",
        account_status: "Active",
        product_type_name: "Mobile Banking Loan",
        original_amount: 25000,
        current_balance: 18500,
        overdue_balance: 0,
        days_in_arrears: 0,
        delinquency_code: "003",
        date_opened: "2024-02-14",
        currency: "KES",
      },
    ],
  },

  // 5. Thin File / No Credit History
  "990000099": {
    credit_score: 0,
    credit_rating: "Fair",
    delinquency_code: "002",
    delinquency_summary: "No account information available on bureau",
    clearance_certificate_eligible: true,
    total_active_accounts: 0,
    total_performing_accounts: 0,
    total_npa_accounts: 0,
    total_outstanding_balance: 0,
    total_overdue_balance: 0,
    is_guarantor: false,
    no_of_bounced_cheques: { last_12_months: 0, last_6_months: 0, last_3_months: 0 },
    no_of_enquiries: { last_12_months: 1, last_6_months: 0, last_3_months: 0 },
    lender_sector: {
      sector_bank: { account_npa: 0, account_performing: 0, account_performing_npa_history: 0 },
      sector_other: { account_npa: 0, account_performing: 0, account_performing_npa_history: 0 },
    },
    account_info: [],
  },
};

/**
 * Deterministically select or synthesize a Metropol profile for any given ID
 */
export function getDeterministicMetropolProfile(
  idNumber: string,
  firstName?: string,
  lastName?: string
): MetropolProfileData {
  const cleanId = idNumber.replace(/\D/g, "") || "880000088";
  const fName = firstName || "Brian";
  const lName = lastName || "Odhiambo";

  // If matches an official test ID, use that base
  let baseProfile = METROPOL_SANDBOX_PROFILES[cleanId];

  if (!baseProfile) {
    // Deterministic hash based on numeric digits
    const numVal = Array.from(cleanId).reduce((acc, char) => acc + parseInt(char, 10), 0);
    const mod = numVal % 10;

    if (mod === 4) {
      baseProfile = METROPOL_SANDBOX_PROFILES["880000088"]; // 10% active default
    } else if (mod === 7) {
      baseProfile = METROPOL_SANDBOX_PROFILES["770000077"]; // 10% historical default
    } else if (mod === 9) {
      baseProfile = METROPOL_SANDBOX_PROFILES["990000099"]; // 10% thin file
    } else if (mod % 2 === 0) {
      baseProfile = METROPOL_SANDBOX_PROFILES["660000066"]; // 35% moderate clean
    } else {
      baseProfile = METROPOL_SANDBOX_PROFILES["550000055"]; // 35% excellent clean
    }
  }

  // Generate deterministic unique transaction ID
  const trx_id = `metropol-trx-${cleanId}-${Date.now().toString(36)}`;

  return {
    identity_number: cleanId,
    identity_type: "001",
    first_name: fName,
    last_name: lName,
    names: [`${fName} ${lName}`, `${lName} ${fName}`],
    credit_score: baseProfile.credit_score ?? 710,
    credit_rating: baseProfile.credit_rating ?? "Good",
    delinquency_code: baseProfile.delinquency_code ?? "003",
    delinquency_summary: baseProfile.delinquency_summary ?? "No delinquency",
    clearance_certificate_eligible: baseProfile.clearance_certificate_eligible ?? true,
    total_active_accounts: baseProfile.total_active_accounts ?? 2,
    total_performing_accounts: baseProfile.total_performing_accounts ?? 2,
    total_npa_accounts: baseProfile.total_npa_accounts ?? 0,
    total_outstanding_balance: baseProfile.total_outstanding_balance ?? 35000,
    total_overdue_balance: baseProfile.total_overdue_balance ?? 0,
    is_guarantor: baseProfile.is_guarantor ?? false,
    account_info: baseProfile.account_info ?? [],
    lender_sector: baseProfile.lender_sector ?? {
      sector_bank: { account_npa: 0, account_performing: 2, account_performing_npa_history: 0 },
      sector_other: { account_npa: 0, account_performing: 0, account_performing_npa_history: 0 },
    },
    no_of_bounced_cheques: baseProfile.no_of_bounced_cheques ?? { last_12_months: 0, last_6_months: 0, last_3_months: 0 },
    no_of_enquiries: baseProfile.no_of_enquiries ?? { last_12_months: 2, last_6_months: 1, last_3_months: 0 },
    bureaus_checked: ["Metropol CRB", "TransUnion Kenya", "CreditInfo"],
    trx_id,
  };
}
