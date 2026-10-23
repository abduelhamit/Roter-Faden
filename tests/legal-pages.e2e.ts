import { expect, test } from '@playwright/test';

const url = 'http://localhost:4173/Roter-Faden/';

// The site is served under the /Roter-Faden base path; the footer links must carry it too.
test('footer links reach the legal pages under the base path', async ({ page }) => {
	await page.goto(url);

	await page.getByRole('link', { name: 'Impressum' }).click();
	await expect(page).toHaveURL(`${url}impressum`);
	await expect(page.getByRole('heading', { level: 1, name: 'Impressum' })).toBeVisible();
	await expect(page.getByText('Angaben gemäß § 5 DDG')).toBeVisible();

	await page.getByRole('link', { name: 'Datenschutz' }).click();
	await expect(page).toHaveURL(`${url}datenschutz`);
	await expect(page.getByRole('heading', { level: 1, name: 'Datenschutzerklärung' })).toBeVisible();
});
