/**
 * Stderr Logger
 * CRITICAL: In MCP stdio transport, stdout is strictly reserved for JSON-RPC messages.
 * Any log message or stray print statement sent to stdout will corrupt communication with the client.
 */

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    process.stderr.write(`[INFO] [kra-etims-mcp] ${message} ${args.length ? JSON.stringify(args) : ""}\n`);
  },
  warn: (message: string, ...args: unknown[]) => {
    process.stderr.write(`[WARN] [kra-etims-mcp] ${message} ${args.length ? JSON.stringify(args) : ""}\n`);
  },
  error: (message: string, ...args: unknown[]) => {
    process.stderr.write(`[ERROR] [kra-etims-mcp] ${message} ${args.length ? JSON.stringify(args) : ""}\n`);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.DEBUG) {
      process.stderr.write(`[DEBUG] [kra-etims-mcp] ${message} ${args.length ? JSON.stringify(args) : ""}\n`);
    }
  },
};
