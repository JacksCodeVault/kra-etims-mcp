/**
 * KRA eTIMS McpServer Factory
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchToolDefinition } from "./tools/search.js";
import { apiSpecsToolDefinition } from "./tools/api-specs.js";
import { codeLookupToolDefinition } from "./tools/code-lookup.js";
import { validationToolDefinition } from "./tools/validation.js";
import { payloadGeneratorToolDefinition } from "./tools/payload-generator.js";
import { errorExplainerToolDefinition } from "./tools/error-explainer.js";
import { qrGeneratorToolDefinition } from "./tools/qr-generator.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";
import { logger } from "./utils/logger.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "kra-etims-mcp",
    version: "1.0.0",
  });

  // 1. Register Tools
  logger.info("Registering MCP Tools...");

  server.tool(
    searchToolDefinition.name,
    searchToolDefinition.description,
    searchToolDefinition.parameters.shape,
    searchToolDefinition.execute
  );

  server.tool(
    apiSpecsToolDefinition.name,
    apiSpecsToolDefinition.description,
    apiSpecsToolDefinition.parameters.shape,
    apiSpecsToolDefinition.execute
  );

  server.tool(
    codeLookupToolDefinition.name,
    codeLookupToolDefinition.description,
    codeLookupToolDefinition.parameters.shape,
    codeLookupToolDefinition.execute
  );

  server.tool(
    validationToolDefinition.name,
    validationToolDefinition.description,
    validationToolDefinition.parameters.shape,
    validationToolDefinition.execute
  );

  server.tool(
    payloadGeneratorToolDefinition.name,
    payloadGeneratorToolDefinition.description,
    payloadGeneratorToolDefinition.parameters.shape,
    payloadGeneratorToolDefinition.execute
  );

  server.tool(
    errorExplainerToolDefinition.name,
    errorExplainerToolDefinition.description,
    errorExplainerToolDefinition.parameters.shape,
    errorExplainerToolDefinition.execute
  );

  server.tool(
    qrGeneratorToolDefinition.name,
    qrGeneratorToolDefinition.description,
    qrGeneratorToolDefinition.parameters.shape,
    qrGeneratorToolDefinition.execute
  );

  // 2. Register Resources
  logger.info("Registering MCP Resources...");
  registerResources(server);

  // 3. Register Prompts
  logger.info("Registering MCP Prompts...");
  registerPrompts(server);

  logger.info("All eTIMS MCP capabilities successfully loaded.");
  return server;
}
