import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tokens = readFileSync(new URL('./primer-tokens.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../../routes/layout.css', import.meta.url), 'utf8');

// The three selector blocks of the generated file, in source order.
const blocks = {
	light: tokens.slice(
		tokens.indexOf("[data-color-mode='light']"),
		tokens.indexOf("[data-color-mode='dark']")
	),
	dark: tokens.slice(
		tokens.indexOf("[data-color-mode='dark']"),
		tokens.indexOf('@media (prefers-color-scheme: dark)')
	),
	autoDark: tokens.slice(tokens.indexOf('@media (prefers-color-scheme: dark)'))
};
type Block = keyof typeof blocks;

/** The `--name: <hex>;` value inside one block, or a loud failure. */
function color(block: Block, name: string): string {
	const value = blocks[block].match(new RegExp(`${name}\\s*:\\s*(\\S+)\\s*;`))?.[1];
	if (!value || !/^#[0-9a-f]{6}$/i.test(value))
		throw new Error(`${name}: no hex color in ${block} block`);
	return value.toLowerCase();
}

/** The `--name: var(<var>);` value, or a loud failure. */
function layoutVar(name: string): string {
	const value = layout.match(new RegExp(`${name}\\s*:\\s*var\\s*\\(\\s*(\\S+)\\s*\\)\\s*;`))?.[1];
	if (!value || !/^[0-9a-z-]+$/i.test(value)) throw new Error(`${name}: no variable in layout`);
	return value;
}

/** Relative luminance of an sRGB hex color, per the IEC sRGB standard
 * (WCAG 2.x lists the pre-errata threshold 0.03928; identical results for 8-bit colors). */
function luminance(hex: string): number {
	const channel = (i: number) => {
		const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
		return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

const contrast = (a: string, b: string): number => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

describe('game line contrast (WCAG AA)', () => {
	it.each(['light', 'dark'] as Block[])(
		'%s: letters vs line ≥ 4.5:1 and line vs background ≥ 3:1',
		(block) => {
			const line = color(block, layoutVar('--color-game-line'));
			const letters = color(block, layoutVar('--color-fg-default'));
			const background = color(block, layoutVar('--color-canvas'));
			expect(contrast(letters, line), `${block}: letters vs line`).toBeGreaterThanOrEqual(4.5);
			expect(contrast(line, background), `${block}: line vs background`).toBeGreaterThanOrEqual(3);
		}
	);

	it('auto under a dark OS repeats the dark values verbatim', () => {
		for (const name of ['--color-game-line', '--color-fg-default', '--color-canvas'])
			expect(color('autoDark', layoutVar(name)), layoutVar(name)).toBe(
				color('dark', layoutVar(name))
			);
	});
});
