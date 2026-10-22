/**
 * MCP Resources for KRA eTIMS
 * Exposes authoritative documentation and code references via etims:// URI scheme
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GUIDES } from "../data/guides.js";
import { CODE_TABLES } from "../data/code-tables.js";
import { ERROR_CODES } from "../data/error-codes.js";
import { ENDPOINTS } from "../data/endpoints.js";

export function registerResources(server: McpServer) {
  // 1. Guides as resources
  for (const guide of GUIDES) {
    server.resource(
      guide.id,
      `etims://docs/${guide.id}`,
      { mimeType: "text/markdown", description: guide.summary },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: guide.content,
          },
        ],
      })
    );
  }

  // 2. All Code Tables
  server.resource(
    "code-tables",
    "etims://codes/all",
    { mimeType: "application/json", description: "Complete dictionary of all KRA system code tables (tax, payment, CN reasons, units)" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(CODE_TABLES, null, 2),
        },
      ],
    })
  );

  // 3. All Error Codes
  server.resource(
    "error-codes",
    "etims://errors/all",
    { mimeType: "application/json", description: "Complete database of KRA eTIMS error codes, causes, and diagnostic steps" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(ERROR_CODES, null, 2),
        },
      ],
    })
  );

  // 4. API Endpoints Catalog
  server.resource(
    "api-catalog",
    "etims://api/catalog",
    { mimeType: "application/json", description: "Full technical specification of all OSCU and VSCU endpoints and schemas" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(ENDPOINTS, null, 2),
        },
      ],
    })
  );
}
