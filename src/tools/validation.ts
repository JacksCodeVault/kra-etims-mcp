/**
 * Tool: validate_etims_payload
 * Validates request payloads against official KRA eTIMS constraints, formats, and mathematical balances
 */

import { z } from "zod";
import { validateSalesPayload, isValidKraPin, isValidBranchId } from "../utils/validator-rules.js";

export const validationToolDefinition = {
  name: "validate_etims_payload",
  description: "Validates eTIMS JSON payloads, KRA PINs, branch IDs, and ensures tax math (taxblAmtA-E, taxAmtA-E, totAmt) perfectly balances before submitting to KRA.",
  parameters: z.object({
    payload_type: z.enum(["sales_invoice", "credit_note", "pin_only", "branch_only"]).describe("Type of payload or entity to validate"),
    payload_json: z.string().describe("JSON string representing the request body or raw string value to validate"),
  }),
  execute: async (args: { payload_type: string; payload_json: string }) => {
    try {
      if (args.payload_type === "pin_only") {
        const pin = args.payload_json.trim().replace(/^"|"$/g, "");
        const valid = isValidKraPin(pin);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                pin,
                isValid: valid,
                message: valid
                  ? "Valid KRA PIN format"
                  : "Invalid KRA PIN. Must be 11 characters starting with P (business) or A (individual), followed by 9 digits and 1 letter (e.g. P000000001A)",
              }, null, 2),
            },
          ],
        };
      }

      if (args.payload_type === "branch_only") {
        const branch = args.payload_json.trim().replace(/^"|"$/g, "");
        const valid = isValidBranchId(branch);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                branchId: branch,
                isValid: valid,
                message: valid
                  ? "Valid Branch ID format"
                  : "Invalid Branch ID. Must be a 2-digit string (e.g. '00' for Head Office)",
              }, null, 2),
            },
          ],
        };
      }

      // JSON parsing for complex payloads
      let parsed: Record<string, any>;
      try {
        parsed = JSON.parse(args.payload_json);
      } catch (err: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                isValid: false,
                errorCount: 1,
                issues: [
                  {
                    field: "payload_json",
                    rule: "JSON_PARSE_ERROR",
                    message: `Invalid JSON syntax: ${err.message}`,
                    severity: "ERROR",
                  },
                ],
              }, null, 2),
            },
          ],
        };
      }

      if (args.payload_type === "credit_note") {
        // Enforce credit note type in payload if not set
        if (!parsed.rcptTyCd) parsed.rcptTyCd = "R";
      }

      const report = validateSalesPayload(parsed);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(report, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Validation error: ${err.message}`,
          },
        ],
      };
    }
  },
};
