# Metropol CRB (Credit Reference Bureau) API Integration Guide
**Version:** 3.8 Architecture & Implementation Specification  
**Platform:** EvidCheck Verification Backend (Next.js 16 + Convex)  
**Author:** EvidCheck Engineering Team  
**Date:** November 2026  

---

## 1. Overview & Architectural Role in EvidCheck

**Metropol Corporation Limited (MCRB)** is a licensed Credit Reference Bureau by the Central Bank of Kenya (CBK). 

Integrating with Metropol CRB empowers EvidCheck to conduct automated **Credit Standing, Financial Due Diligence, Delinquency Checks, and Identity Corroboration** for:
- Pre-employment vetting for finance, executive, procurement, and trust-sensitive roles.
- Corporate due diligence & supplier vetting (Business KYC/KYB).
- Individual background checks with explicit candidate consent.

```
+-------------------------------------------------------------------------------+
|                           EVIDCHECK PLATFORM                                  |
|                                                                               |
|  [ Candidate / Employer ] ──(Consent Captured)──> [ Convex Backend Action ]   |
+-------------------------------------------------------------+-----------------+
                                                              |
                                                              | HTTPS + SHA-256 HMAC
                                                              | Dedicated Headers
                                                              v
+-------------------------------------------------------------------------------+
|                      METROPOL CRB GATEWAY (api.metropol.co.ke)               |
|                                                                               |
|  • /identity/verify          (Report Type 1)  - Government ID Verification    |
|  • /delinquency/status       (Report Type 2)  - Current/Historical NPA Check  |
|  • /score/consumer           (Report Type 3)  - Metro Score (300 - 850)       |
|  • /report/pdf               (Report Type 4)  - Binary Base64 Credit Dossier  |
|  • /report/credit_info       (Report Type 12) - Full Enhanced Credit Info     |
|  • /report/credit_info       (Report Type 13) - Minified Credit Info          |
+-------------------------------------------------------------------------------+
```

---

## 2. Metropol Access Protocols & Security Requirements

### 2.1 Base URL & Environment Configuration
```env
METROPOL_BASE_URL=https://api.metropol.co.ke
METROPOL_PORT=443
METROPOL_API_VERSION=v2_1
METROPOL_PUBLIC_KEY=DKKEIE3CKGPAIRJVN495JFJAJ
METROPOL_PRIVATE_KEY=your_metropol_private_key_here
```

### 2.2 Mandatory Request Headers
Every request to the Metropol API **must** contain four headers:

| Header Name | Type | Description |
|---|---|---|
| `Content-Type` | `string` | Must strictly be `application/json` |
| `X-METROPOL-REST-API-KEY` | `string` | Your Public API Key issued by Metropol |
| `X-METROPOL-REST-API-HASH` | `string` | Hexadecimal SHA-256 signature generated per request |
| `X-METROPOL-REST-API-TIMESTAMP` | `string` | Current UTC timestamp formatted as a 20-character integer |

### 2.3 Cryptographic Hash Signature (`X-METROPOL-REST-API-HASH`)
The hash is computed by concatenating four elements into a single UTF-8 string:

$$\text{Hash Input} = \text{private\_key} + \text{json\_object} + \text{public\_key} + \text{timestamp}$$

$$\text{X-METROPOL-REST-API-HASH} = \text{SHA256}(\text{Hash Input}).\text{toHex}()$$

> [!IMPORTANT]
> **Strict JSON Formatting Rule:**  
> The JSON payload string (`json_object`) **must have zero spaces** between key-value pairs and delimiters (e.g. `{"report_type":2,"identity_number":"880000088","identity_type":"001"}`). Any space will cause an `E027: Hash Mismatch` error.

### 2.4 Timestamp Requirements & Time Synchronization
* **Format:** `YYYYMMDDHHMMSSssssss` (Year, Month, Day, Hour, Minute, Second, Microseconds/Milliseconds) — **strictly at least 20 characters**.
* **Tolerance:** The API server enforces a maximum drift of **45 seconds** between client time and Metropol server time. Servers must be synchronized via NTP.

---

## 3. Key Metropol Reference Codes & Enums

### 3.1 Identity Types (`identity_type`)
| Code | Identity Document | Notes |
|---|---|---|
| `001` | **National ID** | Kenyan Citizen ID (Standard) |
| `002` | **Passport** | Kenyan or Foreign Passport |
| `003` | **Service ID** | Military / Police / Diplomatic Service |
| `004` | **Alien Registration** | Foreign resident certificate |
| `005` | **Company/Business Registration** | BRS Registration / Certificate of Incorporation |

### 3.2 Report Reasons (`report_reason`)
| Code | Reason | Best Used In EvidCheck |
|---|---|---|
| `1` | New credit application | Financial credit evaluations |
| `2` | Review of existing credit | Periodic customer review |
| `3` | **Verify customer details** | Pre-employment background checks & KYC |
| `4` | **Direct customer request** | Candidate self-service verification |

