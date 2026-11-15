// An address.  Run: node check-wallet.ts <address>
import { checkWallet, printWarnings } from './noventia.ts';

const address = process.argv[2];
if (address === undefined) throw new Error('Usage: node check-wallet.ts <address>');

const answer = await checkWallet(address);
const account = answer['account'] as { kind: string; recognized?: { list: string; name: string } };
if (account.kind === 'recognized') console.log(`A recognized service: ${account.recognized?.name ?? ''} (${account.recognized?.list ?? ''}).`);
else if (account.kind === 'wallet') console.log(`A wallet. First transaction ${String(answer['ageDays'])} days ago.`);
else console.log('No wallet: a program, a token account or another account.');
printWarnings(answer);
