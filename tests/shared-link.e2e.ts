import { expect, test } from '@playwright/test';
import { encodePuzzle } from '../src/lib/puzzle/codec.js';
import { validPuzzle } from '../src/lib/puzzle/fixtures.js';

declare global {
	interface Window {
		releaseDecrypt: () => void;
	}
}

const url = 'http://localhost:4173/Roter-Faden/';
const notFound = 'Kein Rätsel gefunden. Bitte einen geteilten Link öffnen.';
const broken = 'Das Rätsel konnte nicht geladen werden. Bitte den Link prüfen.';

test('renders no not-found message before the app hydrates', async ({ page }) => {
	await page.route('**/_app/**', (route) => route.abort());
	await page.goto(`${url}#${await encodePuzzle(validPuzzle())}`);
	await expect(page.getByText(notFound)).toHaveCount(0);
});

test('shows Lädt while a shared puzzle decodes', async ({ page }) => {
	await page.addInitScript(() => {
		let release!: () => void;
		const gate = new Promise<void>((resolve) => (release = resolve));
		const decrypt = crypto.subtle.decrypt.bind(crypto.subtle);
		crypto.subtle.decrypt = async (...args) => {
			await gate;
			return decrypt(...args);
		};
		window.releaseDecrypt = release;
	});
	await page.goto(`${url}#${await encodePuzzle(validPuzzle())}`);
	await expect(page.getByText('Lädt …')).toBeVisible();
	await expect(page.getByText(notFound)).toHaveCount(0);
	await page.evaluate(() => window.releaseDecrypt());
	await expect(page.getByText('Zeit, die alles heilt')).toBeVisible();
});

test('shows the broken-link message for a corrupt hash', async ({ page }) => {
	await page.goto(`${url}#nonsense`);
	await expect(page.getByText(broken)).toBeVisible();
	await expect(page.getByText(notFound)).toHaveCount(0);
});

test('shows the puzzle for a valid link', async ({ page }) => {
	await page.goto(`${url}#${await encodePuzzle(validPuzzle())}`);
	await expect(page.getByText('Zeit, die alles heilt')).toBeVisible();
	await expect(page.getByText(notFound)).toHaveCount(0);
	await expect(page.getByText(broken)).toHaveCount(0);
});

test('shows not-found for an empty hash', async ({ page }) => {
	await page.goto(url);
	await expect(page.getByText(notFound)).toBeVisible();
});
