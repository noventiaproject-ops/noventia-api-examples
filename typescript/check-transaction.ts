// A transaction before it is signed.  Run: node check-transaction.ts <base64 transaction> <signer address>
// The transaction is simulated and dropped. The API does not send it to the chain.
import { checkTransaction, printWarnings } from './noventia.ts';

const [transaction, signer] = process.argv.slice(2);
if (transaction === undefined || signer === undefined) throw new Error('Usage: node check-transaction.ts <base64 transaction> <signer address>');

const answer = await checkTransaction(transaction, signer);
const simulation = answer['simulation'] as { status: string; error?: string | null };
const changes = answer['changes'] as { sol: { before: string; after: string } | null; tokens: { mint: string; before: string; after: string }[] };
const programs = answer['programs'] as { address: string; listed: boolean; name?: string }[];
const grants = answer['grants'] as { kind: string; account: string; to: string | null }[];

console.log(simulation.status === 'ok' ? 'The simulation ran.' : `The simulation failed: ${simulation.error ?? 'unknown'}`);
if (changes.sol !== null) console.log(`SOL: ${(BigInt(changes.sol.after) - BigInt(changes.sol.before)).toString()} lamports`);
for (const t of changes.tokens) console.log(`Token ${t.mint}: ${(BigInt(t.after) - BigInt(t.before)).toString()} raw units`);
for (const g of grants) console.log(`Grant, ${g.kind}: account ${g.account}${g.to === null ? '' : ` to ${g.to}`}`);
for (const p of programs) console.log(`Program ${p.listed ? (p.name ?? p.address) : `${p.address} (outside the recognized lists)`}`);
printWarnings(answer);
console.log('A simulation shows what would happen at this moment. The chain can differ a second later.');
