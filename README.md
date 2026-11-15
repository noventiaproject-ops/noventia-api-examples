# Noventia API examples

Examples for the Noventia public check API: one question before a transaction is signed. What does the chain say about this token, this address, this transaction.

The answer is facts as read at a moment, warnings by level, and the proof of each. It is no verdict: the API does not call anything safe or unsafe, and the absence of a warning is not a statement.

* Documentation: https://noventia.xyz/developers
* Terms: https://noventia.xyz/developers/terms
* Base address: `https://core.noventia.app/v1/public`
* Types: [`@noventia/core-api`](https://github.com/noventiaproject-ops/noventia-core-api)

## A key

Every call needs a key in the header `Authorization: Bearer <key>`. During early access a key comes with an invite code: enter the code on the documentation page and the key is shown once. The same page says how to ask for a code. Put the key in the environment and keep it out of your code:

```sh
export NOVENTIA_API_KEY="your key"
```

A key is for a server. A browser page cannot call the API with it.

## The calls

| Call | What it answers | Example answer |
|---|---|---|
| `GET /v1/public/token/{mint}` | the mint, who can mint and freeze, Token-2022 extensions, the share of the top holders, the creator's record | [responses/public-token-mint.json](responses/public-token-mint.json) |
| `GET /v1/public/wallet/{address}` | what kind of account it is, its first transaction and age, the tokens it launched | [responses/public-wallet.json](responses/public-wallet.json) |
| `POST /v1/public/transaction` | a simulation: what would change for the signer, the programs called, the powers handed over. Beta | [responses/public-transaction.json](responses/public-transaction.json) |
| `GET /v1/public/meta` | the rule versions, every warning code with its level and text, the limits of your key and what it used today. Costs nothing | [responses/public-meta.json](responses/public-meta.json) |

Each file in `responses/` holds the request as sent and the answer. The answers are real answers of the production core. Wallet addresses and signatures in them are shortened to their first and last four characters, and the transaction body is cut.

`GET /v1/public/token/{mint}` takes `depth`:

| `depth` | What is read | Use |
|---|---|---|
| `mint` (default) | the mint account, metadata, top holders, and the creator's record only if the core already holds it | before a signature |
| `full` | the same and the creator's history | a token page, a listing review |

## Run the examples

| Language | Folder | Needs |
|---|---|---|
| curl | [curl/](curl/README.md) | curl |
| TypeScript | [typescript/](typescript/README.md) | Node.js 22 or newer |
| Python | [python/](python/README.md) | Python 3.9 or newer, no packages |
| MCP, for AI agents | [mcp/](mcp/README.md) | any MCP client, or curl |

## Reading an answer

Every call answers one envelope:

```json
{
  "meta": { "apiVersion": 1, "asOf": "…", "rules": { }, "cache": "held", "credits": 0 },
  "subject": { "kind": "token", "address": "…" },
  "facts": [ { "kind": "solana.mintState", "factId": "…", "value": { }, "observedAt": "…", "proofs": [ ] } ],
  "warnings": [ { "code": "…", "warningLevel": 2, "factIds": [ ], "proofs": [ ], "messageCode": "…", "text": "…" } ],
  "notRead": [ { "what": "creator", "reason": "depth" } ],
  "highestWarning": 2
}
```

* **Codes are stable.** A fact kind and a warning code keep their meaning. New ones are added, so pass over a code you do not know.
* **Levels.** 1 is a note. 2 is a power or a cost the holder should know. 3 is a record of harm with its transactions. `highestWarning` is the highest level among the warnings and nothing more: there is no score.
* **Proofs.** Every fact and every warning carries the account at a slot or the transaction signatures it rests on.
* **What was not read** is named in `notRead` with the reason. A warning is made only from what was read.
* **Text** comes with its `messageCode` and `params`, so you can show your own words.

## Limits and errors

The free plan: 60 requests a minute, 300 credits of new reads a day, 200 transaction checks a day. An answer the core already holds costs no credits. `GET /v1/public/meta` shows the limits of your key and what it used today.

Errors have one shape:

```json
{ "error": { "code": "rate_limited", "message": "…", "messageCode": "…", "params": { } } }
```

| Status | `code` | What to do |
|---|---|---|
| 400 | `invalid_address` and others | fix the request. The message says what is wrong |
| 401 | `unauthorized` | send the key |
| 429 | `rate_limited` | wait the seconds in `Retry-After` |
| 503 | `busy_today` | the day's credits are spent. Wait the seconds in `Retry-After`. Held answers still serve |

The examples wait and repeat once on 429 and stop on 503.

## What the API keeps

A transaction sent for a check is simulated and dropped. It is not sent to the chain, not stored and not logged. The log of a call holds the route, the status and the credits spent, and no address.

## License

[MIT](LICENSE).
