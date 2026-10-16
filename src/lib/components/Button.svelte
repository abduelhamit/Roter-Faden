<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'default' | 'primary' | 'danger' | 'outline';
	type Size = 'small' | 'medium' | 'large';

	let {
		variant = 'default',
		size = 'medium',
		type = 'button',
		disabled = false,
		class: className = '',
		children,
		...rest
	}: {
		variant?: Variant;
		size?: Size;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		class?: string;
		children: Snippet;
	} & Omit<HTMLButtonAttributes, 'class' | 'type' | 'disabled'> = $props();

	const base =
		'inline-flex items-center justify-center gap-sm rounded-md border font-semibold transition-colors disabled:cursor-default disabled:border-border-default disabled:bg-btn-bg-disabled disabled:text-btn-fg-disabled';

	const variants: Record<Variant, string> = {
		default:
			'border-border-default bg-btn-bg text-btn-fg hover:bg-btn-bg-hover active:bg-btn-bg-active',
		primary:
			'border-btn-primary-border bg-btn-primary text-btn-primary-fg hover:bg-btn-primary-hover active:bg-btn-primary-active disabled:border-btn-primary-border disabled:bg-btn-primary-disabled',
		danger:
			'border-btn-danger-border bg-btn-danger text-btn-danger-fg hover:bg-btn-danger-hover hover:text-fg-on-emphasis active:bg-btn-danger-active active:text-fg-on-emphasis disabled:bg-btn-danger-disabled',
		outline:
			'border-border-default bg-btn-outline text-btn-outline-fg hover:border-btn-outline-border-hover hover:bg-btn-outline-hover hover:text-btn-outline-fg-hover active:border-btn-outline-border-active active:bg-btn-outline-active'
	};

	const sizes: Record<Size, string> = {
		small: 'h-(--control-small-size) px-(--control-small-paddingInline-normal) text-xs',
		medium: 'h-(--control-medium-size) px-(--control-medium-paddingInline-normal) text-sm',
		large: 'h-(--control-large-size) px-(--control-large-paddingInline-normal) text-base'
	};
</script>

<button {type} {disabled} {...rest} class="{base} {variants[variant]} {sizes[size]} {className}">
	{@render children()}
</button>
