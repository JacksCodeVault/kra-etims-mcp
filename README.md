# KRA eTIMS MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Standard-green.svg)](https://modelcontextprotocol.io/)

A high-performance **Model Context Protocol (MCP)** server providing complete, authoritative knowledge, API schemas, validation rules, code snippets, and automated error diagnostics for **Kenya Revenue Authority (KRA) eTIMS** integrations.

Enables AI coding assistants to seamlessly write, validate, and troubleshoot eTIMS integrations across **OSCU** (Cloud REST), **VSCU** (Virtual Sales Control Unit), **TIS** (Trader Invoicing System), **Buyer-Initiated Invoicing (BII)**, **Fuel Station Automation**, and **Stock Management**.

---

## Supported AI Assistants

Works out-of-the-box via the standard **STDIO transport** with:

| Assistant / IDE | Configuration Location | Status |
|---|---|---|
| **Cursor** | `.cursor/mcp.json` or `~/.cursor/mcp.json` | [x] Supported |
| **Google Antigravity** | `.agents/mcp_config.json` or `/mcp` CLI | [x] Supported |
| **Zed IDE** | `.zed/settings.json` or `~/.config/zed/settings.json` | [x] Supported |
| **Claude Code** | `.mcp.json` or `claude mcp add` | [x] Supported |
| **OpenAI Codex** | `~/.codex/config.toml` | [x] Supported |
| **GitHub Copilot** | `.vscode/mcp.json` | [x] Supported |

---

## Quickstart (Zero-Install via NPX)

You can run the server directly without cloning or building:

\`\`\`bash
npx -y kra-etims-mcp
\`\`\`

---

## Client Setup Instructions

### 1. Cursor
Add to your project's `.cursor/mcp.json` (or global `~/.cursor/mcp.json`):

\`\`\`json
{
  "mcpServers": {
    "kra-etims": {
      "command": "npx",
      "args": ["-y", "kra-etims-mcp"]
    }
  }
}
\`\`\`

### 2. Google Antigravity
Add to `.agents/mcp_config.json` in your workspace root, or configure interactively using the `/mcp` command:

\`\`\`json
{
  "mcpServers": {
    "kra-etims": {
      "command": "npx",
      "args": ["-y", "kra-etims-mcp"]
    }
  }
}
\`\`\`

### 3. Zed IDE
Add to `.zed/settings.json` in your project or global `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "kra-etims": {
      "command": {
        "path": "npx",
        "args": ["-y", "kra-etims-mcp"]
      }
    }
  }
}
```

Or when running via local Docker container:

```json
{
  "context_servers": {
    "kra-etims": {
      "command": {
        "path": "docker",
        "args": ["run", "-i", "--rm", "kra-etims-mcp"]
      }
    }
  }
}
```

### 4. Claude Code
Run the CLI command:
```bash
claude mcp add --transport stdio kra-etims -- npx -y kra-etims-mcp
```
Or create `.mcp.json` in your repository root:
```json
{
  "mcpServers": {
    "kra-etims": {
      "command": "npx",
      "args": ["-y", "kra-etims-mcp"]
    }
  }
}
```

### 5. OpenAI Codex
Add to `~/.codex/config.toml`:

```toml
[mcp_servers.kra-etims]
command = "npx"
args = ["-y", "kra-etims-mcp"]
```

### 6. GitHub Copilot (VS Code)
Add to `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "kra-etims": {
      "command": "npx",
      "args": ["-y", "kra-etims-mcp"]
    }
  }
}
```

---

## Running in Docker (Automatic Reboot Restart)

The server can run as a background container configured with `restart: unless-stopped`, so it stays alive across host reboots.

### Option A: Docker Compose (Recommended)

1. Start the service:
```bash
docker compose up -d
```

2. Check health status:
```bash
curl http://localhost:3000/health
```

3. Connect your IDEs using the HTTP/SSE endpoint:
- **SSE Stream**: `http://localhost:3000/sse`
- **Messages**: `http://localhost:3000/message`

### Option B: Docker CLI

Run in daemon mode with automatic reboot restart:
```bash
docker run -d \
  --name kra-etims-mcp \
  --restart unless-stopped \
  -p 3000:3000 \
  kra-etims-mcp --http 3000
```

Run in STDIO mode directly from your IDE:
```bash
docker run -i --rm kra-etims-mcp
```

---

## OS-Specific Startup & Setup Guide (Linux, macOS, Windows)

