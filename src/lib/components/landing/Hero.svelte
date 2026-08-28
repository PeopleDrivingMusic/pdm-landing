<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import KineticHeading from '$lib/components/KineticHeading.svelte';
	import AmbientParticles from '$lib/components/AmbientParticles.svelte';
	import { audience } from '$lib/stores/audience.svelte';
	import { hero, audienceSwitch } from '$lib/content';
	import { prefersReducedMotion } from '$lib/motion/prefersReducedMotion';
	import { getLenis } from '$lib/motion/smoothScroll';
	import { runAfterInitialPaint } from '$lib/motion/defer';

	let root: HTMLElement;
	let bg: HTMLDivElement;

	// Backdrop reel, cut like a title sequence: each shot changes scale AND
	// brightness from the one before it, so the loop never reads as "more crowd".
	// Footage: Pexels and Mixkit (both licensed for commercial use, no attribution
	// required), trimmed to 6s at 720p — the whole reel is 6.3MB, and only the
	// first clip is fetched on load.
	const clips = [
		{ src: '/video/crowd.mp4', poster: '/video/crowd.jpg' }, // close, dark: the crowd, slow motion
		{ src: '/video/shoulders.mp4', poster: '/video/shoulders.jpg' }, // wide, bright: on shoulders
		{ src: '/video/singer.mp4', poster: '/video/singer.jpg' }, // stage: the artist, mid-song
		{ src: '/video/phones.mp4', poster: '/video/phones.jpg' }, // wide, dark: arena of phone lights
		{ src: '/video/cheering.mp4', poster: '/video/cheering.jpg' }, // close, bright: faces cheering
		{ src: '/video/confetti.mp4', poster: '/video/confetti.jpg' } // burst: confetti over the stage
	];
	// Crossfade length, and how far from the end of a clip the handoff starts.
	// The lead has to exceed the fade so the outgoing clip is still moving for the
	// whole dissolve; `timeupdate` only fires about four times a second, so the
	// extra 250ms absorbs that jitter.
	const FADE_MS = 800;
	const HANDOFF_LEAD = FADE_MS / 1000 + 0.45;

	let current = $state(0);
	// Video is opt-in, decided after the first paint: the poster carries the LCP,
	// and reduced-motion / Save-Data visitors never pay for the download at all.
	let playing = $state(false);
	// Set once the first clip is actually rolling, which is when the poster can
	// step aside — left underneath, it bleeds through mid-crossfade when both
	// clips sit at partial opacity.
	let rolling = $state(false);
	// Only mounted clips get a `src`, so we fetch the current one plus the next
	// instead of pulling all six (~6MB) up front. The next one is always mounted
	// a whole clip ahead: it has to be buffered before the crossfade starts, or
	// it arrives on the screen still sitting on its first frame.
	let mounted = $state(new Set<number>([0, 1]));
	let els = $state<(HTMLVideoElement | undefined)[]>([]);
	let handingOff = false;
	let parkTimer: ReturnType<typeof setTimeout> | undefined;

	function videoAllowed() {
		if (prefersReducedMotion()) return false;
		const conn = (
			navigator as Navigator & {
				connection?: { saveData?: boolean; effectiveType?: string };
			}
		).connection;
		if (conn?.saveData) return false;
		if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false;
		return true;
	}

	// Hand the frame to the next clip. The incoming clip is started *before* the
	// opacity flip, and the outgoing one keeps playing underneath until the fade
	// is over, so the dissolve happens between two moving images. Advancing on
	// `ended` instead would freeze the last frame for the length of the fade.
	/** Resolve once the element can actually render frames, or bail after `ms`. */
	function whenPlayable(v: HTMLVideoElement, ms = 1000) {
		if (v.readyState >= 3) return Promise.resolve();
		return new Promise<void>((resolve) => {
			const done = () => {
				v.removeEventListener('canplay', done);
				clearTimeout(timer);
				resolve();
			};
			const timer = setTimeout(done, ms);
			v.addEventListener('canplay', done);
		});
	}

	async function handoff(from: number) {
		if (handingOff || from !== current) return;
		handingOff = true;
		if (parkTimer) clearTimeout(parkTimer);

		const next = (from + 1) % clips.length;
		const incoming = els[next];

		// Get the incoming clip genuinely rolling before anything fades. Flipping
		// first would dissolve into a still frame, which is the whole bug this
		// ordering exists to avoid.
		if (incoming) {
			await whenPlayable(incoming);
			incoming.currentTime = 0;
			await incoming.play().catch(() => {});
		}

		current = next;
		// Warm the clip after this one so the next handoff has the same head start.
		mounted = new Set(mounted).add((next + 1) % clips.length);

		// The outgoing clip keeps playing underneath for the length of the fade.
		parkTimer = setTimeout(() => {
			const outgoing = els[from];
			if (outgoing && from !== current) {
				outgoing.pause();
				outgoing.currentTime = 0;
			}
			handingOff = false;
		}, FADE_MS);
	}

	function onTimeupdate(i: number) {
		if (i !== current || handingOff) return;
		const v = els[i];
		if (!v || !Number.isFinite(v.duration)) return;
		if (v.duration - v.currentTime <= HANDOFF_LEAD) handoff(i);
	}

	// Start the reel once; every transition after that is driven by handoff().
	let kickedOff = false;
	$effect(() => {
		if (!playing || kickedOff) return;
		const first = els[current];
		if (!first) return;
		kickedOff = true;
		first
			.play()
			.then(() => {
				rolling = true;
			})
			.catch(() => {
				kickedOff = false;
			});
	});

	function scrollTo(e: MouseEvent, href: string) {
		const target = document.querySelector(href);
		if (!target) return;
		e.preventDefault();
		const lenis = getLenis();
		if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -80 });
		else target.scrollIntoView({ behavior: 'smooth' });
	}

	onMount(() => {
		let disposed = false;
		let cleanup = () => {};

		const cancel = runAfterInitialPaint(async () => {
			const reduce = prefersReducedMotion();
			const desktop = window.matchMedia('(min-width: 769px)').matches;
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);

			if (disposed) return;

			gsap.registerPlugin(ScrollTrigger);
			playing = videoAllowed();

			const ctx = gsap.context(() => {
				// Entrance choreography: the promise, then the way in. The headline
				// runs itself via the `reveal` action (word-by-word clip).
				if (!reduce) {
					const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
					tl.from('.sub', { y: 20, autoAlpha: 0 }, 0.45).from(
						'.cta-btn',
						{ y: 22, autoAlpha: 0, stagger: 0.09 },
						0.6
					);
				}

				// Backdrop drifts slower than the page, so the crowd keeps its depth
				// as the copy scrolls off it.
				if (!reduce && desktop) {
					gsap.to(bg, {
						yPercent: 18,
						ease: 'none',
						scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true }
					});
				}
			}, root);

			// Clips advance on `ended` rather than on a timer, so a cut never lands
			// mid-shot and a stalled download just holds the frame it is on.

			cleanup = () => {
				if (parkTimer) clearTimeout(parkTimer);
				for (const v of els) v?.pause();
				ctx.revert();
			};
		});

		return () => {
			disposed = true;
			cancel();
			cleanup();
		};
	});
