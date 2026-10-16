import { describe, expect, it } from 'vitest';
import { prerender } from './+layout';

describe('static export', () => {
	it('prerenders every route so GitHub Pages can serve the build', () => {
		expect(prerender).toBe(true);
	});
});