Whether you choose Docker or Node.js (`npx`), follow the instructions below tailored to your operating system.

---

### Linux (Ubuntu, Debian, Fedora, Arch, CentOS)

#### Method 1: Docker (Single Command with Reboot Auto-Restart)

1. **Ensure Docker is running**:
   ```bash
   sudo systemctl enable --now docker
   ```
2. **Start the container**:
   ```bash
   docker compose up -d
   ```
   *(Or with pure Docker CLI)*:
   ```bash
   docker run -d --name kra-etims-mcp --restart unless-stopped -p 3000:3000 kra-etims-mcp --http 3000
   ```
3. **Verify running status**:
   ```bash
   curl http://localhost:3000/health
   ```

#### Method 2: Node.js / NPX (No Docker Required)

Requires Node.js 18+ installed (`node -v`):
```bash
npx -y kra-etims-mcp
```

#### Linux Client Configuration File Paths:
- **Cursor**: `~/.cursor/mcp.json` or project `.cursor/mcp.json`
- **Google Antigravity**: `~/.gemini/config/mcp_config.json` or project `.agents/mcp_config.json`
- **Zed IDE**: `~/.config/zed/settings.json` or project `.zed/settings.json`
- **Claude Code**: `~/.claude.json` or project `.mcp.json`
- **OpenAI Codex**: `~/.codex/config.toml`
- **GitHub Copilot / VS Code**: `~/.config/Code/User/globalStorage/github.copilot/mcp.json` or project `.vscode/mcp.json`

---

### macOS (Apple Silicon M1/M2/M3/M4 & Intel)

#### Method 1: Docker (Docker Desktop or OrbStack)

1. **Ensure Docker Desktop is open**:
   Launch `Docker.app` or `OrbStack.app` from Applications.
2. **Start the container**:
   In Terminal (`zsh`):
   ```bash
   docker compose up -d
   ```
   *(Or with pure Docker CLI)*:
   ```bash
   docker run -d --name kra-etims-mcp --restart unless-stopped -p 3000:3000 kra-etims-mcp --http 3000
   ```
3. **Verify running status**:
   ```bash
   curl http://localhost:3000/health
   ```

#### Method 2: Node.js / NPX (No Docker Required)

Requires Node.js installed (`brew install node`):
```bash
npx -y kra-etims-mcp
```

#### macOS Client Configuration File Paths:
- **Cursor**: `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/mcp.json` or project `.cursor/mcp.json`
- **Google Antigravity**: `~/.gemini/config/mcp_config.json` or project `.agents/mcp_config.json`
- **Zed IDE**: `~/Library/Application Support/Zed/settings.json` or project `.zed/settings.json`
- **Claude Code**: `~/.claude.json` or project `.mcp.json`
- **OpenAI Codex**: `~/.codex/config.toml`
- **GitHub Copilot / VS Code**: `~/Library/Application Support/Code/User/globalStorage/github.copilot/mcp.json` or project `.vscode/mcp.json`

---

### Windows (10 & 11)

#### Method 1: Docker Desktop (with WSL2 Backend)

1. **Ensure Docker Desktop is running**:
   Start Docker Desktop from the Start Menu. Ensure WSL2 integration is enabled.
2. **Start the container** (Run in PowerShell or Command Prompt):
   ```powershell
   docker compose up -d
   ```
   *(Or with pure Docker CLI)*:
   ```powershell
   docker run -d --name kra-etims-mcp --restart unless-stopped -p 3000:3000 kra-etims-mcp --http 3000
   ```
3. **Verify running status**:
   ```powershell
   curl http://localhost:3000/health
   # or in PowerShell:
   Invoke-RestMethod http://localhost:3000/health
   ```

#### Method 2: Node.js / NPX on Windows

