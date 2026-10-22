/**
 * KRA eTIMS Business Rule Validation Engine
 */

export interface ValidationIssue {
  field: string;
  rule: string;
  message: string;
  severity: "ERROR" | "WARNING";
}

export interface ValidationReport {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
}

export function isValidKraPin(pin: string): boolean {
  if (!pin || typeof pin !== "string") return false;
  // Format: Starts with P (taxpayer) or A (individual/alien), followed by 9 digits, ends with 1 uppercase letter
  const pinRegex = /^[P|A]\d{9}[A-Z]$/i;
  return pinRegex.test(pin.trim());
}

export function isValidBranchId(bhfId: string): boolean {
  if (!bhfId || typeof bhfId !== "string") return false;
  return /^[0-9]{2}$/.test(bhfId.trim());
}

export function isValidTimestamp(dt: string, length: 8 | 14 = 14): boolean {
  if (!dt || typeof dt !== "string") return false;
  if (dt.length !== length) return false;
  return /^\d+$/.test(dt);
}

export function validateSalesPayload(payload: Record<string, any>): ValidationReport {
  const issues: ValidationIssue[] = [];

  // 1. PIN and Branch Validation
  if (!payload.tin) {
    issues.push({ field: "tin", rule: "REQUIRED", message: "Taxpayer PIN (tin) is mandatory", severity: "ERROR" });
  } else if (!isValidKraPin(payload.tin)) {
    issues.push({ field: "tin", rule: "FORMAT", message: `Invalid KRA PIN format '${payload.tin}'. Must be 11 characters starting with P/A followed by 9 digits and 1 letter (e.g. P000000001A)`, severity: "ERROR" });
  }

  if (!payload.bhfId) {
    issues.push({ field: "bhfId", rule: "REQUIRED", message: "Branch ID (bhfId) is mandatory", severity: "ERROR" });
  } else if (!isValidBranchId(payload.bhfId)) {
    issues.push({ field: "bhfId", rule: "FORMAT", message: `Branch ID must be a 2-digit string (e.g. '00' for HQ)`, severity: "ERROR" });
  }

  // 2. Invoice Numbers
  if (typeof payload.invcNo !== "number" || payload.invcNo <= 0) {
    issues.push({ field: "invcNo", rule: "FORMAT", message: "Invoice number (invcNo) must be a positive integer", severity: "ERROR" });
  }

  // 3. Credit Note Checks
  const isCreditNote = payload.rcptTyCd === "R";
  if (isCreditNote) {
    if (!payload.orgInvcNo || payload.orgInvcNo <= 0) {
      issues.push({ field: "orgInvcNo", rule: "CREDIT_NOTE_RULE", message: "Credit Note (rcptTyCd='R') requires a positive original invoice number (orgInvcNo)", severity: "ERROR" });
    }
    if (!payload.rfdRsnCd) {
      issues.push({ field: "rfdRsnCd", rule: "CREDIT_NOTE_RULE", message: "Credit Note requires a refund reason code (rfdRsnCd) from Code Table 32", severity: "ERROR" });
    }
  }

  // 4. Customer PIN (if provided)
  if (payload.custTin && !isValidKraPin(payload.custTin)) {
    issues.push({ field: "custTin", rule: "FORMAT", message: `Customer PIN '${payload.custTin}' does not match standard 11-char KRA PIN format`, severity: "ERROR" });
  }

  // 5. Dates
  if (payload.cfmDt && !isValidTimestamp(payload.cfmDt, 14)) {
    issues.push({ field: "cfmDt", rule: "TIMESTAMP_FORMAT", message: "Confirmation date cfmDt must be 14 digits (YYYYMMDDHHmmss)", severity: "ERROR" });
  }
  if (payload.salesDt && !isValidTimestamp(payload.salesDt, 8)) {
    issues.push({ field: "salesDt", rule: "DATE_FORMAT", message: "Sales date salesDt must be 8 digits (YYYYMMDD)", severity: "ERROR" });
  }

  // 6. Mathematical Balances
  const taxblAmtA = Number(payload.taxblAmtA || 0);
  const taxblAmtB = Number(payload.taxblAmtB || 0);
  const taxblAmtC = Number(payload.taxblAmtC || 0);
  const taxblAmtD = Number(payload.taxblAmtD || 0);
  const taxblAmtE = Number(payload.taxblAmtE || 0);

  const taxAmtA = Number(payload.taxAmtA || 0);
  const taxAmtB = Number(payload.taxAmtB || 0);
  const taxAmtC = Number(payload.taxAmtC || 0);
  const taxAmtD = Number(payload.taxAmtD || 0);
  const taxAmtE = Number(payload.taxAmtE || 0);

  const totTaxblAmt = Number(payload.totTaxblAmt || 0);
  const totTaxAmt = Number(payload.totTaxAmt || 0);
  const totAmt = Number(payload.totAmt || 0);

  const calcTotTaxbl = taxblAmtA + taxblAmtB + taxblAmtC + taxblAmtD + taxblAmtE;
  const calcTotTax = taxAmtA + taxAmtB + taxAmtC + taxAmtD + taxAmtE;
  const calcTotAmt = calcTotTaxbl + calcTotTax;

  if (Math.abs(calcTotTaxbl - totTaxblAmt) > 0.05) {
    issues.push({
      field: "totTaxblAmt",
      rule: "SUM_MISMATCH",
      message: `totTaxblAmt (${totTaxblAmt}) does not match sum of taxable amounts A through E (${calcTotTaxbl.toFixed(2)})`,
      severity: "ERROR",
    });
  }

  if (Math.abs(calcTotTax - totTaxAmt) > 0.05) {
    issues.push({
      field: "totTaxAmt",
      rule: "SUM_MISMATCH",
      message: `totTaxAmt (${totTaxAmt}) does not match sum of tax amounts A through E (${calcTotTax.toFixed(2)})`,
      severity: "ERROR",
    });
  }

  if (Math.abs(calcTotAmt - totAmt) > 0.05) {
    issues.push({
      field: "totAmt",
      rule: "TOTAL_MISMATCH",
      message: `totAmt (${totAmt}) must equal totTaxblAmt + totTaxAmt (${calcTotAmt.toFixed(2)})`,
      severity: "ERROR",
    });
  }

  // Check 16% VAT Rate on B
  if (taxblAmtB > 0) {
    const expectedVat = taxblAmtB * 0.16;
    if (Math.abs(expectedVat - taxAmtB) > 0.10) {
      issues.push({
        field: "taxAmtB",
        rule: "VAT_RATE_MISMATCH",
        message: `taxAmtB (${taxAmtB}) differs from 16% of taxblAmtB (${expectedVat.toFixed(2)})`,
        severity: "WARNING",
      });
    }
  }

  // Check 8% Rate on E
  if (taxblAmtE > 0) {
    const expectedRateE = taxblAmtE * 0.08;
    if (Math.abs(expectedRateE - taxAmtE) > 0.10) {
      issues.push({
        field: "taxAmtE",
        rule: "RATE_E_MISMATCH",
        message: `taxAmtE (${taxAmtE}) differs from 8% of taxblAmtE (${expectedRateE.toFixed(2)})`,
        severity: "WARNING",
      });
    }
  }

  // 7. Line Item Array Checks
  if (!Array.isArray(payload.itemList) || payload.itemList.length === 0) {
    issues.push({ field: "itemList", rule: "EMPTY_ARRAY", message: "itemList must be a non-empty array of sale items", severity: "ERROR" });
  } else {
    if (payload.totItemCnt !== payload.itemList.length) {
      issues.push({
        field: "totItemCnt",
        rule: "COUNT_MISMATCH",
        message: `totItemCnt (${payload.totItemCnt}) must equal itemList length (${payload.itemList.length})`,
        severity: "ERROR",
      });
    }

    payload.itemList.forEach((item: any, idx: number) => {
      const lineNo = idx + 1;
      if (!item.itemCd) {
        issues.push({ field: `itemList[${idx}].itemCd`, rule: "REQUIRED", message: `Line ${lineNo}: itemCd is required`, severity: "ERROR" });
      }
      if (!["A", "B", "C", "D", "E"].includes(item.taxTyCd)) {
        issues.push({ field: `itemList[${idx}].taxTyCd`, rule: "TAX_CODE", message: `Line ${lineNo}: taxTyCd '${item.taxTyCd}' is invalid. Must be A, B, C, D, or E`, severity: "ERROR" });
      }
      if (typeof item.qty !== "number" || item.qty <= 0) {
        issues.push({ field: `itemList[${idx}].qty`, rule: "POSITIVE_NUMBER", message: `Line ${lineNo}: qty must be greater than 0`, severity: "ERROR" });
      }
      if (typeof item.prc !== "number" || item.prc < 0) {
        issues.push({ field: `itemList[${idx}].prc`, rule: "NON_NEGATIVE", message: `Line ${lineNo}: prc must be 0 or positive`, severity: "ERROR" });
      }
    });
  }

  const errors = issues.filter(i => i.severity === "ERROR");
  const warnings = issues.filter(i => i.severity === "WARNING");

  return {
    isValid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    issues,
  };
}
