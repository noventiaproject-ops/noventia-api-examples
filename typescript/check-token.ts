// A token before a signature.  Run: node check-token.ts <mint> [mint|full]
import { checkToken, printWarnings } from './noventia.ts';

const [mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', depth = 'mint'] = process.argv.slice(2);
if (depth !== 'mint' && depth !== 'full') throw new Error('depth is mint or full');

const answer = await checkToken(mint, depth);
console.log(`Token ${mint}, depth ${depth}.`);
printWarnings(answer);

// A wallet or a DEX can filter by the highest level and still show every warning with its proofs.
if ((answer.highestWarning ?? 0) >= 2) console.log('Show these warnings to the user before they sign.');