### 3.3 Delinquency Status Codes (`delinquency_code`)
| Code | Status | Meaning for Background Checks |
|---|---|---|
| `001` | **Identity Not Found** | Candidate has no record at the Credit Bureau |
| `002` | **No Account Information** | Candidate found, but has zero credit lines / loans |
| `003` | **No Delinquency** | **Clean Record.** Candidate is fully performing, zero NPA |
| `004` | **Currently Delinquent** | **Risk Flag.** Candidate has at least one Non-Performing Account (NPA / Default) |
| `005` | **Historical Delinquency** | Candidate defaulted in the past, but is currently cleared / performing |

### 3.4 Key Error Codes & Retries
* `E409 (Duplicate Request)`: If an identical request is received within **60 seconds**, Metropol rejects it with `E409`. EvidCheck must cache/debounce calls for 60 seconds.
* `E025 (Time Mismatch)`: Client clock is off by $>45\text{ seconds}$. Re-sync server time via NTP.
* `E027 (Hash Mismatch)`: Verify JSON has zero whitespace and matches hash input concatenation.

---

## 4. Test Environment & Sandboxing

Metropol provides dummy test IDs to be used in development:

| Test ID Number | Expected Behavior / Test Profile |
|---|---|
| `550000055` | Test Subject 1 (Performing accounts) |
| `660000066` | Test Subject 2 |
| `770000077` | Test Subject 3 |
| `880000088` | Test Subject 4 (Complex history: NPA + performing loans + mobile loans) |
| `990000099` | Test Subject 5 |

---

## 5. TypeScript / Convex Implementation

### 5.1 Cryptographic Header & Helper Module
Create `convex/lib/metropolCrypto.ts`:

```typescript
import crypto from "crypto";

export interface MetropolAuthConfig {
  publicKey: string;
  privateKey: string;
}

export interface MetropolHeaders {
  "Content-Type": string;
  "X-METROPOL-REST-API-KEY": string;
  "X-METROPOL-REST-API-HASH": string;
  "X-METROPOL-REST-API-TIMESTAMP": string;
}

/**
 * Generates an integer timestamp in UTC formatted as YYYYMMDDHHMMSSssssss (minimum 20 characters)
 */
export function generateMetropolTimestamp(date: Date = new Date()): string {
  const pad = (n: number, z = 2) => String(n).padStart(z, "0");
  
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  const millis = pad(date.getUTCMilliseconds(), 3);
  const micros = "000"; // Microsecond padding to ensure >= 20 chars

  // Result: YYYYMMDDHHMMSSmmm000 (20 chars total)
  return `${year}${month}${day}${hours}${minutes}${seconds}${millis}${micros}`;
}

/**
 * Compacts a JSON payload string to ensure ZERO whitespace between keys and values.
 */
export function compactJson(obj: Record<string, any>): string {
  return JSON.stringify(obj);
}

/**
 * Builds the mandatory Metropol API headers including SHA-256 signature.
 */
export function buildMetropolHeaders(
  payloadObj: Record<string, any>,
  config: MetropolAuthConfig
): { headers: MetropolHeaders; compactBody: string } {
  const timestamp = generateMetropolTimestamp();
  const compactBody = compactJson(payloadObj);

  // Hash formula: private_key + json_object + public_key + timestamp
  const rawHashString = `${config.privateKey}${compactBody}${config.publicKey}${timestamp}`;
  const signature = crypto
    .createHash("sha256")
    .update(rawHashString, "utf8")
    .digest("hex");

  return {
    headers: {
      "Content-Type": "application/json",
      "X-METROPOL-REST-API-KEY": config.publicKey,
      "X-METROPOL-REST-API-HASH": signature,
      "X-METROPOL-REST-API-TIMESTAMP": timestamp,
    },
    compactBody,
  };
}
```

---

### 5.2 Core Metropol Client & Convex Action
Create `convex/metropol.ts`:

