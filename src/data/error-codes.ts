/**
 * KRA eTIMS Error Codes & Resolution Database
 * Extracted from OSCU/VSCU v2.0 Specifications and TIS Technical Manual
 */

export interface ErrorCodeInfo {
  code: string;
  category: "SERVER" | "CLIENT" | "TIS_HARDWARE" | "TIS_COMM";
  message: string;
  description: string;
  cause: string;
  resolution: string;
}

export const ERROR_CODES: Record<string, ErrorCodeInfo> = {
  // Success
  "000": {
    code: "000",
    category: "SERVER",
    message: "It is succeeded",
    description: "The transaction or query completed successfully on KRA eTIMS servers.",
    cause: "Normal operation.",
    resolution: "Store the returned signature (`rcptSign`), internal data (`intrlData`), and receipt counter for printing.",
  },

  "001": {
    code: "001",
    category: "SERVER",
    message: "No search result",
    description: "The query returned zero records matching the provided criteria.",
    cause: "Parameters like `lastReqDt` or TIN yielded no new or modified records.",
    resolution: "Verify search parameters, date range format (YYYYMMDDHHmmss), or check if items were registered.",
  },

  // Client Side Request Errors (89x)
  "891": {
    code: "891",
    category: "CLIENT",
    message: "Error creating Request URL",
    description: "Malformed URL or invalid endpoint path.",
    cause: "Typo in endpoint name or incorrect base URL.",
    resolution: "Verify endpoint URL against official OSCU/VSCU endpoint list. Check sandbox vs production base path.",
  },

  "892": {
    code: "892",
    category: "CLIENT",
    message: "Error creating Request Header",
    description: "HTTP header construction failure.",
    cause: "Missing Content-Type: application/json or malformed header attributes.",
    resolution: "Ensure headers contain `Content-Type: application/json; charset=utf-8`.",
  },

  "893": {
    code: "893",
    category: "CLIENT",
    message: "Error creating Request Body",
    description: "Failed to construct valid JSON request payload.",
    cause: "Invalid JSON serialization, unescaped characters, or circular structures.",
    resolution: "Validate JSON syntax using `JSON.stringify` and ensure all required fields are present.",
  },

  "894": {
    code: "894",
    category: "CLIENT",
    message: "Server communication error",
    description: "Failed to reach KRA eTIMS server or local VSCU daemon.",
    cause: "Network timeout, DNS resolution failure, SSL certificate error, or local VSCU port 8088 not listening.",
    resolution: "For OSCU: Check internet access and whitelist `*.kra.go.ke`. For VSCU: Ensure Java JAR is running on `http://localhost:8088`.",
  },

  "895": {
    code: "895",
    category: "CLIENT",
    message: "Unallowed Request Method",
    description: "HTTP method not permitted on this endpoint.",
    cause: "Using GET, PUT, or DELETE on an endpoint that requires POST.",
    resolution: "Always use HTTP POST with JSON body for all eTIMS API endpoints.",
  },

  "896": {
    code: "896",
    category: "CLIENT",
    message: "Request Status error",
    description: "HTTP response code other than 200 OK returned by server.",
    cause: "Reverse proxy, gateway error (502, 503, 504), or cloud firewall blocking payload.",
    resolution: "Check HTTP status code and response body. Ensure KRA sandbox/prod maintenance window is not active.",
  },

  "899": {
    code: "899",
    category: "CLIENT",
    message: "General client error",
    description: "Unspecified client-side runtime exception.",
    cause: "Unexpected library crash or memory error before network dispatch.",
    resolution: "Check client error stack trace and payload schema.",
  },

  // Server Side Processing Errors (90x - 99x)
  "900": {
    code: "900",
    category: "SERVER",
    message: "No header information",
    description: "Mandatory system header or metadata missing.",
    cause: "Request arrived without expected routing or control headers.",
    resolution: "Verify all required authentication fields (TIN, Branch ID, cmcKey) are present in the request JSON.",
  },

  "901": {
    code: "901",
    category: "SERVER",
    message: "Not a valid device",
    description: "Device serial number, PIN, or branch combination is not registered on eTIMS.",
    cause: "The `dvcSrlNo` provided in initialization does not match the serial issued on the eTIMS taxpayer portal.",
    resolution: "Log into `https://etims.kra.go.ke`, verify the exact assigned Device Serial Number for your branch ID, and update configuration.",
  },

  "902": {
    code: "902",
    category: "SERVER",
    message: "Device already installed",
    description: "The device has already completed initialization handshake.",
    cause: "Calling `/selectInitOsdcInfo` more than once after initialization has already succeeded.",
    resolution: "Do not call `/selectInitOsdcInfo` again. Reuse the existing stored `cmcKey`. Only re-init if KRA support resets your device.",
  },

  "903": {
    code: "903",
    category: "SERVER",
    message: "Only OSCU (or VSCU) device can be verified",
    description: "Device type mismatch between registered solution and API endpoint.",
    cause: "Calling OSCU endpoint with credentials registered as VSCU, or calling VSCU with OSCU credentials.",
    resolution: "Check your eTIMS portal onboarding type. If enrolled as OSCU, use cloud endpoints. If enrolled as VSCU, install and call the local JAR.",
  },

  "910": {
    code: "910",
    category: "SERVER",
    message: "Request parameter error",
    description: "One or more payload parameters failed server-side validation.",
    cause: "Incorrect date format (must be YYYYMMDDHHmmss), invalid taxTyCd (must be A-E), missing itemSeq, or calculation mismatch.",
    resolution: "Run payload through `validate_etims_payload`. Ensure `totAmt = totTaxblAmt + totTaxAmt` and all numbers are valid decimals.",
  },

  "911": {
    code: "911",
    category: "SERVER",
    message: "No request full text",
    description: "Empty request payload received by server.",
    cause: "POST body was empty or stripped by an intermediate proxy.",
    resolution: "Ensure HTTP POST body contains non-empty valid JSON string.",
  },

  "912": {
    code: "912",
    category: "SERVER",
    message: "Request Method error",
    description: "Endpoint does not support this operation.",
    cause: "Mismatched endpoint call or invalid sub-action.",
    resolution: "Verify endpoint name against official specification.",
  },

  "921": {
    code: "921",
    category: "SERVER",
    message: "Cannot receive declared sales/invoice data",
    description: "Server refused sales transaction.",
    cause: "Device status inactive, tax period closed, or prerequisite item not registered.",
    resolution: "Verify taxpayer status with `/selectCustomer` or ensure all line items are registered via `/saveItem` beforehand.",
  },

  "922": {
    code: "922",
    category: "SERVER",
    message: "Sales invoice data requires sales data first",
    description: "In VSCU flow, attempting to sign invoice before saving sales transaction.",
    cause: "Out of sequence call between sales saving and receipt generation.",
    resolution: "Follow correct VSCU sequence: `/trnsSales/saveSales` must be called with all item details.",
  },

  "990": {
    code: "990",
    category: "SERVER",
    message: "Max number of views exceeded",
    description: "Pagination or query rate limit exceeded on data retrieval.",
    cause: "Requesting too large a date window or excessive query frequency.",
    resolution: "Provide narrower `lastReqDt` timestamps and avoid full historical dumps in single requests.",
  },

  "991": {
    code: "991",
    category: "SERVER",
    message: "Registration error",
    description: "Server failed to save the entity (customer, item, stock).",
    cause: "Database constraint failure, duplicate key, or missing mandatory reference.",
    resolution: "Check if the item code or customer record already exists. Check server response details.",
  },

  "992": {
    code: "992",
    category: "SERVER",
    message: "Modification error",
    description: "Failed to update existing record.",
    cause: "Record cannot be updated in its current state (e.g., trying to modify an approved fiscal invoice).",
    resolution: "Fiscal sales invoices cannot be modified once signed. You must issue a Credit Note (`rcptTyCd: 'R'`) referencing the original invoice.",
  },

  "993": {
    code: "993",
    category: "SERVER",
    message: "Deletion error",
    description: "Deletion operation not permitted.",
    cause: "Fiscal tax records and transactions cannot be deleted under Kenyan tax law.",
    resolution: "Do not attempt deletion. Issue reversing credit note or negative stock adjustment instead.",
  },

  "994": {
    code: "994",
    category: "SERVER",
    message: "Overlapped/duplicate data",
    description: "Record with identical unique identifier already exists.",
    cause: "Reusing `invcNo`, item code `itemCd`, or stock movement number `sarNo` that was already registered.",
    resolution: "Ensure sequential invoice numbering (`invcNo`) is strictly monotonically increasing and unique per branch.",
  },

  "995": {
    code: "995",
    category: "SERVER",
    message: "No downloaded file",
    description: "Requested file or notice payload is unavailable.",
    cause: "Referenced file attachment not found on server.",
    resolution: "Check notice list or verify attachment identifier.",
  },

  "999": {
    code: "999",
    category: "SERVER",
    message: "Unknown error",
    description: "Internal unhandled server exception at KRA.",
    cause: "Temporary KRA server degradation or unhandled database exception.",
    resolution: "Wait and retry with exponential backoff. If persistent, escalate to `timsupport@kra.go.ke` with request timestamp and TIN.",
  },

  // TIS Device & POS Hardware Error Codes (00 - 99)
  "TIS_11": {
    code: "11",
    category: "TIS_HARDWARE",
    message: "Memory full",
    description: "Fiscal memory module or storage on control unit has reached full capacity.",
    cause: "Too many offline transactions stored without synchronization.",
    resolution: "Establish internet connection to sync pending transactions with KRA and clear audit buffer.",
  },

  "TIS_12": {
    code: "12",
    category: "TIS_HARDWARE",
    message: "Data corrupted",
    description: "Checksum failure or damaged records in local fiscal storage.",
    cause: "Sudden power interruption during write or hardware memory fault.",
    resolution: "Perform hardware diagnostic test. Restore from backup if supported or contact control unit vendor.",
  },

  "TIS_20": {
    code: "20",
    category: "TIS_HARDWARE",
    message: "RTC error",
    description: "Real-Time Clock (RTC) error or time drift exceeds allowed limits.",
    cause: "Local POS clock is out of sync with KRA network time by more than allowed threshold.",
    resolution: "Synchronize local server/PC clock with standard NTP server (time.google.com or pool.ntp.org).",
  },

  "TIS_30": {
    code: "30",
    category: "TIS_COMM",
    message: "Wrong command",
    description: "Unrecognized CMD sent in XML protocol between TIS and SCU.",
    cause: "Command tag invalid or unsupported by current firmware.",
    resolution: "Check TIS command format (e.g., `SEND_RECEIPT`, `SEND_INVENTORY`).",
  },

  "TIS_32": {
    code: "32",
    category: "TIS_COMM",
    message: "Wrong PIN",
    description: "Taxpayer PIN invalid or does not match device registration.",
    cause: "PIN format violation or mismatch with signed device certificate.",
    resolution: "Validate PIN format (11 chars: P + 9 digits + Letter). Ensure matching registered company PIN.",
  },

  "TIS_33": {
    code: "33",
    category: "TIS_COMM",
    message: "Wrong tax rate",
    description: "Tax rate sent on line item does not match rate table.",
    cause: "Sending tax rate other than 0 (A/C/D), 16 (B), or 8 (E).",
    resolution: "Ensure line item `taxTyCd` and `taxRt` align strictly with KRA Code Table 04.",
  },

  "TIS_40": {
    code: "40",
    category: "TIS_COMM",
    message: "Not activated",
    description: "Control unit has not completed official activation.",
    cause: "Attempting to issue fiscal receipts prior to device handshake completion.",
    resolution: "Complete `/selectInitOsdcInfo` initialization handshake first.",
  },

  "TIS_90": {
    code: "90",
    category: "TIS_COMM",
    message: "Internet error",
    description: "VSCU or TIS unable to reach KRA gateway for synchronization.",
    cause: "Internet disconnection lasting longer than allowable threshold.",
    resolution: "Restore network connectivity. NOTE: VSCU halts invoice signing after 24 hours of continuous offline operation.",
  },
};
