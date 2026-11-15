# MCP, for AI agents

The same checks as tools an agent can call, with the same rules and the same key.

* Address: `https://core.noventia.app/mcp`
* Transport: Streamable HTTP, one JSON answer per request, no session
* Header: `Authorization: Bearer <key>`

| Tool | What it does |
|---|---|
| `check_token(mint, depth)` | the token check. `depth` is `mint` or `full` |
| `check_wallet(address)` | the address check |
| `check_transaction(transaction, signer)` | the simulation of a transaction in base64 |
| `list_warning_codes()` | every warning code with its level and text. Costs nothing |

Each tool answers the envelope of the API as `structuredContent` and a short text of facts. The text ends by saying it is no verdict. An agent should show the warnings to its user before a signature.

## A client configuration

Most MCP clients take a remote server as an address and headers. The exact file and field names differ by client:

```json
{
  "mcpServers": {
    "noventia": {
      "type": "http",
      "url": "https://core.noventia.app/mcp",
      "headers": { "Authorization": "Bearer ${NOVENTIA_API_KEY}" }
    }
  }
}
```

## By hand, with curl

```sh
export NOVENTIA_API_KEY="your key"
MCP="https://core.noventia.app/mcp"

# The tools.
curl -s -X POST "$MCP" \
  -H "Authorization: Bearer $NOVENTIA_API_KEY" -H "Content-Type: application/json" \
  -d '{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }'

# One call.
curl -s -X POST "$MCP" \
  -H "Authorization: Bearer $NOVENTIA_API_KEY" -H "Content-Type: application/json" \
  -d '{ "jsonrpc": "2.0", "id": 2, "method": "tools/call",
        "params": { "name": "check_token", "arguments": { "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "depth": "mint" } } }'
```

What the API would refuse, such as a bad address or a spent day, comes back as a tool error in the API's own words (`isError: true`).