```typescript
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { buildMetropolHeaders } from "./lib/metropolCrypto";

function getMetropolConfig() {
  const publicKey = process.env.METROPOL_PUBLIC_KEY;
  const privateKey = process.env.METROPOL_PRIVATE_KEY;
  const baseUrl = process.env.METROPOL_BASE_URL || "https://api.metropol.co.ke";
  const port = process.env.METROPOL_PORT || "443";
  const version = process.env.METROPOL_API_VERSION || "v2_1";

  if (!publicKey || !privateKey) {
    throw new Error("Metropol API credentials (METROPOL_PUBLIC_KEY, METROPOL_PRIVATE_KEY) not configured.");
  }

  return { publicKey, privateKey, baseUrl, port, version };
}

/**
 * Generic HTTP dispatcher for Metropol endpoints
 */
async function sendMetropolRequest(endpoint: string, payload: Record<string, any>) {
  const config = getMetropolConfig();
  const url = `${config.baseUrl}:${config.port}/${config.version}${endpoint}`;

  const { headers, compactBody } = buildMetropolHeaders(payload, config);

  const response = await fetch(url, {
    method: "POST",
    headers: headers as unknown as HeadersInit,
    body: compactBody,
  });

  const data = await response.json();

  if (data.has_error) {
    throw new Error(`Metropol Error [${data.api_code}]: ${data.api_code_description}`);
  }

  return data;
}

// ----------------------------------------------------------------------------
// 1. Delinquency Check (Report Type 2) - Fast Flag Check
// ----------------------------------------------------------------------------
export const checkDelinquency = action({
  args: {
    identityNumber: v.string(),
    identityType: v.optional(v.string()), // Defaults to "001" (National ID)
    loanAmount: v.optional(v.number()),   // Required by API, default e.g. 1000
  },
  handler: async (ctx, args) => {
    const payload = {
      report_type: 2,
      identity_number: args.identityNumber,
      identity_type: args.identityType || "001",
      loan_amount: args.loanAmount || 1000,
    };

    const res = await sendMetropolRequest("/delinquency/status", payload);

    return {
      delinquencyCode: res.delinquency_code as "001" | "002" | "003" | "004" | "005",
      delinquencySummary: res.delinquency_summary,
      isClean: res.delinquency_code === "003",
      isDefaulted: res.delinquency_code === "004",
      hasHistoricalDefault: res.delinquency_code === "005",
      transactionId: res.trx_id,
    };
  },
});

// ----------------------------------------------------------------------------
// 2. Consumer Credit Score (Report Type 3)
// ----------------------------------------------------------------------------
export const getConsumerScore = action({
  args: {
    identityNumber: v.string(),
    identityType: v.optional(v.string()),
    isMobileScore: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const payload = {
      report_type: 3,
      identity_number: args.identityNumber,
      identity_type: args.identityType || "001",
      mobile_score: args.isMobileScore ?? false,
    };

    const res = await sendMetropolRequest("/score/consumer", payload);

    return {
      creditScore: parseInt(res.credit_score, 10),
      asAt: res.as_at,
      identityNumber: res.identity_number,
    };
  },
});

// ----------------------------------------------------------------------------
// 3. Minified Credit Summary (Report Type 13)
// ----------------------------------------------------------------------------
export const getMinifiedCreditSummary = action({
  args: {
    identityNumber: v.string(),
    identityType: v.optional(v.string()),
    reportReason: v.optional(v.number()), // 3: verify customer details
  },
  handler: async (ctx, args) => {
    const payload = {
      report_type: 13,
      identity_number: args.identityNumber,
      identity_type: args.identityType || "001",
      loan_amount: 1000,
      report_reason: args.reportReason || 3,
    };

    const res = await sendMetropolRequest("/report/credit_info", payload);

    return {
      daysInArrears: res.days_in_arrears,
      isNonPerforming: res.npl_flag === 1,
      negativeHistoryIndicator: res.negative_his_indicator,
      outstandingBalance: res.outstanding_balance,
      transactionId: res.trx_id,
    };
  },
});

// ----------------------------------------------------------------------------
// 4. Download Full PDF Credit Report (Report Type 4)
// ----------------------------------------------------------------------------
export const fetchCreditReportPdf = action({
  args: {
    identityNumber: v.string(),
    identityType: v.optional(v.string()),
    reportReason: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const payload = {
      report_type: 4,
      identity_number: args.identityNumber,
      identity_type: args.identityType || "001",
      loan_amount: 1000,
      report_reason: args.reportReason || 3,
    };

    const res = await sendMetropolRequest("/report/pdf", payload);

    return {
      referenceNumber: res.reference_number,
      encoding: res.encoding, // "base64"
      pdfBase64: res.report,
      transactionId: res.trx_id,
    };
  },
});

// ----------------------------------------------------------------------------
// 5. Health Check Action
// ----------------------------------------------------------------------------
export const checkMetropolHealth = action({
  args: {},
  handler: async () => {
    const config = getMetropolConfig();
    const url = `${config.baseUrl}:${config.port}/${config.version}/health`;

    const response = await fetch(url, { method: "GET" });
    const data = await response.json();

    return {
      isAvailable: data.api_code === "E200",
      description: data.api_code_description,
    };
  },
});
```

---

## 6. Integration with EvidCheck Verification Workflows

When an enterprise client creates a **Financial Due Diligence / Credit Check** job on EvidCheck:

1. **Consent Verification:** Confirm candidate consent token is valid.
2. **Execute Delinquency & Score:** Call `checkDelinquency` and `getConsumerScore`.
3. **Parse Results for Client Dashboard:**
   - Score $\ge 650$: Green (Low Credit Risk)
   - Score $500 - 649$: Amber (Moderate Risk)
   - Delinquency `004` (NPA Active): Red (Adverse Credit Finding)
4. **PDF Archival:** Store the generated base64 PDF in encrypted storage for authorized employer download.

---

## 7. Next Steps for Implementation
1. **Acquire Credentials:** Obtain `METROPOL_PUBLIC_KEY`, `METROPOL_PRIVATE_KEY`, and active sandbox port from Metropol Account Manager.
2. **Deploy Actions:** Wire `convex/metropol.ts` to the Verification Dashboard UI under `app/dashboard/verification/`.
3. **Run Sandbox Tests:** Execute test queries with Dummy ID `880000088` and assert clean response parsing.
