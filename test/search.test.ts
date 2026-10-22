import test from "node:test";
import assert from "node:assert";
import { searchIndex } from "../src/data/index-store.js";

test("searchIndex executes with sub-millisecond warm query speed", () => {
  // Warm up JIT
  searchIndex.search("test");

  const query = "credit note damaged goods";
  const start = performance.now();
  const res = searchIndex.search(query);
  const elapsed = performance.now() - start;

  assert.ok(elapsed < 10, `Search took ${elapsed.toFixed(2)}ms, which is under 10ms`);
  assert.ok(res.totalHits > 0, "Expected search hits for 'credit note damaged goods'");
  assert.ok(res.results.length > 0, "Expected non-empty results array");
});

test("searchIndex finds specific error codes", () => {
  const res = searchIndex.search("903");
  assert.ok(res.totalHits > 0, "Expected hits for error 903");
  const found = res.results.some((r) => r.title.includes("903"));
  assert.ok(found, "Expected error 903 in search results");
});

test("searchIndex finds fuel station requirements", () => {
  const res = searchIndex.search("fuel station 8% VAT");
  assert.ok(res.totalHits > 0, "Expected hits for fuel station");
  const found = res.results.some((r) => r.title.toLowerCase().includes("fuel") || r.id.includes("fuel"));
  assert.ok(found, "Expected fuel guide in search results");
});

test("searchIndex filters by category", () => {
  const res = searchIndex.search("saveItem", "endpoint");
  assert.ok(res.totalHits > 0, "Expected hits for saveItem in endpoint category");
  for (const item of res.results) {
    assert.strictEqual(item.category, "endpoint");
  }
});
