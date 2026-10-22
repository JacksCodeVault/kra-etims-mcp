/**
 * In-Memory Search Index Store
 * Uses MiniSearch for sub-millisecond full-text and fuzzy search across all KRA knowledge
 */

import MiniSearch from "minisearch";
import { GUIDES } from "./guides.js";
import { ENDPOINTS } from "./endpoints.js";
import { CODE_TABLES } from "./code-tables.js";
import { ERROR_CODES } from "./error-codes.js";

export interface SearchDocument {
  id: string;
  category: "guide" | "endpoint" | "code_table" | "error_code";
  title: string;
  keywords: string;
  content: string;
  meta: Record<string, unknown>;
}

class KnowledgeIndex {
  private miniSearch: MiniSearch<SearchDocument>;
  private docsMap: Map<string, SearchDocument> = new Map();

  constructor() {
    this.miniSearch = new MiniSearch<SearchDocument>({
      fields: ["title", "keywords", "content"],
      storeFields: ["id", "category", "title", "meta"],
      searchOptions: {
        boost: { title: 3, keywords: 2 },
        fuzzy: 0.2,
        prefix: true,
      },
    });

    this.populateDocuments();
  }

  private populateDocuments() {
    const docs: SearchDocument[] = [];

    // 1. Guides
    for (const guide of GUIDES) {
      const doc: SearchDocument = {
        id: `guide_${guide.id}`,
        category: "guide",
        title: guide.title,
        keywords: `${guide.category} ${guide.summary}`,
        content: `${guide.summary}\n${guide.content}`,
        meta: { guideId: guide.id, category: guide.category },
      };
      docs.push(doc);
      this.docsMap.set(doc.id, doc);
    }

    // 2. Endpoints
    for (const ep of ENDPOINTS) {
      const doc: SearchDocument = {
        id: `ep_${ep.name}`,
        category: "endpoint",
        title: `${ep.name} (${ep.solution})`,
        keywords: `${ep.path} ${ep.solution} ${ep.method} ${ep.authRequired}`,
        content: `${ep.description} Endpoint path: ${ep.path}. Fields: ${ep.requestFields.map(f => f.name).join(", ")}`,
        meta: { endpointName: ep.name, path: ep.path, solution: ep.solution },
      };
      docs.push(doc);
      this.docsMap.set(doc.id, doc);
    }

    // 3. Code Tables
    for (const [key, table] of Object.entries(CODE_TABLES)) {
      const codeDetails = table.codes.map(c => `${c.cd}: ${c.cdNm} (${c.cdDesc || ""})`).join("; ");
      const doc: SearchDocument = {
        id: `code_${key}`,
        category: "code_table",
        title: `${table.cdClsNm} (Class ${table.cdCls})`,
        keywords: `${key} ${table.cdClsNm} code table ${table.cdCls}`,
        content: `${table.cdClsDesc}. Codes: ${codeDetails}`,
        meta: { tableKey: key, classCode: table.cdCls },
      };
      docs.push(doc);
      this.docsMap.set(doc.id, doc);
    }

    // 4. Error Codes
    for (const [codeKey, err] of Object.entries(ERROR_CODES)) {
      const doc: SearchDocument = {
        id: `err_${codeKey}`,
        category: "error_code",
        title: `Error Code ${err.code}: ${err.message}`,
        keywords: `error ${err.code} ${err.category} ${err.message}`,
        content: `${err.description} Cause: ${err.cause} Resolution: ${err.resolution}`,
        meta: { code: err.code, category: err.category },
      };
      docs.push(doc);
      this.docsMap.set(doc.id, doc);
    }

    this.miniSearch.addAll(docs);
  }

  public search(query: string, categoryFilter?: string, limit: number = 5) {
    const startTime = performance.now();
    const results = this.miniSearch.search(query, {
      filter: categoryFilter ? (doc) => doc.category === categoryFilter : undefined,
    });

    const executionMs = performance.now() - startTime;
    const topResults = results.slice(0, limit).map((r) => {
      const fullDoc = this.docsMap.get(r.id);
      return {
        id: r.id,
        category: r.category,
        title: r.title,
        score: r.score,
        meta: r.meta,
        snippet: fullDoc?.content ? fullDoc.content.substring(0, 350) + "..." : "",
        fullContent: fullDoc?.content,
      };
    });

    return {
      query,
      totalHits: results.length,
      executionMs: Number(executionMs.toFixed(2)),
      results: topResults,
    };
  }

  public getDocument(id: string): SearchDocument | undefined {
    return this.docsMap.get(id);
  }
}

export const searchIndex = new KnowledgeIndex();
