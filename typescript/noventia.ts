/**
 * A small client of the Noventia public check API. No packages: the fetch of Node.js 22 or newer.
 * For the full types of every answer use @noventia/core-api.
 */

export const BASE = process.env['NOVENTIA_API_BASE'] ?? 'https://core.noventia.app/v1/public';

export type Proof = Record<string, unknown>;
export type Fact = { kind: string; factId: string; value: unknown; observedAt: string; proofs: Proof[] };
export type Warning = { code: string; warningLevel: 1 | 2 | 3; factIds: string[]; proofs: Proof[]; messageCode: string; params?: Record<string, unknown>; text: string };
export type NotRead = { what: string; reason: string };
export type Meta = { apiVersion: number; asOf: string; rules: Record<string, unknown>; cache: string; credits: number };
/** What every check answers. Each call adds fields of its own: see the files in ../responses. */
export type Answer = { meta: Meta; warnings: Warning[]; notRead: NotRead[]; highestWarning: number | null; facts?: Fact[] } & Record<string, unknown>;

/** A refusal of the API: `{ "error": { code, message, messageCode, params } }`. */
export class NoventiaError extends Error {
  readonly status: number;
  readonly code: string;
  /** Seconds to wait, from the Retry-After header of a 429 or a 503. */
  readonly retryAfter: number | null;

  constructor(status: number, code: string, message: string, retryAfter: number | null) {
    super(message);
    this.name = 'NoventiaError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

function key(): string {
  const k = process.env['NOVENTIA_API_KEY'];
  if (k === undefined || k === '') throw new Error('Set NOVENTIA_API_KEY to your key.');
  return k;
}

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

async function call<T>(path: string, body?: unknown, repeated = false): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { authorization: `Bearer ${key()}`, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (res.ok) return (await res.json()) as T;
  const wait = Number(res.headers.get('retry-after'));
  const retryAfter = Number.isFinite(wait) && wait > 0 ? wait : null;
  // The rate limit of a minute: wait once and repeat. A spent day (503) is not waited out here.
  if (res.status === 429 && !repeated && retryAfter !== null && retryAfter <= 60) {
    await sleep(retryAfter);
    return call<T>(path, body, true);
  }
  const parsed = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  throw new NoventiaError(res.status, parsed?.error?.code ?? 'unknown', parsed?.error?.message ?? `HTTP ${String(res.status)}`, retryAfter);
}

/** A token. `mint` reads the mint account, metadata and top holders; `full` adds the creator's history. */
export const checkToken = (mint: string, depth: 'mint' | 'full' = 'mint') => call<Answer>(`/token/${encodeURIComponent(mint)}?depth=${depth}`);

/** An address: what kind of account it is, its age, the tokens it launched. */
export const checkWallet = (address: string) => call<Answer>(`/wallet/${encodeURIComponent(address)}`);

/** A transaction in base64, signed or unsigned. It is simulated and dropped; the API does not send it. */
export const checkTransaction = (transaction: string, signer: string) => call<Answer>('/transaction', { transaction, signer });

/** The rule versions, every warning code, the limits of the key and what it used today. Costs nothing. */
export const meta = () => call<{ meta: Meta; warningCodes: unknown[]; factKinds: unknown[]; key: { name: string; plan: string; limits: Record<string, number>; today: Record<string, number> } }>('/meta');

/** Prints the warnings of an answer and what was not read. Facts, and no verdict. */
export function printWarnings(answer: Answer): void {
  console.log(`As of ${answer.meta.asOf} (${answer.meta.cache}, ${String(answer.meta.credits)} credits).`);
  if (answer.warnings.length === 0) console.log('No warning was made from what was read.');
  for (const w of answer.warnings) console.log(`Level ${String(w.warningLevel)}  ${w.code}: ${w.text}`);
  for (const n of answer.notRead) console.log(`Not read: ${n.what} (${n.reason})`);
}
