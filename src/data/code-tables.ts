/**
 * KRA eTIMS System Code Tables
 * Extracted from OSCU, VSCU, and TIS Specification Documents v2.0
 */

export interface CodeItem {
  cd: string;
  cdNm: string;
  cdDesc?: string;
  rate?: number;
  userDfnCd1?: string;
}

export interface CodeClassification {
  cdCls: string;
  cdClsNm: string;
  cdClsDesc: string;
  codes: CodeItem[];
}

export const CODE_TABLES: Record<string, CodeClassification> = {
  tax_types: {
    cdCls: "04",
    cdClsNm: "Tax Type",
    cdClsDesc: "Value Added Tax and other tax rate categories applicable in Kenya",
    codes: [
      { cd: "A", cdNm: "Exempt", cdDesc: "Exempt supplies (0% VAT)", rate: 0 },
      { cd: "B", cdNm: "Standard Rate", cdDesc: "General VAT standard rate (16%)", rate: 16 },
      { cd: "C", cdNm: "Zero Rated", cdDesc: "Zero-rated supplies (0% VAT with input claim)", rate: 0 },
      { cd: "D", cdNm: "Non-VAT", cdDesc: "Non-VAT registered supplies or out of scope (0%)", rate: 0 },
      { cd: "E", cdNm: "Reduced / Fuel / Tourism", cdDesc: "Reduced rate for Petroleum/Fuel or Tourism Levy (8%)", rate: 8 },
    ],
  },

  payment_methods: {
    cdCls: "07",
    cdClsNm: "Payment Method",
    cdClsDesc: "Method used by purchaser to settle the invoice",
    codes: [
      { cd: "01", cdNm: "CASH", cdDesc: "Settled in physical cash" },
      { cd: "02", cdNm: "CREDIT", cdDesc: "Invoiced on trade credit / terms" },
      { cd: "03", cdNm: "CASH/CREDIT", cdDesc: "Partial cash and credit balance" },
      { cd: "04", cdNm: "BANK CHECK", cdDesc: "Payment made via commercial bank cheque" },
      { cd: "05", cdNm: "DEBIT & CREDIT CARD", cdDesc: "Settled via card POS terminal (Visa, MasterCard, etc.)" },
      { cd: "06", cdNm: "MOBILE MONEY", cdDesc: "Settled via M-Pesa, Airtel Money, T-Kash" },
      { cd: "07", cdNm: "OTHER", cdDesc: "Other settlement mechanisms (barter, EFT, wire transfer)" },
    ],
  },

  transaction_types: {
    cdCls: "14",
    cdClsNm: "Transaction Type",
    cdClsDesc: "Type of transaction being reported (salesTyCd)",
    codes: [
      { cd: "N", cdNm: "Normal", cdDesc: "Standard real transaction (MUST be used for actual business sales)" },
      { cd: "C", cdNm: "Copy", cdDesc: "Reprint or copy of an existing transaction" },
      { cd: "P", cdNm: "Proforma", cdDesc: "Proforma quotation (non-fiscal)" },
      { cd: "T", cdNm: "Training", cdDesc: "Testing and training simulation mode" },
    ],
  },

  sales_receipt_types: {
    cdCls: "37",
    cdClsNm: "Sales Receipt Type",
    cdClsDesc: "Nature of sales document (rcptTyCd)",
    codes: [
      { cd: "S", cdNm: "Sale", cdDesc: "Standard fiscal sales invoice" },
      { cd: "R", cdNm: "Credit Note after Sale", cdDesc: "Credit note reversing or adjusting an earlier sale" },
    ],
  },

  purchase_receipt_types: {
    cdCls: "38",
    cdClsNm: "Purchase Receipt Type",
    cdClsDesc: "Nature of purchase document (rcptTyCd for purchases)",
    codes: [
      { cd: "P", cdNm: "Purchase", cdDesc: "Recorded purchase from supplier" },
      { cd: "R", cdNm: "Credit Note after Purchase", cdDesc: "Supplier credit note adjusting purchase" },
    ],
  },

  transaction_progress: {
    cdCls: "11",
    cdClsNm: "Transaction Progress",
    cdClsDesc: "Lifecycle status of a transaction (salesSttsCd / pchsSttsCd)",
    codes: [
      { cd: "01", cdNm: "Wait for Approval", cdDesc: "Submitted, awaiting confirmation" },
      { cd: "02", cdNm: "Approved", cdDesc: "Formally accepted and registered by KRA" },
      { cd: "03", cdNm: "Credit Note Requested", cdDesc: "Adjustment / cancellation request initiated" },
      { cd: "04", cdNm: "Canceled", cdDesc: "Transaction voided / canceled" },
      { cd: "05", cdNm: "Credit Note Generated", cdDesc: "Credit note successfully created" },
      { cd: "06", cdNm: "Transferred", cdDesc: "Archived or transferred" },
    ],
  },

  registration_types: {
    cdCls: "31",
    cdClsNm: "Registration Type",
    cdClsDesc: "Origin of data submission (regTyCd)",
    codes: [
      { cd: "A", cdNm: "Automatic", cdDesc: "Generated automatically via direct API system-to-system integration" },
      { cd: "M", cdNm: "Manual", cdDesc: "Manually entered through eTIMS portal or user client" },
    ],
  },

  stock_movement_types: {
    cdCls: "12",
    cdClsNm: "Stock In/Out Type",
    cdClsDesc: "Type of inventory movement for stock compliance (sarTyCd)",
    codes: [
      { cd: "01", cdNm: "Incoming - Import", cdDesc: "Stock added via customs import declaration" },
      { cd: "02", cdNm: "Incoming - Purchase", cdDesc: "Stock added through domestic supplier purchase" },
      { cd: "03", cdNm: "Incoming - Return", cdDesc: "Customer return returned into stock" },
      { cd: "04", cdNm: "Incoming - Stock Movement", cdDesc: "Transfer received from another branch" },
      { cd: "05", cdNm: "Incoming - Processing", cdDesc: "Finished goods output from manufacturing/assembly" },
      { cd: "06", cdNm: "Incoming - Adjustment", cdDesc: "Inventory reconciliation upward adjustment (found stock)" },
      { cd: "11", cdNm: "Outgoing - Sale", cdDesc: "Inventory depleted through eTIMS sales invoice" },
      { cd: "12", cdNm: "Outgoing - Return", cdDesc: "Stock returned to original supplier" },
      { cd: "13", cdNm: "Outgoing - Stock Movement", cdDesc: "Transfer dispatched to another branch" },
      { cd: "14", cdNm: "Outgoing - Processing", cdDesc: "Raw material consumed in manufacturing" },
      { cd: "15", cdNm: "Outgoing - Discarding", cdDesc: "Damaged, expired, spoiled, or destroyed stock write-off" },
      { cd: "16", cdNm: "Outgoing - Adjustment", cdDesc: "Inventory reconciliation downward adjustment (shrinkage/breakage)" },
    ],
  },

  credit_note_reasons: {
    cdCls: "32",
    cdClsNm: "Credit Note Reason",
    cdClsDesc: "Mandatory reason code when issuing a Credit Note (rfdRsnCd)",
    codes: [
      { cd: "01", cdNm: "Missing Quantity", cdDesc: "Goods delivered in lesser quantity than invoiced" },
      { cd: "02", cdNm: "Missing Item / Missing Data", cdDesc: "Item omitted from delivery or wrong invoice metadata" },
      { cd: "03", cdNm: "Damaged", cdDesc: "Goods arrived damaged or defective" },
      { cd: "04", cdNm: "Wasted", cdDesc: "Spoiled or degraded stock during transit" },
      { cd: "05", cdNm: "Raw Material Shortage", cdDesc: "Production order curtailed due to inputs" },
      { cd: "06", cdNm: "Refund", cdDesc: "Customer cancelled order or full monetary refund" },
      { cd: "07", cdNm: "Wrong Customer PIN", cdDesc: "Invoice issued to incorrect KRA PIN (VSCU extended code)" },
      { cd: "08", cdNm: "Wrong Customer Name", cdDesc: "Taxpayer legal name mismatch (VSCU extended code)" },
      { cd: "09", cdNm: "Wrong Amount / Price", cdDesc: "Pricing computation or unit rate error (VSCU extended code)" },
      { cd: "10", cdNm: "Wrong Quantity", cdDesc: "Incorrect billed quantity entered (VSCU extended code)" },
      { cd: "11", cdNm: "Wrong Item(s)", cdDesc: "Invoiced item code does not correspond to product delivered (VSCU extended code)" },
      { cd: "12", cdNm: "Wrong Tax Type", cdDesc: "Incorrect VAT classification applied (e.g., standard vs exempt) (VSCU extended code)" },
      { cd: "13", cdNm: "Other Reason", cdDesc: "Any other substantiated commercial reason (VSCU extended code)" },
    ],
  },

  product_types: {
    cdCls: "24",
    cdClsNm: "Product Type",
    cdClsDesc: "Classification of goods or services for item registration (itemTyCd)",
    codes: [
      { cd: "1", cdNm: "Raw Material", cdDesc: "Inputs consumed in production or manufacturing" },
      { cd: "2", cdNm: "Finished Product", cdDesc: "Manufactured or traded physical inventory ready for resale" },
      { cd: "3", cdNm: "Service", cdDesc: "Intangible economic services or professional billing" },
    ],
  },

  packaging_units: {
    cdCls: "17",
    cdClsNm: "Packaging Unit",
    cdClsDesc: "Primary outer packaging code (pkgUnitCd)",
    codes: [
      { cd: "CT", cdNm: "Carton" },
      { cd: "BG", cdNm: "Bag" },
      { cd: "BA", cdNm: "Barrel" },
      { cd: "BE", cdNm: "Bundle" },
      { cd: "BL", cdNm: "Bale" },
      { cd: "BX", cdNm: "Box" },
      { cd: "CA", cdNm: "Can" },
      { cd: "CR", cdNm: "Wooden Crate" },
      { cd: "CY", cdNm: "Cylinder" },
      { cd: "DR", cdNm: "Drum" },
      { cd: "JY", cdNm: "Jerry Can" },
      { cd: "NT", cdNm: "Net" },
      { cd: "RL", cdNm: "Reel" },
      { cd: "RO", cdNm: "Roll" },
      { cd: "OU", cdNm: "Non-Exterior Packaging" },
      { cd: "CTN", cdNm: "Container" },
    ],
  },

  quantity_units: {
    cdCls: "10",
    cdClsNm: "Quantity Unit",
    cdClsDesc: "Unit of measure for inventory counts (qtyUnitCd)",
    codes: [
      { cd: "U", cdNm: "Pieces / Units", cdDesc: "Discrete item count" },
      { cd: "KG", cdNm: "Kilogram" },
      { cd: "LTR", cdNm: "Litre" },
      { cd: "M", cdNm: "Metre" },
      { cd: "M2", cdNm: "Square Metre" },
      { cd: "M3", cdNm: "Cubic Metre" },
      { cd: "TNE", cdNm: "Tonne (1,000 kg)" },
      { cd: "GRM", cdNm: "Gram" },
      { cd: "DZ", cdNm: "Dozen (12 units)" },
      { cd: "SET", cdNm: "Set" },
      { cd: "PA", cdNm: "Packet" },
      { cd: "KWT", cdNm: "Kilowatt" },
      { cd: "MWT", cdNm: "Megawatt Hour" },
    ],
  },

  import_item_status: {
    cdCls: "26",
    cdClsNm: "Import Item Status",
    cdClsDesc: "Status of items declared through Customs Single Window (imptItemSttsCd)",
    codes: [
      { cd: "1", cdNm: "Unsent", cdDesc: "Declared but not yet synchronised with eTIMS" },
      { cd: "2", cdNm: "Waiting", cdDesc: "Queued for taxpayer acceptance / confirmation" },
      { cd: "3", cdNm: "Approved", cdDesc: "Accepted into taxpayer inventory stock" },
      { cd: "4", cdNm: "Cancelled", cdDesc: "Declaration cancelled or revoked" },
    ],
  },

  receipt_labels: {
    cdCls: "TIS_RECEIPT",
    cdClsNm: "TIS Receipt Label",
    cdClsDesc: "Mandatory visual label printed atop POS receipt",
    codes: [
      { cd: "NS", cdNm: "Normal Sale", cdDesc: "Standard fiscal sale" },
      { cd: "NC", cdNm: "Normal Credit Note", cdDesc: "Credit note refund/adjustment" },
      { cd: "CS", cdNm: "Copy Sale", cdDesc: "Duplicate receipt copy" },
      { cd: "CC", cdNm: "Copy Credit Note", cdDesc: "Duplicate credit note copy" },
      { cd: "TS", cdNm: "Training Sale", cdDesc: "Non-fiscal test transaction" },
      { cd: "TC", cdNm: "Training Credit Note", cdDesc: "Non-fiscal test credit note" },
      { cd: "PS", cdNm: "Proforma Sale", cdDesc: "Proforma invoice / quotation" },
    ],
  },
};
