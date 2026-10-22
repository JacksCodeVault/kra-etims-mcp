/**
 * Tool: generate_qr_code_string
 * Formats receipt parameters into the official cryptographic KRA eTIMS QR Code text string
 */

import { z } from "zod";

export const qrGeneratorToolDefinition = {
  name: "generate_qr_code_string",
  description: "Formats invoice confirmation data into the official KRA eTIMS QR code string: 'invoice_date(ddmmyyyy)#time(hhmmss)#cu_number#cu_receipt_number#internal_data#receipt_signature'.",
  parameters: z.object({
    invoice_date: z.string().describe("Invoice date formatted as DDMMYYYY (e.g. '22102026') or YYYYMMDD"),
    time: z.string().describe("Time formatted as HHMMSS (e.g. '123005')"),
    cu_number: z.string().describe("Control Unit ID (sdcId from response, e.g. 'KRAMW010000001')"),
    cu_receipt_number: z.union([z.number(), z.string()]).describe("Receipt counter number (rcptNo, e.g. 4521)"),
    internal_data: z.string().describe("Internal fiscal data returned in intrlData"),
    receipt_signature: z.string().describe("Cryptographic receipt signature returned in rcptSign"),
  }),
  execute: async (args: {
    invoice_date: string;
    time: string;
    cu_number: string;
    cu_receipt_number: number | string;
    internal_data: string;
    receipt_signature: string;
  }) => {
    let dateStr = args.invoice_date.trim();
    // Handle date formatting: ensure output is DDMMYYYY
    if (dateStr.length === 8) {
      const first4 = Number(dateStr.substring(0, 4));
      const last4 = Number(dateStr.substring(4, 8));
      const isAlreadyDdmmyyyy = last4 >= 1990 && last4 <= 2100;

      if (!isAlreadyDdmmyyyy && first4 >= 1990 && first4 <= 2100) {
        // Input is YYYYMMDD -> convert to DDMMYYYY
        const yyyy = dateStr.substring(0, 4);
        const mm = dateStr.substring(4, 6);
        const dd = dateStr.substring(6, 8);
        dateStr = `${dd}${mm}${yyyy}`;
      }
    }

    const timeStr = args.time.trim().replace(/:/g, "");
    const cuNo = args.cu_number.trim();
    const rcptNo = String(args.cu_receipt_number).trim();
    const intrl = args.internal_data.trim();
    const sign = args.receipt_signature.trim();

    // Official formula: date#time#cu#rcpt#internal#signature
    const qrString = `${dateStr}#${timeStr}#${cuNo}#${rcptNo}#${intrl}#${sign}`;

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            qr_code_raw_string: qrString,
            components: {
              invoice_date_ddmmyyyy: dateStr,
              time_hhmmss: timeStr,
              cu_number: cuNo,
              cu_receipt_number: rcptNo,
              internal_data: intrl,
              receipt_signature: sign,
            },
            usage: "Encode qr_code_raw_string directly into a standard 2D QR Code image with medium error correction level.",
          }, null, 2),
        },
      ],
    };
  },
};
