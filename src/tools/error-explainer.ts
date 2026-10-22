/**
 * Tool: explain_error_code
 * Diagnostics and troubleshooting engine for KRA eTIMS error codes
 */

import { z } from "zod";
import { ERROR_CODES } from "../data/error-codes.js";

export const errorExplainerToolDefinition = {
  name: "explain_error_code",
  description: "Diagnose and resolve KRA eTIMS error codes (e.g., 000, 901, 903, 910, 994, TIS memory/clock codes). Returns cause, description, and concrete fix steps.",
  parameters: z.object({
    code: z.string().describe("The error code string returned by KRA API or TIS device (e.g. '901', '903', '910', '994', '11', '20')"),
  }),
  execute: async (args: { code: string }) => {
    const raw = args.code.trim();
    let err = ERROR_CODES[raw];

    // Try TIS prefix if not found
    if (!err && ERROR_CODES[`TIS_${raw}`]) {
      err = ERROR_CODES[`TIS_${raw}`];
    }

    if (!err) {
      // Fuzzy search in values
      const matched = Object.values(ERROR_CODES).find(
        (e) => e.code === raw || e.message.toLowerCase().includes(raw.toLowerCase())
      );
      if (matched) {
        err = matched;
      }
    }

    if (!err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error code '${args.code}' was not found in the standard catalog. Common codes include:\n` +
              Object.values(ERROR_CODES).slice(0, 10).map((e) => `- ${e.code}: ${e.message} (${e.category})`).join("\n"),
          },
        ],
      };
    }

    const diagnosis = {
      code: err.code,
      category: err.category,
      message: err.message,
      description: err.description,
      rootCause: err.cause,
      recommendedResolution: err.resolution,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(diagnosis, null, 2),
        },
      ],
    };
  },
};
