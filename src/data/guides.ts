/**
 * Authoritative KRA eTIMS Developer Reference Guides
 * Extracted from Official KRA Documentation, PDFs, and Statutory Requirements
 */

export interface GuideDoc {
  id: string;
  title: string;
  category: "architecture" | "onboarding" | "invoicing" | "stock" | "fuel" | "tis" | "compliance";
  summary: string;
  content: string;
}

export const GUIDES: GuideDoc[] = [
  {
    id: "oscu-vs-vscu",
    title: "OSCU vs VSCU: Comprehensive Architecture & Comparison Guide",
    category: "architecture",
    summary: "Detailed comparison between Online Sales Control Unit (Cloud) and Virtual Sales Control Unit (Local JAR).",
    content: `# OSCU vs VSCU: Architecture & Integration Comparison

## Overview
KRA provides two primary System-to-System (S2S) integration paths for businesses connecting their ERP, POS, or billing systems:

1. **OSCU (Online Sales Control Unit)**: Cloud-hosted by KRA.
2. **VSCU (Virtual Sales Control Unit)**: Taxpayer-hosted local software daemon (Java JAR).

---

## Architectural Comparison

| Dimension | OSCU (Cloud) | VSCU (Local) |
|---|---|---|
| **Hosting Model** | KRA Cloud Infrastructure | Taxpayer Server / Local Machine |
| **Local Runtime** | No local daemon needed; direct HTTPS calls | Java 16+ JAR daemon running on port 8088 |
| **Internet Requirement** | Continuous 100% internet required per transaction | Internet required for sync; allows limited offline operation |
| **Offline Tolerance** | 0 minutes (fails immediately if offline) | **Max 24 hours**. Halts signing if offline > 24 hours |
| **Authentication** | \`cmcKey\` passed in every API request body | Handled internally by local JAR using private keys |
| **Sales Endpoint** | Single combined call: \`/saveTrnsSalesOsdc\` | Two-stage or local call: \`/trnsSales/saveSales\` |
| **Throughput Bottleneck** | KRA cloud network latency (200-800ms per invoice) | Local loopback latency (<10ms for signing), async sync |
| **Best Suited For** | E-commerce, Cloud ERPs (NetSuite, Odoo Cloud), low-latency cloud servers | High-volume retail supermarkets, remote branches, intermittent internet |

---

## The "No Response, No Invoice" Golden Rule
Under Kenyan fiscal law and KRA technical directives:
> **If your system does not receive a successful fiscal signature (\`000\` code) from OSCU or VSCU, the transaction MUST abort.**
> Issuing an invoice or receipt to a customer without valid eTIMS fiscal counters and QR code is an offence under the Tax Procedures Act.

---

## Environments & URLs

### OSCU Cloud Endpoints
- **Sandbox**: \`https://etims-api-sbx.kra.go.ke/etims-api\`
- **Production**: \`https://etims-api.kra.go.ke/etims-api\`

### VSCU Local Endpoints
- **Local Daemon**: \`http://localhost:8088\` (or configured host/port in \`application.properties\`)
`,
  },

  {
    id: "onboarding-guide",
    title: "KRA eTIMS Onboarding, Sign-Up & Device Handshake Guide",
    category: "onboarding",
    summary: "Step-by-step workflow to register on sandbox and production, obtain device serials, and perform initial handshake.",
    content: `# KRA eTIMS Onboarding & Handshake Guide

## 1. Prerequisites
- Active KRA PIN with an active Tax Compliance Certificate (TCC).
- Access to the mobile phone registered on iTax (for SMS OTP verification).
- Business registration documents (incorporation certificate, director details).

---

## 2. Sandbox Registration
1. Navigate to the Sandbox Portal: \`https://etims-sbx.kra.go.ke\`.
2. Click **Sign-Up** and input company KRA PIN.
3. System fetches taxpayer details from iTax. Confirm accuracy.
4. Input director/representative phone number to receive OTP.
5. Create secure portal password.
6. Once logged in, navigate to **Service Request** -> **eTIMS Technical Registration**.
7. Select **System-to-System (OSCU or VSCU)**.
8. KRA assigns a **Device Serial Number** (e.g., \`TEST-DVC-0001\`) and Branch ID (\`00\` for headquarters).

---

## 3. The Initialization Handshake (OSCU)
Call the initialization endpoint once:
\`\`\`http
POST /etims-api/selectInitOsdcInfo HTTP/1.1
Host: etims-api-sbx.kra.go.ke
Content-Type: application/json

{
  "tin": "P000000001A",
  "bhfId": "00",
  "dvcSrlNo": "TEST-DVC-0001"
}
\`\`\`

### Response
\`\`\`json
{
  "resultCd": "000",
  "resultMsg": "It is succeeded",
  "resultDt": "20261022120000",
  "data": {
    "info": {
      "tin": "P000000001A",
      "bhfId": "00",
      "dvcSrlNo": "TEST-DVC-0001",
      "sdcId": "KRAMW010000001",
      "mrcNo": "KRAMW01",
      "cmcKey": "KRA_CMC_KEY_98f82a17b8c34ee12..."
    }
  }
}
\`\`\`

> [!IMPORTANT]
> **Store \`cmcKey\` securely in an encrypted vault or environment variable.**
> Calling \`/selectInitOsdcInfo\` again after successful init will fail with error \`902: Device already installed\`.
`,
  },

  {
    id: "credit-notes-rules",
    title: "Credit Notes & Invoice Reversal Business Rules",
    category: "invoicing",
    summary: "Statutory rules and API patterns for issuing fiscal credit notes referencing original invoice numbers.",
    content: `# Credit Notes & Invoice Reversal Guide

## Golden Rules for Credit Notes
1. **Never modify or delete an issued fiscal invoice**: eTIMS does not support updating or deleting approved sales invoices.
2. **Mandatory Reference to Original Invoice**: Every credit note must specify:
   - \`rcptTyCd\`: \`"R"\` (Credit Note / Refund)
   - \`orgInvcNo\`: The exact \`invcNo\` of the original invoice being credited.
   - \`rfdRsnCd\`: Valid 2-digit reason code (from Code Table 32).
3. **Same Control Unit**: A credit note must be processed via the same branch ID (\`bhfId\`) that issued the original invoice.
4. **Amount Sign**: In the API payload, amounts should be positive values representing the credited amount (partial or full). The receipt type \`R\` indicates negative fiscal impact.

---

## Credit Note Reasons (Code Class 32)
- \`01\`: Missing Quantity
- \`02\`: Missing Item / Missing Data
- \`03\`: Damaged Goods
- \`04\`: Wasted / Perished Goods
- \`05\`: Raw Material Shortage
- \`06\`: Refund / Order Cancelled
- \`07\`: Wrong Customer PIN
- \`08\`: Wrong Customer Name
- \`09\`: Wrong Amount / Unit Price
- \`10\`: Wrong Quantity
- \`11\`: Wrong Item Billed
- \`12\`: Wrong Tax Category Applied
- \`13\`: Other Reason
`,
  },

  {
    id: "buyer-initiated-invoicing",
    title: "Buyer-Initiated Invoicing (BII) & Reverse Invoicing Guide",
    category: "compliance",
    summary: "How corporate buyers issue valid eTIMS invoices on behalf of small-scale farmers, informal traders, and suppliers.",
    content: `# Buyer-Initiated Invoicing (BII) & Reverse Invoicing

## Context & Legal Basis
Under the Finance Act and Tax Procedures Act Cap 469B:
- All business expense deductions for income tax must be backed by a valid eTIMS invoice.
- However, smallholder farmers, informal traders, and micro-suppliers (annual turnover < KES 5M) often lack smartphones or ERP systems.
- **Buyer-Initiated Invoicing (BII)** empowers registered corporate buyers (e.g., tea factories, milk processors, supermarkets) to generate the tax invoice on behalf of the unregistered seller.

---

## Two Implementation Pathways

### 1. System-to-System (S2S) Reverse Invoicing
- Used by large enterprises with automated supply chains.
- Enterprise submits purchase details using the purchase API endpoints (\`/saveTrnsPurchase\`).
- Taxpayer submits buyer acceptance (\`prchrAcptcYn: "Y"\`).

### 2. Portal & USSD Channel
- Buyer enters seller's National ID or KRA PIN and transaction items on eCitizen / eTIMS portal.
- Seller receives an automated SMS alert.
- Seller dials **\*222#** or confirms via eCitizen within **30 days**.
- Once confirmed, the invoice is fiscalized and available for buyer expense deduction.
`,
  },

  {
    id: "stock-management",
    title: "eTIMS Mandatory Stock & Inventory Management Guide",
    category: "stock",
    summary: "Complete workflow for tracking stock in, stock out, branch transfers, and manufacturing adjustments.",
    content: `# eTIMS Mandatory Stock Management Guide

## Statutory Requirement
Under the 2024-2026 KRA regulatory updates:
- Stock tracking is **mandatory** for all goods-handling businesses on eTIMS.
- KRA continuously reconciles registered inventory against sales declarations.
- Issuing sales invoices for items with zero or negative registered stock triggers compliance audits.

---

## The 4-Step Inventory Lifecycle
1. **Item Registration (\`/saveItem\`)**:
   - Every product must be registered with UNSPSC/HS code (\`itemClsCd\`), packaging unit (\`pkgUnitCd\`), and tax type (\`taxTyCd\`).
2. **Initial / Periodic Stock Upload (\`/saveStockMaster\` or \`/insertStockIO\`)**:
   - Declare opening balance using incoming adjustment (\`sarTyCd: "06"\`).
3. **Purchases / Inbound Stock (\`/insertStockIO\`)**:
   - Incoming imports: \`sarTyCd: "01"\`
   - Incoming domestic purchases: \`sarTyCd: "02"\`
   - Incoming customer returns: \`sarTyCd: "03"\`
   - Inter-branch transfer in: \`sarTyCd: "04"\`
4. **Outbound Depletion (\`/saveTrnsSalesOsdc\` or \`/insertStockIO\`)**:
   - Sales automatically deplete registered stock if integrated with OSCU/VSCU.
   - Spoilage, damages, theft write-offs: \`sarTyCd: "15"\` (Discarding) - requires documentation.
`,
  },

  {
    id: "fuel-station-system",
    title: "eTIMS Fuel Station & Forecourt Automation Guide",
    category: "fuel",
    summary: "Specialized integration requirements for petroleum retail, DOMS, Fusion, and forecourt controllers.",
    content: `# eTIMS Petroleum Fuel Station Integration

## Industry Specific Requirements
Petroleum forecourt operations have strict fiscal parameters:
- **Tax Classification**: Petroleum fuel attracts **Tax Type E (8% VAT/Reduced Rate)** or relevant excise.
- **Forecourt Controllers**: Direct integration with DOMS, Gilbarco Veeder-Root, Fusion, or Wayne controllers.
- **High Transaction Velocity**: Fuel pumps dispense transactions every few seconds; requires sub-second signing.
- **Fleet PIN Capture**: Commercial fleet drivers require employer KRA PIN printed on receipt for fuel expense claims.

---

## Implementation Architecture
1. **Forecourt Interface**: POS connects to Forecourt Controller via IFSF protocol.
2. **Pump Event**: Fuel nozzle hung up -> transaction dispatched to POS with nozzle ID, grade, volume in litres (\`qtyUnitCd: "LTR"\`), unit price, and total amount.
3. **Fiscal Signing**: VSCU local daemon is strongly recommended over OSCU for forecourts to guarantee zero downtime during cloud internet hiccups.
`,
  },

  {
    id: "tis-qr-code-spec",
    title: "TIS Receipt Format & QR Code Cryptographic Formula",
    category: "tis",
    summary: "Exact receipt layout guidelines, mandatory print fields, and the official QR code text string formula.",
    content: `# TIS Receipt & QR Code Specification

## QR Code Text String Formula
The 2D QR Code printed on every eTIMS fiscal receipt must encode the following string format:

\`\`\`
{invoice_date}#{time}#{cu_number}#{cu_receipt_number}#{internal_data}#{receipt_signature}
\`\`\`

### Format Components:
1. \`invoice_date\`: Date formatted as **DDMMYYYY** (e.g., \`22102026\`)
2. \`time\`: Time formatted as **HHMMSS** (e.g., \`123005\`)
3. \`cu_number\`: Control Unit ID (\`sdcId\` from response, e.g., \`KRAMW010000001\`)
4. \`cu_receipt_number\`: Receipt counter (\`rcptNo\` from response, e.g., \`4521\`)
5. \`internal_data\`: The \`intrlData\` string returned in API response
6. \`receipt_signature\`: The \`rcptSign\` string returned in API response

### Concrete Example:
\`\`\`
22102026#123005#KRAMW010000001#4521#5A8F7D21C90B34E5#B1E9024D9820CA887
\`\`\`

---

## Mandatory Physical Receipt Header & Layout
\`\`\`text
==================================================
           KENYA REVENUE AUTHORITY
                eTIMS RECEIPT
==================================================
TAXPAYER NAME:       ACME ENTERPRISES KENYA LTD
PIN:                 P000000001A
BRANCH:              00 (HEAD OFFICE)
ADDRESS:             Kenyatta Avenue, Nairobi
BUYER PIN:           P051234567X
BUYER NAME:          CLIENT LOGISTICS LTD
--------------------------------------------------
RECEIPT TYPE:        NS (Normal Sale)
DATE / TIME:         22/10/2026 12:30:05
RECEIPT NO:          4521
INVOICE NO:          1001
--------------------------------------------------
ITEM DESCRIPTION       QTY   UNIT PRC      AMOUNT
Mineral Water 500ml   20.00    50.00     1,000.00 (B)
--------------------------------------------------
TOTAL TAXABLE (B 16%):                   1,000.00
VAT AMOUNT (16%):                          160.00
TOTAL AMOUNT PAYABLE:                    1,160.00
PAYMENT METHOD:      CASH (01)
--------------------------------------------------
CU SERIAL NO:        KRAMW010000001
RECEIPT SIGN:        B1E9024D9820CA887
--------------------------------------------------
[   QR CODE EMBEDDED HERE   ]
Scan with KRA eTIMS Validator App
==================================================
\`\`\`
`,
  },
];
