import { expect, test } from '@playwright/test';
import { encodePuzzle } from '../src/lib/puzzle/codec.js';
import { validPuzzle } from '../src/lib/puzzle/fixtures.js';

const url = 'http://localhost:4173/Roter-Faden/';

test('selects letters by dragging and by tapping', async ({ page }) => {
	await page.goto(`${url}#${await encodePuzzle(validPuzzle())}`);
	await expect(page.getByText('Zeit, die alles heilt')).toBeVisible();

	const center = async (i: number) => {
		const box = await page.locator(`[data-cell="${i}"]`).boundingBox();
		expect(box).not.toBeNull();
		return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
	};
	const letters = page.getByTestId('selected-letters');

	// Drag along the first row (0–5 spells BESSER); releasing submits and clears.
	const start = await center(0);
	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	for (let i = 1; i <= 5; i++) {
		const point = await center(i);
		await page.mouse.move(point.x, point.y, { steps: 4 });
		await expect(letters).toHaveText('BESSER'.slice(0, i + 1));
	}
	await page.mouse.up();
	await expect(letters).toHaveText('');

	// Tap cells 6 and 7 to build a selection, tap 6 again to cut back to it.
	const cell6 = await center(6);
	await page.mouse.click(cell6.x, cell6.y);
	const cell7 = await center(7);
	await page.mouse.click(cell7.x, cell7.y);
	await expect(letters).toHaveText('DI');
	// Two cells: a real line, plus one dot per cell.
	await expect(page.locator('svg polyline')).toHaveCount(1);
	await expect(page.locator('svg circle')).toHaveCount(2);
	await page.mouse.click(cell6.x, cell6.y);
	await expect(letters).toHaveText('D');
	// One cell: only a dot. A zero-length polyline would be drawn as an oversized
	// stroke on iOS Safari (see GameBoard.svelte).
	await expect(page.locator('svg polyline')).toHaveCount(0);
	await expect(page.locator('svg circle')).toHaveCount(1);

	// Tapping outside the board clears the selection.
	await page.getByText('Zeit, die alles heilt').click();
	await expect(letters).toHaveText('');
});
