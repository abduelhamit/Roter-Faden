// Regenerates static/dictionary.txt.gz, the game's German word list, from the Free
// German Dictionary (https://sourceforge.net/projects/germandict/ — declared Public
// Domain there; built largely from the German Wikipedia dump, CC BY-SA).
//
// Pipeline: download german.7z (sha256-pinned, cached in .cache/) → extract german.dic
// (ISO-8859-1, one word per line, CRLF) → foldLetters, the exact rules of #4
// (uppercase, Ä→AE, Ö→OE, Ü→UE, ẞ→SS, …) → drop words shorter than 4 letters → warn about
// and skip words that still contain letters outside A–Z → dedupe → sort → gzip into
// static/dictionary.txt.gz (tracked with Git LFS).
//
// Run:   pnpm generate:dictionary   (normalizes via Node ≥ 22.18 type stripping of model.ts)
// Check: pnpm build runs `--ensure` first — it only verifies that the committed asset
// exists, is no Git LFS pointer and is gzip; no network, no TypeScript involved.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

// fileURLToPath, not URL#pathname: pathname stays percent-encoded (and gains a leading
// slash on Windows), which would break any checkout whose path contains spaces or
// non-ASCII characters — and this script guards every `pnpm build`.
const root = fileURLToPath(new URL('..', import.meta.url));
const out = `${root}static/dictionary.txt.gz`;
const SOURCE = 'https://downloads.sourceforge.net/project/germandict/german.7z';
const SHA256 = '978e83873a5fc12dd75fa11b6c02b8120e143da8eb457f48cdb377ae40a60967';

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

if (process.argv[2] === '--ensure') {
	const bytes = existsSync(out) ? readFileSync(out) : null;
	if (!bytes)
		throw new Error('static/dictionary.txt.gz is missing — run: pnpm generate:dictionary');
	if (bytes.subarray(0, 23).toString('utf8') === 'version https://git-lfs')
		throw new Error(
			'static/dictionary.txt.gz is a Git LFS pointer — run: git lfs pull (or pnpm generate:dictionary)'
		);
	if (bytes[0] !== 0x1f || bytes[1] !== 0x8b)
		throw new Error('static/dictionary.txt.gz is not gzip — run: pnpm generate:dictionary');
	process.exit(0);
}
if (process.argv[2] !== undefined) throw new Error(`unknown argument: ${process.argv[2]}`);

// sha256-pinned source archive; cached so regeneration works without network after the first run.
const cacheDir = `${root}.cache`;
const archive = join(cacheDir, 'german.7z');
mkdirSync(cacheDir, { recursive: true });
let blob = existsSync(archive) ? readFileSync(archive) : null;
if (blob === null) {
	const res = await fetch(SOURCE);
	if (!res.ok) throw new Error(`download failed: ${res.status} — ${SOURCE}`);
	blob = Buffer.from(await res.arrayBuffer());
}
const hash = sha256(blob);
if (hash !== SHA256) {
	throw new Error(
		`sha256 mismatch: got ${hash}, want ${SHA256} — ${existsSync(archive) ? `delete ${archive} and retry` : 'mirror served something else, retry'}`
	);
}
if (!existsSync(archive)) writeFileSync(archive, blob);

const dir = mkdtempSync(join(tmpdir(), 'germandict-'));
try {
	// ubuntu CI ships 7z; macOS tar is libarchive, which reads 7z as well.
	try {
		execFileSync('7z', ['x', '-y', archive, `-o${dir}`], { stdio: 'ignore' });
	} catch {
		try {
			execFileSync('tar', ['-xf', archive, '-C', dir], { stdio: 'ignore' });
		} catch {
			throw new Error('cannot extract german.7z — install p7zip (e.g. brew install p7zip)');
		}
	}
	const dic = join(dir, 'german.dic');
	if (!existsSync(dic)) throw new Error('german.7z no longer contains german.dic');

	const { foldLetters, stripNonAtoZ } = await import('../src/lib/puzzle/model.ts');
	// german.dic is CRLF, and a leftover \r would fail the A–Z check below on every line.
	const words = [
		...new Set(
			readFileSync(dic, 'latin1')
				.split(/\r?\n/)
				.map(foldLetters)
				.filter((w) => {
					if (w.length < 4) return false;
					if (w === stripNonAtoZ(w)) return true;
					console.warn(`skipped "${w}": letters outside A–Z`);
					return false;
				})
		)
	].sort();
	const body = words.join('\n') + '\n';
	const gz = gzipSync(body, { level: 9 });
	writeFileSync(out, gz);
	console.log(
		`german.dic: ${words.length} words → static/dictionary.txt.gz (${body.length} B raw, ${gz.length} B gz)`
	);
} finally {
	rmSync(dir, { recursive: true, force: true });
}
