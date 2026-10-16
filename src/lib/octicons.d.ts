// @primer/octicons ships no type declarations (CJS module).
declare module '@primer/octicons' {
	interface Octicon {
		toSVG(options?: { height?: number; class?: string }): string;
	}
	const icons: Record<string, Octicon>;
	export default icons;
}
