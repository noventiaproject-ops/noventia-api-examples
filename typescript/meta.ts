// Your key, its limits and what it used today. Costs nothing.  Run: node meta.ts
import { meta, NoventiaError } from './noventia.ts';

try {
  const m = await meta();
  console.log(`Key "${m.key.name}", plan ${m.key.plan}.`);
  console.log('Limits:', m.key.limits);
  console.log('Used today:', m.key.today);
  console.log(`Rules in force: ${JSON.stringify(m.meta.rules)}`);
  console.log(`${String(m.warningCodes.length)} warning codes, ${String(m.factKinds.length)} fact kinds.`);
} catch (err) {
  if (err instanceof NoventiaError) {
    console.error(`${String(err.status)} ${err.code}: ${err.message}${err.retryAfter === null ? '' : ` Wait ${String(err.retryAfter)} seconds.`}`);
    process.exitCode = 1;
  } else throw err;
}
