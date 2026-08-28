<script lang="ts">
	import { onMount } from 'svelte';
	import AudienceToggle from '$lib/components/AudienceToggle.svelte';
	import { getLenis } from '$lib/motion/smoothScroll';

	let scrolled = $state(false);
	let menuOpen = $state(false);

	const links = [
		{ href: '#unlock', label: 'Benefits' },
		{ href: '#how', label: 'How it works' },
		{ href: '#faq', label: 'FAQ' }
	];

	function nav(e: MouseEvent, href: string) {
		const target = document.querySelector(href);
		if (!target) return;
		e.preventDefault();
		menuOpen = false;
		const lenis = getLenis();
		if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -80 });
		else target.scrollIntoView({ behavior: 'smooth' });
	}

	// Lock background scroll while the mobile sheet is open.
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	onMount(() => {
		let ticking = false;
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				scrolled = window.scrollY > 40;
				ticking = false;
			});
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') menuOpen = false;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('keydown', onKey);
		onScroll();
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<header class="nav" class:scrolled={scrolled || menuOpen}>
	<a class="brand" href="#top" onclick={(e) => nav(e, '#top')}>PDM</a>

	<nav class="links" aria-label="Primary">
		{#each links as link (link.href)}
			<a href={link.href} onclick={(e) => nav(e, link.href)}>{link.label}</a>
		{/each}
	</nav>

	<div class="right">
		<!-- Role selection lives in the hero, not here: a second gold pill beside the
		     waitlist CTA split the nav's single accent between two competing controls. -->
		<a class="cta" href="#waitlist" onclick={(e) => nav(e, '#waitlist')}>Join the waitlist</a>
		<button
			class="burger"
			class:open={menuOpen}
			aria-label={menuOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={menuOpen}
			aria-controls="mobile-sheet"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span></span><span></span><span></span>
		</button>
	</div>
</header>

{#if menuOpen}
	<div id="mobile-sheet" class="sheet">
		<nav class="sheet-links" aria-label="Mobile">
			{#each links as link, i (link.href)}
				<a href={link.href} style="--i:{i}" onclick={(e) => nav(e, link.href)}>
					<span>{link.label}</span>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						aria-hidden="true"
						><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" /></svg
					>
				</a>
			{/each}
		</nav>

		<div class="sheet-footer">
			<AudienceToggle />
			<a class="cta sheet-cta" href="#waitlist" onclick={(e) => nav(e, '#waitlist')}
				>Join the waitlist</a
			>
		</div>
	</div>
{/if}

<style lang="scss">
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-nav);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 1rem clamp(1rem, 4vw, 2.5rem);
		transition:
			background var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out);
		border-bottom: 1px solid transparent;
		&.scrolled {
			background: rgba(10, 10, 11, 0.7);
			backdrop-filter: blur(12px);
			border-bottom-color: var(--line);
		}
	}
	.brand {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.5rem;
		letter-spacing: 1px;
		color: var(--gold);
	}
	.links {
		display: flex;
		gap: 1.75rem;
		a {
			color: var(--text-muted);
			font-size: 0.95rem;
			transition: color var(--dur-base) var(--ease-out);
			&:hover {
				color: var(--text);
			}
		}
	}
	.right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.cta {
		background: var(--gold);
		color: #1a1a1a;
		font-weight: 700;
		font-size: 0.9rem;
		padding: 0.6rem 1.1rem;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		transition: filter var(--dur-base) var(--ease-out);
		&:hover {
			filter: brightness(1.07);
		}
	}
	.burger {
		display: none;
		flex-direction: column;
		gap: 5px;
		width: 44px;
		height: 44px;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 0;
		cursor: pointer;
		span {
			width: 22px;
			height: 2px;
			background: var(--text);
			border-radius: 2px;
			transition:
				transform var(--dur-base) var(--ease-out),
				opacity var(--dur-micro) var(--ease-out);
		}
		/* Morph the three bars into an X when open. */
		&.open span:nth-child(1) {
			transform: translateY(7px) rotate(45deg);
		}
		&.open span:nth-child(2) {
			opacity: 0;
		}
		&.open span:nth-child(3) {
			transform: translateY(-7px) rotate(-45deg);
		}
	}

	/* ── Mobile sheet ── */
	.sheet {
		position: fixed;
		inset: 0;
		/* Sit just under the nav bar so the brand + close (X) stay tappable on top. */
		z-index: calc(var(--z-nav) - 1);
		background: rgba(10, 10, 11, 0.98);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		display: flex;
		flex-direction: column;
		padding: calc(72px + env(safe-area-inset-top)) clamp(1.5rem, 6vw, 2.5rem)
			calc(2rem + env(safe-area-inset-bottom));
		animation: sheet-in var(--dur-base) var(--ease-out);
	}
	@keyframes sheet-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
	}
	.sheet-links {
		display: flex;
		flex-direction: column;
		a {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 1rem;
			padding: 1.15rem 0.25rem;
			border-bottom: 1px solid var(--line);
			color: var(--text);
			font-family: var(--font-display);
			font-style: italic;
			font-size: clamp(1.7rem, 7vw, 2.1rem);
			line-height: 1;
			animation: link-in var(--dur-base) var(--ease-out) backwards;
			animation-delay: calc(60ms + var(--i) * 55ms);
			svg {
				width: 22px;
				height: 22px;
				color: var(--text-muted);
				transition:
					transform var(--dur-base) var(--ease-out),
					color var(--dur-base) var(--ease-out);
			}
			&:active svg {
				transform: translateX(4px);
				color: var(--gold);
			}
		}
	}
	@keyframes link-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}
	.sheet-footer {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 1.25rem;
		padding-top: 2rem;
	}
	.sheet-footer :global(.toggle) {
		align-self: center;
	}
	.sheet-cta {
		width: 100%;
		justify-content: center;
		min-height: 54px;
		font-size: 1.05rem;
		padding: 0 1.5rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.sheet,
		.sheet-links a {
			animation: none;
		}
	}
	@media (max-width: 768px) {
		.links {
			display: none;
		}
		.nav > .right > .cta {
			display: none;
		}
		.burger {
			display: flex;
		}
	}
</style>
