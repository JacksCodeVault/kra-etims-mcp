/**
 * Entry Point for kra-etims-mcp Server
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { logger } from "./utils/logger.js";

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    process.stderr.write(`
KRA eTIMS MCP Server (Knowledge Base & Developer Tools)
Universal Model Context Protocol server for Kenya Revenue Authority eTIMS integrations.

Usage:
  npx kra-etims-mcp           Start MCP server via STDIO (default for Cursor, Antigravity, Claude, Codex, Copilot)
  npx kra-etims-mcp --help    Show this help message
  npx kra-etims-mcp --version Show version

Environment Variables:
  DEBUG=1                     Enable verbose debug logging to stderr
\n`);
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    process.stderr.write("kra-etims-mcp v1.0.0\n");
    process.exit(0);
  }

  logger.info("Starting KRA eTIMS MCP Server (STDIO transport)...");

  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  logger.info("Connected to transport. Awaiting JSON-RPC requests from client.");

  // Handle graceful shutdown
  const handleExit = async () => {
    logger.info("Shutting down server...");
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);
}

main().catch((err) => {
  logger.error("Fatal error during server startup:", err);
  process.exit(1);
});