</script>

<section id="top" class="hero" bind:this={root}>
	<div class="bg" class:rolling bind:this={bg} aria-hidden="true">
		<!-- Always painted: carries the LCP and is the whole backdrop for anyone who
		     never gets video (reduced motion, Save-Data, decode failure). -->
		<img class="poster" src={clips[0].poster} alt="" fetchpriority="high" />
		{#if playing}
			{#each clips as clip, i (clip.src)}
				<video
					class="clip"
					class:active={i === current}
					bind:this={els[i]}
					src={mounted.has(i) ? clip.src : undefined}
					poster={clip.poster}
					preload={mounted.has(i) ? 'auto' : 'none'}
					muted
					playsinline
					ontimeupdate={() => onTimeupdate(i)}
					onended={() => handoff(i)}
				></video>
			{/each}
		{/if}
	</div>
	<div class="overlay"></div>
	<div class="grain" aria-hidden="true"></div>
	<div class="particles" aria-hidden="true">
		<AmbientParticles variant="fill" count={9} intensity={1.05} />
	</div>

	<!-- Title card, anchored to the bottom of the frame so the photograph keeps
	     its subject and the copy reads as a caption on it, not a box over it. -->
	<div class="content">
		{#key audience.value}
			<div class="swap" in:fade={{ duration: 320 }}>
				<KineticHeading lines={hero[audience.value].heading} accentFrom={1} />
				<p class="sub">{hero[audience.value].sub}</p>
			</div>
		{/key}

		<div class="ctas">
			<a class="cta-btn primary" href="#waitlist" onclick={(e) => scrollTo(e, '#waitlist')}>
				Join the waitlist
			</a>
			<a class="cta-btn ghost" href="#how" onclick={(e) => scrollTo(e, '#how')}>See how it works</a>
		</div>

		<!-- Role self-selection lives here rather than in the nav: it is a change of
		     perspective on this copy, not a destination. -->
		{#key audience.value}
			<button
				class="switch"
				type="button"
				onclick={() => audience.toggle()}
				in:fade={{ duration: 240 }}
			>
				<span class="switch-prompt">{audienceSwitch[audience.value].prompt}</span>
				<span class="switch-action">{audienceSwitch[audience.value].action}</span>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					aria-hidden="true"
					><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" /></svg
				>
			</button>
		{/key}
	</div>
</section>

<style lang="scss">
	.hero {
		/* Backdrop grade: kill the venue's hue, re-tint to brand gold. */
		--grade: grayscale(1) sepia(0.62) saturate(2.3) hue-rotate(-9deg) contrast(1.06)
			brightness(0.92);

		position: relative;
		min-height: 100dvh;
		display: grid;
		align-content: end;
		overflow: hidden;
		/* Top padding only has to clear the nav — the title card is bottom-anchored.
		   Keeping it small matters: if padding + content ever exceeds 100dvh the hero
		   grows past the fold and takes the CTAs with it. */
		padding: clamp(5.5rem, 10vh, 7.5rem) clamp(1.25rem, 5vw, 4rem) clamp(3rem, 7.5vh, 6rem);
	}

	/* ── Backdrop layers ─────────────────────────────── */
	.bg {
		position: absolute;
		inset: -10% 0 0;
		height: 120%;
		z-index: 0;
		will-change: transform;
	}
	.poster,
	.clip {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Stock concert footage arrives in whatever colour the venue's lighting rig
		   was running — cyan, magenta, green. Stripping the hue and re-tinting to
		   brand gold is what keeps one accent across every frame, and it is also
		   what stops the reel from reading as generic stock. */
		filter: var(--grade);
	}
	.clip {
		opacity: 0;
		/* Linear on both sides so the two clips sum evenly through the dissolve.
		   Must stay in step with FADE_MS in the script. */
		transition: opacity 800ms linear;
	}
	/* Once video is rolling the poster is redundant, and leaving it lit shows
	   through the middle of every crossfade. */
	.bg.rolling .poster {
		opacity: 0;
		transition: opacity 600ms linear;
	}
	.clip.active {
		opacity: 1;
	}

	/* Cinematic scrim: weighted to the bottom where the title card sits, light
	   enough at the top that the crowd stays the subject rather than wallpaper.
	   The first layer is a pool anchored under the copy — the backdrop rotates
	   through frames as bright as a confetti burst, and a global darkening heavy
	   enough for those would flatten every other frame. */
	.overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
		background:
			radial-gradient(78% 62% at 20% 90%, rgba(10, 10, 11, 0.58), transparent 74%),
			linear-gradient(
				180deg,
				transparent 26%,
				rgba(10, 10, 11, 0.5) 58%,
				rgba(10, 10, 11, 0.9) 86%,
				var(--bg) 100%
			),
			linear-gradient(
				100deg,
				rgba(10, 10, 11, 0.62) 0%,
				rgba(10, 10, 11, 0.18) 46%,
				transparent 74%
			),
			radial-gradient(125% 95% at 50% 42%, transparent 52%, rgba(10, 10, 11, 0.34) 100%);
	}
	.particles {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
	}
	.grain {
		position: absolute;
		inset: 0;
		z-index: 2;
		opacity: 0.05;
		pointer-events: none;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}

	/* ── Content ─────────────────────────────────────── */
	.content {
		position: relative;
		z-index: 3;
		max-width: var(--maxw);
		width: 100%;
		margin: 0 auto;
	}
	/* Bold grotesque headline in flat brand colour — the photograph carries the
	   richness, so the type stays a single confident weight. */
	.hero :global(.kinetic) {
		font-family: 'Sora', var(--font-sans);
		font-style: normal;
		font-weight: 800;
		/* Scaled against the shorter axis too: on a low window (or a 125% zoom, which
		   is the same thing in CSS pixels) a width-only clamp overruns the fold. */
		font-size: clamp(2.4rem, min(8vw, 13vh), 6.8rem);
		letter-spacing: -0.035em;
		line-height: 1;
		color: var(--text);
		text-wrap: balance;
	}
	/* Comfortable word gap (KineticHeading strips the space) plus descender
	   clearance — the clip-reveal box would otherwise cut the g in "belonging".
	   The negative margin pulls the lines back to a display-tight rhythm without
	   shrinking that box, so nothing gets cropped. */
	.hero :global(.kinetic .word-wrap) {
		padding: 0 0.26em 0.16em 0;
		margin-bottom: -0.22em;
	}
	/* The payoff line carries the single accent colour on the page. */
	.hero :global(.kinetic .line.accent) {
		color: var(--gold);
	}

	.sub {
		/* Lifted above --text-muted: this paragraph sits on photography, not on a
		   flat surface, so the token's 0.62 alpha drops near 4.5:1 over lit frames. */
		color: rgba(244, 236, 224, 0.8);
		font-size: clamp(1.02rem, 1.6vw, 1.28rem);
		line-height: 1.55;
		max-width: 48ch;
		margin-top: 1.4rem;
	}

	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 2.4rem;
	}
	.cta-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 54px;
		padding: 0 1.7rem;
		border-radius: 999px;
		font-weight: 700;
		font-size: 1rem;
		transition:
			transform var(--dur-base) var(--ease-out),
			filter var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out),
			background var(--dur-base) var(--ease-out);
	}
	.primary {
		background: linear-gradient(135deg, #ffe6a0 0%, var(--gold) 45%, var(--gold-deep) 100%);
		color: #1a1a1a;
		box-shadow: 0 14px 44px -14px var(--glow);
		&:hover {
			transform: translateY(-2px);
			filter: brightness(1.05);
		}
		&:active {
			transform: translateY(0);
		}
	}
	.ghost {
		border: 1px solid var(--line);
		color: var(--text);
		font-weight: 500;
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(10px);
		&:hover {
			transform: translateY(-2px);
			border-color: var(--gold);
			background: rgba(255, 216, 119, 0.08);
		}
		&:active {
			transform: translateY(0);
		}
	}

	/* Quiet by design: it must not compete with the waitlist CTA above it. */
	.switch {
		/* Block-level rather than inline-flex: as an inline box it sat on the CTA
		   row's baseline, which both ate into the gap and left it reading as a
		   caption hanging off the buttons instead of its own control. */
		display: flex;
		width: fit-content;
		align-items: center;
		gap: 0.5rem;
		/* Its own hit area, pulled back by the same amount so the label still
		   lines up with the left edge of the buttons above. */
		margin: 2.5rem 0 0 -0.75rem;
		padding: 0.5rem 0.75rem;
		border: 0;
		border-radius: 999px;
		background: none;
		cursor: pointer;
		font-family: var(--font-sans);
		font-size: 0.95rem;
		color: rgba(244, 236, 224, 0.7);
		transition: background var(--dur-base) var(--ease-out);

		svg {
			width: 16px;
			height: 16px;
			transition:
				transform var(--dur-base) var(--ease-out),
				color var(--dur-base) var(--ease-out);
		}

		&:hover,
		&:focus-visible {
			background: rgba(255, 255, 255, 0.05);

			.switch-action {
				color: var(--gold);
				text-decoration-color: var(--gold);
			}
			svg {
				transform: translateX(3px);
				color: var(--gold);
			}
		}

		&:focus-visible {
			outline: 2px solid var(--gold);
			outline-offset: 2px;
		}
	}
	.switch-action {
		color: var(--text);
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: rgba(244, 236, 224, 0.3);
		text-underline-offset: 4px;
		transition:
			color var(--dur-base) var(--ease-out),
			text-decoration-color var(--dur-base) var(--ease-out);
	}

	@media (max-width: 768px) {
		.ctas {
			gap: 0.75rem;
		}
		.cta-btn {
			flex: 1 1 100%;
		}
		.switch {
			/* The CTAs go full-width here, so a left-hugging link underneath reads as
			   detached from them. Centred, it belongs to the stack. */
			margin: 1.75rem auto 0;
			font-size: 0.9rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.switch svg {
			transition: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cta-btn {
			transition: none;
		}
	}
</style>
