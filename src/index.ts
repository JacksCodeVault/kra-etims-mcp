/**
 * Entry Point for kra-etims-mcp Server
 * Supports both STDIO (default) and HTTP/SSE transport modes
 */

import http from "node:http";
import { URL } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer } from "./server.js";
import { logger } from "./utils/logger.js";

async function runStdio() {
  logger.info("Starting KRA eTIMS MCP Server in STDIO transport mode...");
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  logger.info("Connected to transport. Awaiting JSON-RPC requests from client.");

  const handleExit = async () => {
    logger.info("Shutting down STDIO server...");
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);
}

async function runHttp(port: number) {
  logger.info(`Starting KRA eTIMS MCP Server in HTTP/SSE transport mode on port ${port}...`);

  // Map to hold active client SSE sessions
  const sessions = new Map<string, { transport: SSEServerTransport; server: ReturnType<typeof createServer> }>();

  const httpServer = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = parsedUrl.pathname;

    // Healthcheck endpoint for Docker & load balancers
    if (req.method === "GET" && pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "healthy", activeSessions: sessions.size, timestamp: new Date().toISOString() }));
      return;
    }

    // SSE connection endpoint
    if (req.method === "GET" && pathname === "/sse") {
      logger.info(`New SSE client connecting from ${req.socket.remoteAddress}`);
      const server = createServer();
      const transport = new SSEServerTransport("/message", res);

      const sessionId = transport.sessionId;
      sessions.set(sessionId, { transport, server });

      transport.onclose = () => {
        logger.info(`SSE session ${sessionId} closed`);
        sessions.delete(sessionId);
        server.close().catch(() => {});
      };

      await server.connect(transport);
      return;
    }

    // Message handler endpoint
    if (req.method === "POST" && pathname === "/message") {
      const sessionId = parsedUrl.searchParams.get("sessionId");
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing or invalid sessionId parameter" }));
        return;
      }

      const session = sessions.get(sessionId)!;
      await session.transport.handlePostMessage(req, res);
      return;
    }

    // Default 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found", validEndpoints: ["/sse", "/message", "/health"] }));
  });

  httpServer.listen(port, "0.0.0.0", () => {
    logger.info(`HTTP/SSE Server listening on http://0.0.0.0:${port}`);
    logger.info(`SSE Endpoint: http://0.0.0.0:${port}/sse`);
    logger.info(`Health Check: http://0.0.0.0:${port}/health`);
  });

  const handleExit = async () => {
    logger.info("Shutting down HTTP server...");
    for (const [id, session] of sessions.entries()) {
      await session.server.close().catch(() => {});
      await session.transport.close().catch(() => {});
    }
    httpServer.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    process.stderr.write(`
KRA eTIMS MCP Server (Knowledge Base & Developer Tools)
Universal Model Context Protocol server for Kenya Revenue Authority eTIMS integrations.

Usage:
  npx kra-etims-mcp                 Start MCP server via STDIO (default)
  npx kra-etims-mcp --http [port]   Start as HTTP/SSE server (default port: 3000)
  npx kra-etims-mcp --help          Show this help message
  npx kra-etims-mcp --version       Show version

Environment Variables:
  PORT=3000                         Specify HTTP port when running in HTTP mode
  TRANSPORT=http|stdio              Explicitly choose transport mode
  DEBUG=1                           Enable verbose debug logging to stderr
\n`);
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    process.stderr.write("kra-etims-mcp v1.0.0\n");
    process.exit(0);
  }

  const isStdioFlag = args.includes("--stdio");
  const isHttpFlag = args.includes("--http");
  const isHttpEnv = process.env.TRANSPORT?.toLowerCase() === "http";

  if (!isStdioFlag && (isHttpFlag || isHttpEnv)) {
    let port = 3000;
    const httpArgIdx = args.findIndex((a) => a === "--http");
    if (httpArgIdx !== -1 && args[httpArgIdx + 1] && !isNaN(Number(args[httpArgIdx + 1]))) {
      port = Number(args[httpArgIdx + 1]);
    } else if (process.env.PORT && !isNaN(Number(process.env.PORT))) {
      port = Number(process.env.PORT);
    }
    await runHttp(port);
  } else {
    await runStdio();
  }
}

main().catch((err) => {
  logger.error("Fatal error during server startup:", err);
  process.exit(1);
});
