# TypeScript

Needs Node.js 22.18 or newer, which runs TypeScript files as they are. No packages to install.

```sh
export NOVENTIA_API_KEY="your key"

node meta.ts
node check-token.ts EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
node check-token.ts EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v full
node check-wallet.ts <address>
node check-transaction.ts <base64 transaction> <signer address>
```

On an older Node.js 22 add the flag: `node --experimental-strip-types meta.ts`.

[noventia.ts](noventia.ts) is the whole client: one function per call, one error class, one wait and repeat on a 429. Copy it into your project and change it as you need.

For the full types of every answer:

```sh
npm install "github:noventiaproject-ops/noventia-core-api"
```
