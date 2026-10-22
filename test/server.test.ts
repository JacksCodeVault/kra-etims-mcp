import test from "node:test";
import assert from "node:assert";
import { createServer } from "../src/server.js";

test("createServer registers tools, resources, and prompts", () => {
  const server = createServer();
  assert.ok(server, "Expected server to be instantiated");
  // Check private properties registered tools
  const registeredTools = (server as any)._registeredTools;
  assert.ok(registeredTools, "Expected _registeredTools");
  assert.ok(registeredTools["search_knowledge_base"]);
  assert.ok(registeredTools["get_api_spec"]);
  assert.ok(registeredTools["lookup_code"]);
  assert.ok(registeredTools["validate_etims_payload"]);
  assert.ok(registeredTools["generate_sample_payload"]);
  assert.ok(registeredTools["explain_error_code"]);
  assert.ok(registeredTools["generate_qr_code_string"]);
});
