/**
 * Tool: generate_sample_payload
 * Generates mathematically balanced, syntactically correct sample JSON payloads for eTIMS endpoints
 */

import { z } from "zod";

export const payloadGeneratorToolDefinition = {
  name: "generate_sample_payload",
  description: "Generates production-ready, mathematically balanced sample JSON request payloads for eTIMS endpoints (sales, credit notes, item registration, stock in/out, handshake).",
  parameters: z.object({
    type: z.enum([
      "standard_vat_sale",
      "exempt_sale",
      "fuel_station_sale",
      "credit_note",
      "device_init",
      "item_registration",
      "stock_in_purchase",
    ]).describe("The integration scenario or document type to generate"),
    custom_pin: z.string().optional().describe("Optional custom seller KRA PIN to populate"),
    custom_buyer_pin: z.string().optional().describe("Optional custom buyer KRA PIN to populate"),
  }),
  execute: async (args: { type: string; custom_pin?: string; custom_buyer_pin?: string }) => {
    const tin = args.custom_pin || "P000000001A";
    const custTin = args.custom_buyer_pin || "P051234567X";
    const now = new Date();
    const YYYY = now.getFullYear().toString();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const DD = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    const cfmDt = `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
    const salesDt = `${YYYY}${MM}${DD}`;

    let payload: Record<string, any>;

    switch (args.type) {
      case "standard_vat_sale":
        payload = {
          tin,
          bhfId: "00",
          cmcKey: "YOUR_CMC_KEY_FROM_INIT",
          invcNo: 1001,
          orgInvcNo: 0,
          custTin,
          custNm: "ACME LOGISTICS KENYA LIMITED",
          salesTyCd: "N",
          rcptTyCd: "S",
          pmtTyCd: "01",
          salesSttsCd: "02",
          cfmDt,
          salesDt,
          stockRlsDt: cfmDt,
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
            custTin,
            custMblNo: "0712345678",
            rptNo: 1,
            trdeNm: "HEAD OFFICE STORE",
            adrs: "Nairobi Commercial District",
            topMsg: "Thank you for your business",
            btmMsg: "Goods returnable within 7 days with fiscal receipt",
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
        };
        break;

      case "fuel_station_sale":
        payload = {
          tin,
          bhfId: "01",
          cmcKey: "YOUR_CMC_KEY_FROM_INIT",
          invcNo: 5004,
          orgInvcNo: 0,
          custTin,
          custNm: "SAFARI TOURS LOGISTICS FLEET",
          salesTyCd: "N",
          rcptTyCd: "S",
          pmtTyCd: "05", // Card payment
          salesSttsCd: "02",
          cfmDt,
          salesDt,
          stockRlsDt: cfmDt,
          totItemCnt: 1,
          taxblAmtA: 0,
          taxblAmtB: 0,
          taxblAmtC: 0,
          taxblAmtD: 0,
          taxblAmtE: 5000.0,
          taxRtA: 0,
          taxRtB: 16.0,
          taxRtC: 0,
          taxRtD: 0,
          taxRtE: 8.0,
          taxAmtA: 0,
          taxAmtB: 0,
          taxAmtC: 0,
          taxAmtD: 0,
          taxAmtE: 400.0, // 8% of 5000
          totTaxblAmt: 5000.0,
          totTaxAmt: 400.0,
          totAmt: 5400.0,
          prchrAcptcYn: "Y",
          remark: "Pump No 3 - Premium Diesel (Automotive Gas Oil)",
          regrId: "PUMPATTENDANT02",
          regrNm: "John Kamau",
          modrId: "PUMPATTENDANT02",
          modrNm: "John Kamau",
          itemList: [
            {
              itemSeq: 1,
              itemCd: "KE2BLLTR0000004",
              itemClsCd: "15101505", // Diesel fuel UNSPSC
              itemNm: "Automotive Gas Oil (Diesel)",
              pkgUnitCd: "BL",
              pkg: 1,
              qtyUnitCd: "LTR",
              qty: 25.0,
              prc: 200.0,
              splyAmt: 5000.0,
              dcRt: 0,
              dcAmt: 0,
              taxTyCd: "E", // 8% Petroleum VAT rate
              taxblAmt: 5000.0,
              taxAmt: 400.0,
              totAmt: 5400.0,
            },
          ],
        };
        break;

      case "credit_note":
        payload = {
          tin,
          bhfId: "00",
          cmcKey: "YOUR_CMC_KEY_FROM_INIT",
          invcNo: 1002, // Sequential credit note number
          orgInvcNo: 1001, // References original sale 1001
          custTin,
          custNm: "ACME LOGISTICS KENYA LIMITED",
          salesTyCd: "N",
          rcptTyCd: "R", // R = Credit Note
          rfdRsnCd: "03", // 03 = Damaged Goods (Code Class 32)
          rfdDt: cfmDt,
          pmtTyCd: "01",
          salesSttsCd: "02",
          cfmDt,
          salesDt,
          stockRlsDt: cfmDt,
          totItemCnt: 1,
          taxblAmtA: 0,
          taxblAmtB: 500.0, // Returning 10 units worth 500
          taxblAmtC: 0,
          taxblAmtD: 0,
          taxblAmtE: 0,
          taxRtA: 0,
          taxRtB: 16.0,
          taxRtC: 0,
          taxRtD: 0,
          taxRtE: 8.0,
          taxAmtA: 0,
          taxAmtB: 80.0, // 16% of 500
          taxAmtC: 0,
          taxAmtD: 0,
          taxAmtE: 0,
          totTaxblAmt: 500.0,
          totTaxAmt: 80.0,
          totAmt: 580.0,
          prchrAcptcYn: "Y",
          remark: "Credit note for 10 units damaged in transit",
          regrId: "CASHIER01",
          regrNm: "Jane Doe",
          modrId: "CASHIER01",
          modrNm: "Jane Doe",
          itemList: [
            {
              itemSeq: 1,
              itemCd: "KE2CTU00000001",
              itemClsCd: "50202306",
              itemNm: "Bottled Mineral Water 500ml",
              pkgUnitCd: "CT",
              pkg: 1,
              qtyUnitCd: "U",
              qty: 10,
              prc: 50.0,
              splyAmt: 500.0,
              dcRt: 0,
              dcAmt: 0,
              taxTyCd: "B",
              taxblAmt: 500.0,
              taxAmt: 80.0,
              totAmt: 580.0,
            },
          ],
        };
        break;

      case "device_init":
        payload = {
          tin,
          bhfId: "00",
          dvcSrlNo: "ETIMS-DEMO-DEVICE-01",
        };
        break;

      case "item_registration":
        payload = {
          tin,
          bhfId: "00",
          cmcKey: "YOUR_CMC_KEY_FROM_INIT",
          itemCd: "KE2CTU00000001",
          itemClsCd: "50202306",
          itemTyCd: "2", // Finished Product
          itemNm: "Bottled Mineral Water 500ml",
          itemStdNm: "Natural Spring Water",
          orgnNatCd: "KE",
          pkgUnitCd: "CT",
          qtyUnitCd: "U",
          taxTyCd: "B",
          btchNo: "BATCH-2026-A",
          bcd: "6161101234567",
          dftPrc: 50.0,
          grpPrcL1: 50.0,
          grpPrcL2: 45.0,
          grpPrcL3: 40.0,
          grpPrcL4: 0,
          grpPrcL5: 0,
          addInfo: "Standard retail packaging",
          sftyQty: 50,
          isrcAplcbYn: "N",
          useYn: "Y",
          regrId: "SYSADMIN",
          regrNm: "System Administrator",
          modrId: "SYSADMIN",
          modrNm: "System Administrator",
        };
        break;

      case "stock_in_purchase":
        payload = {
          tin,
          bhfId: "00",
          cmcKey: "YOUR_CMC_KEY_FROM_INIT",
          sarNo: 201,
          orgSarNo: 0,
          regTyCd: "A",
          custTin: "P001122334Z",
          custBhfId: "00",
          custNm: "KENYA BEVERAGES DISTRIBUTORS LTD",
          sarTyCd: "02", // Incoming - Purchase
          ocrnDt: salesDt,
          totItemCnt: 1,
          totTaxblAmt: 10000.0,
          totTaxAmt: 1600.0,
          totAmt: 11600.0,
          remark: "Received 200 units from distributor",
          itemList: [
            {
              itemSeq: 1,
              itemCd: "KE2CTU00000001",
              itemClsCd: "50202306",
              itemNm: "Bottled Mineral Water 500ml",
              pkgUnitCd: "CT",
              pkg: 10,
              qtyUnitCd: "U",
              qty: 200,
              itemExprDt: `${YYYY}1231`,
              prc: 50.0,
              splyAmt: 10000.0,
              totDcAmt: 0,
              taxTyCd: "B",
              taxblAmt: 10000.0,
              taxAmt: 1600.0,
              totAmt: 11600.0,
            },
          ],
        };
        break;

      default:
        payload = {};
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  },
};
