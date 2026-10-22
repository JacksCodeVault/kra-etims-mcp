/**
 * KRA eTIMS API Endpoints & Request/Response Specification
 * Covers OSCU (Cloud REST) and VSCU (Local JAR REST)
 */

export interface FieldDefinition {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  length?: number;
  required: boolean;
  description: string;
  example?: unknown;
}

export interface EndpointSpec {
  name: string;
  solution: "OSCU" | "VSCU" | "BOTH";
  path: string;
  method: "POST";
  description: string;
  authRequired: "NONE" | "CMC_KEY" | "INTERNAL";
  requestFields: FieldDefinition[];
  responseFields: FieldDefinition[];
  sampleRequest: Record<string, unknown>;
  sampleResponse: Record<string, unknown>;
}

export const ENVIRONMENTS = {
  OSCU: {
    sandbox: "https://etims-api-sbx.kra.go.ke/etims-api",
    production: "https://etims-api.kra.go.ke/etims-api",
  },
  PORTAL: {
    sandbox: "https://etims-sbx.kra.go.ke",
    production: "https://etims.kra.go.ke",
  },
  VSCU: {
    local_default: "http://localhost:8088",
  },
};

export const ENDPOINTS: EndpointSpec[] = [
  // 1. Device Initialization
  {
    name: "selectInitOsdcInfo",
    solution: "OSCU",
    path: "/selectInitOsdcInfo",
    method: "POST",
    description: "Initializes the OSCU client with KRA servers. Generates and returns the communication key (cmcKey) required for all subsequent API requests. Call this once during onboarding.",
    authRequired: "NONE",
    requestFields: [
      { name: "tin", type: "string", length: 11, required: true, description: "Taxpayer Identification Number (PIN)", example: "P000000001A" },
      { name: "bhfId", type: "string", length: 2, required: true, description: "Branch ID (00 for Head Office)", example: "00" },
      { name: "dvcSrlNo", type: "string", length: 100, required: true, description: "Device Serial Number registered in eTIMS portal", example: "ETIMS-TEST-DEVICE-01" },
    ],
    responseFields: [
      { name: "resultCd", type: "string", required: true, description: "Response code (000 = Success)", example: "000" },
      { name: "resultMsg", type: "string", required: true, description: "Response message", example: "It is succeeded" },
      { name: "resultDt", type: "string", required: true, description: "Response timestamp (YYYYMMDDHHmmss)", example: "20261022123000" },
      { name: "data.info.cmcKey", type: "string", required: true, description: "Communication Key (up to 255 chars). Must be stored securely and passed in every future call.", example: "KRA_CMC_KEY_98f82a17b8c34..." },
      { name: "data.info.tin", type: "string", required: true, description: "Echoed Taxpayer PIN", example: "P000000001A" },
      { name: "data.info.bhfId", type: "string", required: true, description: "Echoed Branch ID", example: "00" },
      { name: "data.info.sdcId", type: "string", required: true, description: "Assigned Sales Data Controller (CU) ID", example: "KRAMW010000001" },
      { name: "data.info.mrcNo", type: "string", required: true, description: "Machine Receipt Counter Number", example: "KRAMW01" },
    ],
    sampleRequest: {
      tin: "P000000001A",
      bhfId: "00",
      dvcSrlNo: "ETIMS-TEST-DEVICE-01",
    },
    sampleResponse: {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: "20261022123000",
      data: {
        info: {
          tin: "P000000001A",
          bhfId: "00",
          dvcSrlNo: "ETIMS-TEST-DEVICE-01",
          sdcId: "KRAMW010000001",
          mrcNo: "KRAMW01",
          cmcKey: "KRA_CMC_KEY_98f82a17b8c34ee12",
        },
      },
    },
  },

  // 2. Select Code List
  {
    name: "selectCodeList",
    solution: "OSCU",
    path: "/selectCodeList",
    method: "POST",
    description: "Downloads system-wide code tables (tax types, payment methods, units, credit note reasons). Pass lastReqDt to get incremental delta changes.",
    authRequired: "CMC_KEY",
    requestFields: [
      { name: "tin", type: "string", length: 11, required: true, description: "Taxpayer PIN" },
      { name: "bhfId", type: "string", length: 2, required: true, description: "Branch ID" },
      { name: "cmcKey", type: "string", required: true, description: "Communication Key obtained from init" },
      { name: "lastReqDt", type: "string", length: 14, required: true, description: "Last sync timestamp (YYYYMMDDHHmmss). Use '20000101000000' for first sync.", example: "20260101000000" },
    ],
    responseFields: [
      { name: "resultCd", type: "string", required: true, description: "Response code (000 = Success)" },
      { name: "data.clsList", type: "array", required: true, description: "List of code classifications and items" },
    ],
    sampleRequest: {
      tin: "P000000001A",
      bhfId: "00",
      cmcKey: "KRA_CMC_KEY_98f82a17b8c34ee12",
      lastReqDt: "20260101000000",
    },
    sampleResponse: {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: "20261022123000",
      data: {
        clsList: [
          {
            cdCls: "04",
            cdClsNm: "Tax Type",
            dtlList: [
              { cd: "B", cdNm: "Standard Rate", cdDesc: "16%" },
            ],
          },
        ],
      },
    },
  },

  // 3. Customer Lookup
  {
    name: "selectCustomer",
    solution: "OSCU",
    path: "/selectCustomer",
    method: "POST",
    description: "Validates and fetches registered legal details of a customer/buyer PIN directly from KRA's taxpayer registry.",
    authRequired: "CMC_KEY",
    requestFields: [
      { name: "tin", type: "string", length: 11, required: true, description: "Your Taxpayer PIN" },
      { name: "bhfId", type: "string", length: 2, required: true, description: "Your Branch ID" },
      { name: "cmcKey", type: "string", required: true, description: "Communication Key" },
      { name: "custmTin", type: "string", length: 11, required: true, description: "Customer PIN to query", example: "P051234567X" },
    ],
    responseFields: [
      { name: "resultCd", type: "string", required: true, description: "Response code (000 = Success, 001 = Not Found)" },
      { name: "data.custList", type: "array", required: true, description: "Customer legal name, PIN, address, tax status" },
    ],
    sampleRequest: {
      tin: "P000000001A",
      bhfId: "00",
      cmcKey: "KRA_CMC_KEY_98f82a17b8c34ee12",
      custmTin: "P051234567X",
    },
    sampleResponse: {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: "20261022123000",
      data: {
        custList: [
          {
            custmTin: "P051234567X",
            custmNm: "ACME LOGISTICS KENYA LIMITED",
            taxprSttsCd: "A",
            prvncNm: "NAIROBI CITY",
            dstrtNm: "WESTLANDS",
          },
        ],
      },
    },
  },

  // 4. Save Item
  {
    name: "saveItem",
    solution: "OSCU",
    path: "/saveItem",
    method: "POST",
    description: "Registers a new product/service or updates an existing item. Items must be registered before reporting stock or generating invoices referencing them.",
    authRequired: "CMC_KEY",
    requestFields: [
      { name: "tin", type: "string", length: 11, required: true, description: "Taxpayer PIN" },
      { name: "bhfId", type: "string", length: 2, required: true, description: "Branch ID" },
      { name: "cmcKey", type: "string", required: true, description: "Communication Key" },
      { name: "itemCd", type: "string", length: 20, required: true, description: "Item code: format {OriginNatCd}{ProdType}{PkgUnit}{QtyUnit}{SeqNumber}", example: "KE2NTBA0000001" },
      { name: "itemClsCd", type: "string", length: 10, required: true, description: "Classification / HS / UNSPSC code", example: "50202306" },
      { name: "itemTyCd", type: "string", length: 1, required: true, description: "1=Raw Material, 2=Finished Product, 3=Service", example: "2" },
      { name: "itemNm", type: "string", length: 200, required: true, description: "Item product name", example: "Bottled Mineral Water 500ml" },
      { name: "itemStdNm", type: "string", length: 200, required: false, description: "Standard name / generic description" },
      { name: "orgnNatCd", type: "string", length: 2, required: true, description: "Country of origin ISO code", example: "KE" },
      { name: "pkgUnitCd", type: "string", length: 5, required: true, description: "Packaging unit code (e.g., CT, BG, BX)", example: "CT" },
      { name: "qtyUnitCd", type: "string", length: 5, required: true, description: "Quantity unit code (e.g., U, KG, LTR)", example: "U" },
      { name: "taxTyCd", type: "string", length: 1, required: true, description: "Tax category: A, B (16%), C (0%), D, E (8%)", example: "B" },
      { name: "dftPrc", type: "number", required: true, description: "Default selling price before tax", example: 50.0 },
      { name: "isrcAplcbYn", type: "string", length: 1, required: true, description: "Insurance applicable (Y/N)", example: "N" },
      { name: "useYn", type: "string", length: 1, required: true, description: "Active status (Y/N)", example: "Y" },
      { name: "regrId", type: "string", length: 20, required: true, description: "User ID registering item", example: "ADMIN01" },
      { name: "regrNm", type: "string", length: 60, required: true, description: "User Name registering item", example: "Admin User" },
      { name: "modrId", type: "string", length: 20, required: true, description: "Modifier ID", example: "ADMIN01" },
      { name: "modrNm", type: "string", length: 60, required: true, description: "Modifier Name", example: "Admin User" },
    ],
    responseFields: [
      { name: "resultCd", type: "string", required: true, description: "000 = Success, 991 = Registration Error, 994 = Duplicate" },
      { name: "resultMsg", type: "string", required: true, description: "Result description" },
    ],
    sampleRequest: {
      tin: "P000000001A",
      bhfId: "00",
      cmcKey: "KRA_CMC_KEY_98f82a17b8c34ee12",
      itemCd: "KE2CTU00000001",
      itemClsCd: "50202306",
      itemTyCd: "2",
      itemNm: "Bottled Mineral Water 500ml",
      itemStdNm: "Mineral Water",
      orgnNatCd: "KE",
      pkgUnitCd: "CT",
      qtyUnitCd: "U",
      taxTyCd: "B",
      btchNo: "BATCH-2026-01",
      bcd: "6161101234567",
      dftPrc: 50.0,
      grpPrcL1: 50.0,
      grpPrcL2: 45.0,
      grpPrcL3: 40.0,
      grpPrcL4: 0,
      grpPrcL5: 0,
      addInfo: "Natural spring water",
      sftyQty: 100,
      isrcAplcbYn: "N",
      useYn: "Y",
      regrId: "SYSADMIN",
      regrNm: "System Admin",
      modrId: "SYSADMIN",
      modrNm: "System Admin",
    },
    sampleResponse: {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: "20261022123000",
    },
  },

  // 5. Save Sales Transaction (OSCU Combined)
  {
    name: "saveTrnsSalesOsdc",
    solution: "OSCU",
    path: "/saveTrnsSalesOsdc",
    method: "POST",
    description: "Primary fiscal transaction endpoint in OSCU. Submits a sales invoice or credit note, signs it, and returns the fiscal signature, internal data, and receipt counter for QR code generation.",
    authRequired: "CMC_KEY",
    requestFields: [
      { name: "tin", type: "string", length: 11, required: true, description: "Taxpayer PIN" },
      { name: "bhfId", type: "string", length: 2, required: true, description: "Branch ID" },
      { name: "cmcKey", type: "string", required: true, description: "Communication Key" },
      { name: "invcNo", type: "number", required: true, description: "Monotonically increasing invoice sequence number", example: 1001 },
      { name: "orgInvcNo", type: "number", required: true, description: "Original invoice number (0 for normal sale, mandatory for credit note)", example: 0 },
      { name: "custTin", type: "string", length: 11, required: false, description: "Customer KRA PIN (mandatory for B2B)", example: "P051234567X" },
      { name: "custNm", type: "string", length: 100, required: false, description: "Customer Trade Name", example: "Acme Logistics Ltd" },
      { name: "salesTyCd", type: "string", length: 1, required: true, description: "N=Normal, C=Copy, P=Proforma, T=Training", example: "N" },
      { name: "rcptTyCd", type: "string", length: 1, required: true, description: "S=Sale, R=Credit Note", example: "S" },
      { name: "pmtTyCd", type: "string", length: 2, required: true, description: "Payment method: 01=Cash, 02=Credit, 06=Mobile Money, etc.", example: "01" },
      { name: "salesSttsCd", type: "string", length: 2, required: true, description: "02=Approved (default for completed sale)", example: "02" },
      { name: "cfmDt", type: "string", length: 14, required: true, description: "Confirmation timestamp (YYYYMMDDHHmmss)", example: "20261022123000" },
      { name: "salesDt", type: "string", length: 8, required: true, description: "Sales date (YYYYMMDD)", example: "20261022" },
      { name: "totItemCnt", type: "number", required: true, description: "Number of line items in itemList", example: 1 },
      { name: "taxblAmtA", type: "number", required: true, description: "Taxable amount for Tax A (Exempt)", example: 0 },
      { name: "taxblAmtB", type: "number", required: true, description: "Taxable amount for Tax B (16% VAT)", example: 1000.0 },
      { name: "taxblAmtC", type: "number", required: true, description: "Taxable amount for Tax C (0% Zero Rated)", example: 0 },
      { name: "taxblAmtD", type: "number", required: true, description: "Taxable amount for Tax D (Non-VAT)", example: 0 },
      { name: "taxblAmtE", type: "number", required: true, description: "Taxable amount for Tax E (8% Reduced/Fuel)", example: 0 },
      { name: "taxRtA", type: "number", required: true, description: "Tax rate A (0)", example: 0 },
      { name: "taxRtB", type: "number", required: true, description: "Tax rate B (16)", example: 16 },
      { name: "taxRtC", type: "number", required: true, description: "Tax rate C (0)", example: 0 },
      { name: "taxRtD", type: "number", required: true, description: "Tax rate D (0)", example: 0 },
      { name: "taxRtE", type: "number", required: true, description: "Tax rate E (8)", example: 8 },
      { name: "taxAmtA", type: "number", required: true, description: "Calculated tax for A", example: 0 },
      { name: "taxAmtB", type: "number", required: true, description: "Calculated tax for B (taxblAmtB * 0.16)", example: 160.0 },
      { name: "taxAmtC", type: "number", required: true, description: "Calculated tax for C", example: 0 },
      { name: "taxAmtD", type: "number", required: true, description: "Calculated tax for D", example: 0 },
      { name: "taxAmtE", type: "number", required: true, description: "Calculated tax for E", example: 0 },
      { name: "totTaxblAmt", type: "number", required: true, description: "Sum of all taxblAmt (A through E)", example: 1000.0 },
      { name: "totTaxAmt", type: "number", required: true, description: "Sum of all taxAmt (A through E)", example: 160.0 },
      { name: "totAmt", type: "number", required: true, description: "Total payable: totTaxblAmt + totTaxAmt", example: 1160.0 },
      { name: "prchrAcptcYn", type: "string", length: 1, required: true, description: "Purchaser acceptance (Y/N)", example: "Y" },
      { name: "remark", type: "string", length: 400, required: false, description: "Invoice remarks / invoice memo" },
      { name: "regrId", type: "string", length: 20, required: true, description: "Cashier / system user ID", example: "CASHIER01" },
      { name: "regrNm", type: "string", length: 60, required: true, description: "Cashier user name", example: "Jane Doe" },
      { name: "modrId", type: "string", length: 20, required: true, description: "Modifier ID", example: "CASHIER01" },
      { name: "modrNm", type: "string", length: 60, required: true, description: "Modifier name", example: "Jane Doe" },
      { name: "itemList", type: "array", required: true, description: "Array of line item objects (itemSeq, itemCd, qty, prc, taxTyCd, etc.)" },
    ],
    responseFields: [
      { name: "resultCd", type: "string", required: true, description: "000 = Success" },
      { name: "data.rcptNo", type: "number", required: true, description: "Fiscal receipt counter number assigned by KRA" },
      { name: "data.intrlData", type: "string", required: true, description: "Encrypted internal fiscal signature data for QR code" },
      { name: "data.rcptSign", type: "string", required: true, description: "Cryptographic receipt signature for QR code" },
      { name: "data.sdcDateTime", type: "string", required: true, description: "SDC timestamp (YYYYMMDDHHmmss)" },
      { name: "data.sdcId", type: "string", required: true, description: "Control Unit ID" },
      { name: "data.mrcNo", type: "string", required: true, description: "Machine Receipt Counter" },
    ],
    sampleRequest: {
      tin: "P000000001A",
      bhfId: "00",
      cmcKey: "KRA_CMC_KEY_98f82a17b8c34ee12",
      invcNo: 1001,
      orgInvcNo: 0,
      custTin: "P051234567X",
      custNm: "ACME LOGISTICS KENYA LIMITED",
      salesTyCd: "N",
      rcptTyCd: "S",
      pmtTyCd: "01",
      salesSttsCd: "02",
      cfmDt: "20261022123000",
      salesDt: "20261022",
      stockRlsDt: "20261022123000",
      totItemCnt: 1,
      taxblAmtA: 0,
      taxblAmtB: 1000.0,
      taxblAmtC: 0,
      taxblAmtD: 0,
      taxblAmtE: 0,
      taxRtA: 0,
      taxRtB: 16.0,
      taxRtC: 0,
      taxRtD: 0,
      taxRtE: 8.0,
      taxAmtA: 0,
      taxAmtB: 160.0,
      taxAmtC: 0,
      taxAmtD: 0,
      taxAmtE: 0,
      totTaxblAmt: 1000.0,
      totTaxAmt: 160.0,
      totAmt: 1160.0,
      prchrAcptcYn: "Y",
      remark: "Standard commercial sale",
      regrId: "CASHIER01",
      regrNm: "Jane Doe",
      modrId: "CASHIER01",
      modrNm: "Jane Doe",
      receipt: {
        custTin: "P051234567X",
        custMblNo: "0712345678",
        rptNo: 1,
        trdeNm: "HEAD OFFICE",
        adrs: "Nairobi, Kenya",
        topMsg: "Thank you for shopping with us",
        btmMsg: "Goods once sold are not returnable without receipt",
        prchrAcptcYn: "Y",
      },
      itemList: [
        {
          itemSeq: 1,
          itemCd: "KE2CTU00000001",
          itemClsCd: "50202306",
          itemNm: "Bottled Mineral Water 500ml",
          bcd: "6161101234567",
          pkgUnitCd: "CT",
          pkg: 1,
          qtyUnitCd: "U",
          qty: 20,
          prc: 50.0,
          splyAmt: 1000.0,
          dcRt: 0,
          dcAmt: 0,
          taxTyCd: "B",
          taxblAmt: 1000.0,
          taxAmt: 160.0,
          totAmt: 1160.0,
        },
      ],
    },
    sampleResponse: {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: "20261022123005",
      data: {
        rcptNo: 4521,
        intrlData: "5A8F7D21C90B34E5...",
        rcptSign: "B1E9024D9820CA887...",
        sdcDateTime: "20261022123005",
        sdcId: "KRAMW010000001",
        mrcNo: "KRAMW01",
        totRcptNo: 4521,
      },
    },
  },

  // 6. Record Stock Movement (insertStockIO)
  {
    name: "insertStockIO",
    solution: "OSCU",
    path: "/insertStockIO",
    method: "POST",
    description: "Records inventory movement (incoming purchase, import, return, transfer, processing, discard, or stock adjustment). Crucial for stock compliance.",
    authRequired: "CMC_KEY",
    requestFields: [
      { name: "tin", type: "string", length: 11, required: true, description: "Taxpayer PIN" },
      { name: "bhfId", type: "string", length: 2, required: true, description: "Branch ID" },
      { name: "cmcKey", type: "string", required: true, description: "Communication Key" },
      { name: "sarNo", type: "number", required: true, description: "Stock adjustment / movement sequence number", example: 101 },
      { name: "orgSarNo", type: "number", required: false, description: "Original SAR number (if correcting a movement)" },
      { name: "regTyCd", type: "string", length: 1, required: true, description: "A=Automatic, M=Manual", example: "A" },
      { name: "sarTyCd", type: "string", length: 2, required: true, description: "Stock movement type: 01-06 (incoming) or 11-16 (outgoing)", example: "02" },
      { name: "ocrnDt", type: "string", length: 8, required: true, description: "Occurrence date (YYYYMMDD)", example: "20261022" },
      { name: "totItemCnt", type: "number", required: true, description: "Total distinct items", example: 1 },
      { name: "totTaxblAmt", type: "number", required: true, description: "Total taxable valuation", example: 5000.0 },
      { name: "totTaxAmt", type: "number", required: true, description: "Total tax valuation", example: 800.0 },
      { name: "totAmt", type: "number", required: true, description: "Total inventory movement value", example: 5800.0 },
      { name: "itemList", type: "array", required: true, description: "Array of stock items with itemSeq, itemCd, qty, prc, etc." },
    ],
    responseFields: [
      { name: "resultCd", type: "string", required: true, description: "000 = Success" },
      { name: "resultMsg", type: "string", required: true, description: "Status message" },
    ],
    sampleRequest: {
      tin: "P000000001A",
      bhfId: "00",
      cmcKey: "KRA_CMC_KEY_98f82a17b8c34ee12",
      sarNo: 101,
      orgSarNo: 0,
      regTyCd: "A",
      custTin: "P001122334Z",
      custBhfId: "00",
      custNm: "SUPPLIER BEVERAGES LTD",
      sarTyCd: "02",
      ocrnDt: "20261022",
      totItemCnt: 1,
      totTaxblAmt: 5000.0,
      totTaxAmt: 800.0,
      totAmt: 5800.0,
      remark: "Stock in from local supplier",
      itemList: [
        {
          itemSeq: 1,
          itemCd: "KE2CTU00000001",
          itemClsCd: "50202306",
          itemNm: "Bottled Mineral Water 500ml",
          pkgUnitCd: "CT",
          pkg: 5,
          qtyUnitCd: "U",
          qty: 100,
          itemExprDt: "20271022",
          prc: 50.0,
          splyAmt: 5000.0,
          totDcAmt: 0,
          taxTyCd: "B",
          taxblAmt: 5000.0,
          taxAmt: 800.0,
          totAmt: 5800.0,
        },
      ],
    },
    sampleResponse: {
      resultCd: "000",
      resultMsg: "It is succeeded",
      resultDt: "20261022123010",
    },
  },
];
