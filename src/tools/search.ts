/**
 * Tool: search_knowledge_base
 * Fast semantic/keyword search over the entire KRA eTIMS knowledge base
 */

import { z } from "zod";
import { searchIndex } from "../data/index-store.js";

export const searchToolDefinition = {
  name: "search_knowledge_base",
  description: "Search the comprehensive KRA eTIMS knowledge base (guides, API specs, error codes, code tables). Returns relevant excerpts with sub-millisecond execution.",
  parameters: z.object({
    query: z.string().describe("Search keywords or natural language question (e.g. 'credit note requirements', 'error 903', 'fuel station 8% VAT', 'selectInitOsdcInfo')"),
    category: z.enum(["guide", "endpoint", "code_table", "error_code"]).optional().describe("Optional category filter to narrow results"),
    limit: z.number().min(1).max(20).default(5).optional().describe("Maximum number of results to return (default: 5)"),
  }),
  execute: async (args: { query: string; category?: string; limit?: number }) => {
    const results = searchIndex.search(args.query, args.category, args.limit || 5);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  },
};
