export const COLOR_MODES = ['light', 'dark', 'auto'] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const STORAGE_KEY = 'color-mode';

/** localStorage → attribute value. Anything invalid or missing becomes 'auto'. */
export function normalizeMode(raw: string | null): ColorMode {
	return raw === 'light' || raw === 'dark' ? raw : 'auto';
}
