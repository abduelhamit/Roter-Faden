import { expect, test } from '@playwright/test';

const url = 'http://localhost:4173/Roter-Faden/';

test('switches the color mode and keeps it after reload', async ({ page }) => {
	await page.goto(url);
	const html = page.locator('html');
	await expect(html).toHaveAttribute('data-color-mode', 'auto');

	await page.getByText('Dunkel', { exact: true }).click();
	await expect(html).toHaveAttribute('data-color-mode', 'dark');
	await expect(page.getByRole('radio', { name: 'Dunkel' })).toBeChecked();
	// The selected label matches the canvas; the others stay transparent.
	const canvasBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
	await expect(page.getByText('Dunkel', { exact: true })).toHaveCSS('background-color', canvasBg);
	await expect(page.getByText('System', { exact: true })).toHaveCSS(
		'background-color',
		'rgba(0, 0, 0, 0)'
	);

	await page.reload();
	await expect(html).toHaveAttribute('data-color-mode', 'dark');

	await page.getByText('Hell', { exact: true }).click();
	await expect(html).toHaveAttribute('data-color-mode', 'light');
});

test('switch highlight is correct before hydration', async ({ page }) => {
	// Block the hydration chunks but keep the stylesheet and the inline no-flash script.
	await page.route('**/*.js', (route) => route.abort());
	await page.addInitScript(() => localStorage.setItem('color-mode', 'dark'));
	await page.goto(url);
	await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'dark');
	const canvasBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
	await expect(page.getByText('Dunkel', { exact: true })).toHaveCSS('background-color', canvasBg);
});

test('system mode follows the operating system live', async ({ page }) => {
	await page.goto(url);
	await page.getByText('System', { exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'auto');

	const canvasBg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

	const lightBg = await canvasBg();
	await page.emulateMedia({ colorScheme: 'dark' });
	await expect.poll(canvasBg).not.toBe(lightBg);
	await page.emulateMedia({ colorScheme: 'light' });
	await expect.poll(canvasBg).toBe(lightBg);
});