Requires Node.js installed from [nodejs.org](https://nodejs.org/):
```powershell
npx -y kra-etims-mcp
```

> [!NOTE]
> On Windows, some tools require specifying `cmd.exe /c npx -y kra-etims-mcp` if `npx` is a `.cmd` batch script. Example for Windows `mcp.json`:
> ```json
> {
>   "mcpServers": {
>     "kra-etims": {
>       "command": "cmd.exe",
>       "args": ["/c", "npx", "-y", "kra-etims-mcp"]
>     }
>   }
> }
> ```
> Or when using Docker directly on Windows:
> ```json
> {
>   "mcpServers": {
>     "kra-etims": {
>       "command": "docker",
>       "args": ["run", "-i", "--rm", "kra-etims-mcp"]
>     }
>   }
> }
> ```

#### Windows Client Configuration File Paths:
- **Cursor**: `%APPDATA%\Cursor\User\globalStorage\cursor.mcp\mcp.json` or project `.cursor\mcp.json`
- **Google Antigravity**: `%USERPROFILE%\.gemini\config\mcp_config.json` or project `.agents\mcp_config.json`
- **Zed IDE**: `%APPDATA%\Zed\settings.json` or project `.zed\settings.json`
- **Claude Code**: `%USERPROFILE%\.claude.json` or project `.mcp.json`
- **OpenAI Codex**: `%USERPROFILE%\.codex\config.toml`
- **GitHub Copilot / VS Code**: `%APPDATA%\Code\User\globalStorage\github.copilot\mcp.json` or project `.vscode\mcp.json`

---

## Capabilities & Developer Tools

### 1. Tools

| Tool | Description |
|---|---|
| \`search_knowledge_base\` | Sub-millisecond full-text and fuzzy search across guides, API endpoints, error codes, and code tables. |
| \`get_api_spec\` | Inspect full request/response schemas, URLs, required headers, and parameters for OSCU or VSCU endpoints. |
| \`lookup_code\` | Query KRA code tables (Tax categories A-E, Payment methods 01-07, Credit note reasons 01-13, Stock movement types 01-16, Packaging units, HS codes). |
| \`validate_etims_payload\` | Validates PIN formats (11-chars: P/A + 9 digits + letter), branch IDs, timestamps, and verifies that tax amounts balance (\`totAmt = totTaxblAmt + totTaxAmt\`). |
| \`generate_sample_payload\` | Generates ready-to-run, mathematically sound JSON request bodies for sales invoices, credit notes, item registration, stock in/out, and device handshake. |
| \`explain_error_code\` | Instant diagnostics for KRA error codes (\`000\`, \`901\`, \`903\`, \`910\`, \`994\`, TIS hardware/software codes) with exact root cause and fix steps. |
| \`generate_qr_code_string\` | Formats receipt parameters into the official cryptographic KRA QR code string (\`date#time#cu#rcpt#internal#signature\`). |

### 2. Resources (\`etims://...\`)
Directly attachable knowledge documents:
- \`etims://docs/oscu-vs-vscu\` — OSCU vs VSCU Architecture & Integration Guide
- \`etims://docs/onboarding-guide\` — Step-by-step Onboarding & Handshake Guide
- \`etims://docs/credit-notes-rules\` — Credit Notes & Invoice Reversal Rules
- \`etims://docs/buyer-initiated-invoicing\` — Buyer-Initiated Invoicing (BII) & Reverse Invoicing
- \`etims://docs/stock-management\` — Mandatory Stock Management Guide
- \`etims://docs/fuel-station-system\` — Forecourt Automation & Fuel Station System
- \`etims://docs/tis-qr-code-spec\` — TIS Receipt Layout & QR Code Formula
- \`etims://codes/all\` — All system code tables dictionary
- \`etims://errors/all\` — All error codes and troubleshooting catalog
- \`etims://api/catalog\` — Complete API endpoints catalog

### 3. Guided Prompts
- \`scaffold-etims-client\` — Scaffolds an eTIMS API client in TypeScript, Python, PHP, or Go.
- \`debug-etims-error\` — Interactive troubleshooting for failed KRA requests.
- \`implement-credit-note\` — Step-by-step credit note generation sequence.
- \`setup-stock-sync\` — Workflow for mandatory stock synchronization.

---

## Performance & Architecture

- **Sub-2ms Execution**: In-memory pre-compiled index powered by [MiniSearch](https://github.com/lucaong/minisearch).
- **Zero Disk Overhead**: Static assets and code tables are bundled at build time; no database or external network calls needed during knowledge queries.
- **Safe Stdio Transport**: All diagnostic logging writes strictly to \`stderr\`, ensuring the JSON-RPC 2.0 communication channel on \`stdout\` remains uncorrupted.

---

## Local Development & Testing

\`\`\`bash
# Install dependencies
npm install

# Run build
npm run build

# Run automated test suite (13 passing tests, <400ms duration)
npm test

# Type checking
npm run typecheck
\`\`\`

---

## License

MIT © 2026 KRA eTIMS Open Source Community
