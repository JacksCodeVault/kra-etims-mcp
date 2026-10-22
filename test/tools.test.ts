import test from "node:test";
import assert from "node:assert";
import { searchToolDefinition } from "../src/tools/search.js";
import { apiSpecsToolDefinition } from "../src/tools/api-specs.js";
import { codeLookupToolDefinition } from "../src/tools/code-lookup.js";
import { validationToolDefinition } from "../src/tools/validation.js";
import { payloadGeneratorToolDefinition } from "../src/tools/payload-generator.js";
import { errorExplainerToolDefinition } from "../src/tools/error-explainer.js";
import { qrGeneratorToolDefinition } from "../src/tools/qr-generator.js";

test("Tool: search_knowledge_base returns results", async () => {
  const result = await searchToolDefinition.execute({ query: "credit note" });
  assert.ok(result.content[0].text);
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.totalHits > 0);
});

test("Tool: get_api_spec returns endpoint details", async () => {
  const result = await apiSpecsToolDefinition.execute({ endpoint_name: "saveTrnsSalesOsdc" });
  const data = JSON.parse(result.content[0].text);
  assert.strictEqual(data.count, 1);
  assert.strictEqual(data.endpoints[0].name, "saveTrnsSalesOsdc");
  assert.ok(data.endpoints[0].requestFields.length > 10);
});

test("Tool: lookup_code looks up Tax Types", async () => {
  const result = await codeLookupToolDefinition.execute({ table_name: "tax_types", code: "B" });
  const data = JSON.parse(result.content[0].text);
  assert.strictEqual(data.cd, "B");
  assert.strictEqual(data.rate, 16);
});

test("Tool: lookup_code returns full table if code omitted", async () => {
  const result = await codeLookupToolDefinition.execute({ table_name: "credit_note_reasons" });
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.codes.length >= 6);
});

test("Tool: validate_etims_payload checks PIN format", async () => {
  const validRes = await validationToolDefinition.execute({
    payload_type: "pin_only",
    payload_json: "P000000001A",
  });
  const validData = JSON.parse(validRes.content[0].text);
  assert.strictEqual(validData.isValid, true);

  const invalidRes = await validationToolDefinition.execute({
    payload_type: "pin_only",
    payload_json: "INVALID_PIN",
  });
  const invalidData = JSON.parse(invalidRes.content[0].text);
  assert.strictEqual(invalidData.isValid, false);
});

test("Tool: generate_sample_payload creates valid sales payload", async () => {
  const result = await payloadGeneratorToolDefinition.execute({ type: "standard_vat_sale" });
  const payload = JSON.parse(result.content[0].text);

  assert.strictEqual(payload.totAmt, payload.totTaxblAmt + payload.totTaxAmt);
  assert.strictEqual(payload.taxAmtB, 160.0);
  assert.strictEqual(payload.taxblAmtB, 1000.0);

  // Validate the generated payload with the validator tool
  const valResult = await validationToolDefinition.execute({
    payload_type: "sales_invoice",
    payload_json: JSON.stringify(payload),
  });
  const valData = JSON.parse(valResult.content[0].text);
  assert.strictEqual(valData.isValid, true, `Validation failed: ${JSON.stringify(valData.issues)}`);
});

test("Tool: explain_error_code returns diagnosis for 903", async () => {
  const result = await errorExplainerToolDefinition.execute({ code: "903" });
  const data = JSON.parse(result.content[0].text);
  assert.strictEqual(data.code, "903");
  assert.ok(data.recommendedResolution.includes("OSCU"));
});

test("Tool: generate_qr_code_string produces correct formula", async () => {
  // Test with DDMMYYYY
  const result1 = await qrGeneratorToolDefinition.execute({
    invoice_date: "22102026",
    time: "123005",
    cu_number: "KRAMW010000001",
    cu_receipt_number: 4521,
    internal_data: "5A8F7D21C90B34E5",
    receipt_signature: "B1E9024D9820CA887",
  });
  const data1 = JSON.parse(result1.content[0].text);
  assert.strictEqual(
    data1.qr_code_raw_string,
    "22102026#123005#KRAMW010000001#4521#5A8F7D21C90B34E5#B1E9024D9820CA887"
  );

  // Test with YYYYMMDD -> should convert to DDMMYYYY
  const result2 = await qrGeneratorToolDefinition.execute({
    invoice_date: "20261022",
    time: "123005",
    cu_number: "KRAMW010000001",
    cu_receipt_number: 4521,
    internal_data: "5A8F7D21C90B34E5",
    receipt_signature: "B1E9024D9820CA887",
  });
  const data2 = JSON.parse(result2.content[0].text);
  assert.strictEqual(
    data2.qr_code_raw_string,
    "22102026#123005#KRAMW010000001#4521#5A8F7D21C90B34E5#B1E9024D9820CA887"
  );
});
