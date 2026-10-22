/**
 * Tool: get_api_spec
 * Retrieves full technical specifications, schemas, and samples for KRA eTIMS endpoints
 */

import { z } from "zod";
import { ENDPOINTS, ENVIRONMENTS } from "../data/endpoints.js";

export const apiSpecsToolDefinition = {
  name: "get_api_spec",
  description: "Get full technical specifications, parameters, headers, and request/response payloads for an eTIMS API endpoint (OSCU or VSCU).",
  parameters: z.object({
    endpoint_name: z.string().describe("Endpoint name or partial path (e.g. 'saveTrnsSalesOsdc', 'selectInitOsdcInfo', 'saveItem', 'insertStockIO', 'selectCustomer')"),
    solution: z.enum(["OSCU", "VSCU", "ANY"]).default("ANY").optional().describe("Filter by integration solution type"),
  }),
  execute: async (args: { endpoint_name: string; solution?: "OSCU" | "VSCU" | "ANY" }) => {
    const q = args.endpoint_name.toLowerCase().replace(/^\//, "");
    const matches = ENDPOINTS.filter((ep) => {
      const matchName = ep.name.toLowerCase().includes(q) || ep.path.toLowerCase().includes(q);
      if (!matchName) return false;
      if (args.solution && args.solution !== "ANY") {
        return ep.solution === args.solution || ep.solution === "BOTH";
      }
      return true;
    });

    if (matches.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No endpoint matching '${args.endpoint_name}' found. Available endpoints:\n` +
              ENDPOINTS.map((e) => `- ${e.name} (${e.solution}): ${e.path} - ${e.description.substring(0, 70)}...`).join("\n"),
          },
        ],
      };
    }

    const payload = {
      query: args.endpoint_name,
      environments: ENVIRONMENTS,
      count: matches.length,
      endpoints: matches,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  },
};
