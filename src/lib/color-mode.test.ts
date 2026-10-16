import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COLOR_MODES, STORAGE_KEY, normalizeMode } from './color-mode.js';

describe('normalizeMode', () => {
	it('passes valid values through', () => {
		expect(normalizeMode('light')).toBe('light');
		expect(normalizeMode('dark')).toBe('dark');
	});

	it('maps everything else to auto', () => {
		expect(normalizeMode('auto')).toBe('auto');
		expect(normalizeMode(null)).toBe('auto');
		expect(normalizeMode('banana')).toBe('auto');
		expect(normalizeMode('')).toBe('auto');
	});
});

describe('app.html parity', () => {
	const appHtml = readFileSync(new URL('../app.html', import.meta.url), 'utf8');

	it('contains the inline script with the same key and values', () => {
		expect(appHtml).toContain(`localStorage.getItem('${STORAGE_KEY}')`);
		for (const mode of COLOR_MODES.filter((m) => m !== 'auto')) {
			expect(appHtml).toContain(`'${mode}'`);
		}
	});

	it('sets the default attributes on <html>', () => {
		expect(appHtml).toMatch(/<html[^>]*data-color-mode="auto"/);
	});
});
