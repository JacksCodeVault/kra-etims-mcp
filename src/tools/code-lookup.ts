/**
 * Tool: lookup_code
 * Queries KRA eTIMS system code tables (tax types, payment types, credit note reasons, units, etc.)
 */

import { z } from "zod";
import { CODE_TABLES } from "../data/code-tables.js";

export const codeLookupToolDefinition = {
  name: "lookup_code",
  description: "Look up official KRA code tables or specific code definitions (tax types, payment methods, credit note reasons, stock movement types, packaging units, quantity units).",
  parameters: z.object({
    table_name: z.enum([
      "tax_types",
      "payment_methods",
      "transaction_types",
      "sales_receipt_types",
      "purchase_receipt_types",
      "transaction_progress",
      "registration_types",
      "stock_movement_types",
      "credit_note_reasons",
      "product_types",
      "packaging_units",
      "quantity_units",
      "import_item_status",
      "receipt_labels",
      "all",
    ]).describe("Code table identifier or 'all' to list all available tables"),
    code: z.string().optional().describe("Optional specific code to inspect (e.g. 'B' for tax type, '06' for payment method, '15' for stock discarding)"),
  }),
  execute: async (args: { table_name: string; code?: string }) => {
    if (args.table_name === "all") {
      const summary = Object.entries(CODE_TABLES).map(([key, t]) => ({
        table_key: key,
        class_code: t.cdCls,
        name: t.cdClsNm,
        description: t.cdClsDesc,
        total_codes: t.codes.length,
      }));
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    }

    const table = CODE_TABLES[args.table_name];
    if (!table) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Table '${args.table_name}' not found. Available tables: ${Object.keys(CODE_TABLES).join(", ")}`,
          },
        ],
      };
    }

    if (args.code) {
      const matchedCode = table.codes.find(
        (c) => c.cd.toLowerCase() === args.code!.toLowerCase() || c.cdNm.toLowerCase().includes(args.code!.toLowerCase())
      );
      if (!matchedCode) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Code '${args.code}' not found in table '${args.table_name}'. Available codes:\n` +
                table.codes.map((c) => `- ${c.cd}: ${c.cdNm} (${c.cdDesc || ""})`).join("\n"),
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ table: table.cdClsNm, class_code: table.cdCls, ...matchedCode }, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(table, null, 2),
        },
      ],
    };
  },
};
