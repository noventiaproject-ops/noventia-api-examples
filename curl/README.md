# curl

```sh
export NOVENTIA_API_KEY="your key"
BASE="https://core.noventia.app/v1/public"
```

## Your key and the warning codes

Costs nothing. A good first call.

```sh
curl -s "$BASE/meta" -H "Authorization: Bearer $NOVENTIA_API_KEY"
```

## A token

```sh
MINT="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

# Before a signature: the mint account, metadata and top holders.
curl -s "$BASE/token/$MINT" -H "Authorization: Bearer $NOVENTIA_API_KEY"

# With the creator's history.
curl -s "$BASE/token/$MINT?depth=full" -H "Authorization: Bearer $NOVENTIA_API_KEY"
```

Only the warnings, with [jq](https://jqlang.org):

```sh
curl -s "$BASE/token/$MINT" -H "Authorization: Bearer $NOVENTIA_API_KEY" \
  | jq '{highestWarning, notRead, warnings: [.warnings[] | {code, warningLevel, text}]}'
```

## An address

```sh
ADDRESS="an address"
curl -s "$BASE/wallet/$ADDRESS" -H "Authorization: Bearer $NOVENTIA_API_KEY"
```

## A transaction, before it is signed

The transaction is base64, signed or unsigned. It is simulated and dropped: the API does not send it to the chain.

```sh
curl -s -X POST "$BASE/transaction" \
  -H "Authorization: Bearer $NOVENTIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "transaction": "<base64>", "signer": "<address>" }'
```

## Status and waiting

`-i` shows the status and `Retry-After`:

```sh
curl -s -i "$BASE/meta" -H "Authorization: Bearer $NOVENTIA_API_KEY" | head -n 12
```

On 429 wait the seconds in `Retry-After` and repeat. On 503 `busy_today` the day's credits are spent, and answers the core already holds still serve.
