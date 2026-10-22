/**
 * MCP Prompts for KRA eTIMS
 * Pre-engineered integration and debugging workflows for AI coding assistants
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  // 1. Scaffold Client
  server.prompt(
    "scaffold-etims-client",
    "Generates a complete, production-ready KRA eTIMS API client in your chosen programming language.",
    {
      language: z.enum(["typescript", "python", "php", "go"]).describe("Target programming language for the client"),
      solution: z.enum(["OSCU", "VSCU"]).default("OSCU").describe("Integration mode: OSCU (Cloud REST) or VSCU (Local Daemon)"),
    },
    async (args) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please generate a production-ready KRA eTIMS API client in ${args.language} for ${args.solution} integration mode.

Key requirements:
1. Initialize device handshake via /selectInitOsdcInfo (if OSCU) and cache cmcKey securely.
2. Provide methods for:
   - Synchronizing code tables (/selectCodeList)
   - Checking/verifying customer PIN (/selectCustomer)
   - Registering items (/saveItem)
   - Recording stock movements (/insertStockIO)
   - Submitting sales invoices and credit notes (/saveTrnsSalesOsdc)
3. Ensure mathematical validation:
   - Calculate 16% VAT on standard items (Tax B)
   - Handle 8% VAT on petroleum/fuel (Tax E)
   - Ensure totAmt = totTaxblAmt + totTaxAmt
4. Format dates as YYYYMMDDHHmmss and KRA PINs as 11 characters.
5. Generate the official 2D QR code string following the formula:
   date(ddmmyyyy)#time(hhmmss)#cu_number#cu_receipt_number#internal_data#receipt_signature.
6. Include robust error handling that maps KRA result codes (000, 901, 903, 910, 994).`,
            },
          },
        ],
      };
    }
  );

  // 2. Debug Error
  server.prompt(
    "debug-etims-error",
    "Troubleshoot a failed eTIMS request or error response code.",
    {
      error_code: z.string().describe("The KRA error code (e.g. 901, 903, 910, 994) or HTTP error"),
      request_context: z.string().optional().describe("Brief description of what endpoint and payload caused the error"),
    },
    async (args) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I encountered KRA eTIMS error '${args.error_code}'${args.request_context ? ` during: ${args.request_context}` : ""}.
Please use the 'explain_error_code' and 'search_knowledge_base' tools to:
1. Identify the root cause and why KRA servers rejected the request.
2. Check if the error is caused by credential mismatch (OSCU vs VSCU), timestamp format, missing prerequisites (e.g. item not registered), or math balancing.
3. Provide step-by-step instructions to fix the payload and resolve the issue.`,
            },
          },
        ],
      };
    }
  );

  // 3. Implement Credit Note
  server.prompt(
    "implement-credit-note",
    "Step-by-step guide and code implementation for generating compliant credit notes.",
    {
      reason: z.string().describe("The commercial reason for the credit note (e.g., Damaged goods, Wrong quantity, Price correction, Order cancelled)"),
    },
    async (args) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need to implement a Credit Note flow in my eTIMS integration for reason: '${args.reason}'.
Please:
1. Lookup the official KRA credit note reason code from Code Table 32 using 'lookup_code'.
2. Explain the mandatory rules for credit notes (orgInvcNo, rcptTyCd='R', branch ID constraints).
3. Generate a sample credit note payload using 'generate_sample_payload'.
4. Provide the code snippet showing how to send the credit note and handle the response.`,
            },
          },
        ],
      };
    }
  );

  // 4. Stock Sync Setup
  server.prompt(
    "setup-stock-sync",
    "Step-by-step instructions and code to implement mandatory eTIMS stock movement synchronization.",
    {},
    async () => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I need to set up mandatory eTIMS Stock Management synchronization for my inventory system.
Please:
1. Use 'search_knowledge_base' to check the stock management rules.
2. Explain the required sequence: Item Registration (/saveItem) -> Stock In/Purchase (/insertStockIO) -> Sales Depletion.
3. Provide sample payloads for incoming purchase (sarTyCd: '02') and discarding/spoilage (sarTyCd: '15').
4. Show how to reconcile local ERP stock balances with KRA eTIMS records.`,
            },
          },
        ],
      };
    }
  );
}
