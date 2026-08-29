import type { Action } from 'svelte/action';
import { prefersReducedMotion } from '$lib/motion/prefersReducedMotion';

interface RevealOptions {
	delay?: number; // ms
	y?: number; // px translateY start offset
	once?: boolean;
}

/** Fades + slides an element into view on scroll. Respects reduced motion
 *  (shows immediately, no transform). Uses transform/opacity only. */
export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, options) => {
	const { delay = 0, y = 24, once = true } = options ?? {};

	if (prefersReducedMotion()) {
		node.style.opacity = '1';
		return {};
	}

	// Duration of the reveal transition (mirrors --dur-slow) — used to know when
	// the entrance has finished so we can drop the compositing hints.
	const DURATION = 600;

	node.style.opacity = '0';
	node.style.transform = `translateY(${y}px)`;
	node.style.transition = `opacity var(--dur-slow) var(--ease-out) ${delay}ms, transform var(--dur-slow) var(--ease-out) ${delay}ms`;
	node.style.willChange = 'opacity, transform';

	let settleTimer: ReturnType<typeof setTimeout> | undefined;

	// Once the entrance finishes, drop the transform + will-change. A lingering
	// compositing layer makes -webkit-background-clip:text render blank on iOS
	// Safari — the gold headline (and any gradient/stroke text inside a revealed
	// element) vanishes at rest. Resetting to a plain, un-composited box lets
	// Safari paint the clipped text again. Driven by a timer rather than
	// `transitionend`, which never fires when the element is shown before its
	// first paint (in-viewport reveals) or when iOS drops the event.
	const settle = () => {
		node.style.transform = '';
		node.style.willChange = '';
	};

	// Fail-safe: content that never becomes visible is never an acceptable
	// outcome, so the reveal cannot hinge solely on the observer reporting back.
	// If nothing has shown the node by the time the entrance would long since
	// have finished, show it regardless.
	const FAILSAFE = delay + DURATION + 1200;
	let shown = false;

	const show = () => {
		shown = true;
		clearTimeout(failsafeTimer);
		node.style.opacity = '1';
		node.style.transform = 'translateY(0)';
		if (once) settleTimer = setTimeout(settle, delay + DURATION + 60);
	};
	const hide = () => {
		shown = false;
		if (settleTimer) clearTimeout(settleTimer);
		node.style.willChange = 'opacity, transform';
		node.style.opacity = '0';
		node.style.transform = `translateY(${y}px)`;
	};

	const failsafeTimer = setTimeout(() => {
		if (!shown) show();
	}, FAILSAFE);

	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					show();
					if (once) io.unobserve(node);
				} else if (!once) {
					hide();
				}
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
	);
	io.observe(node);

	return {
		destroy: () => {
			io.disconnect();
			if (settleTimer) clearTimeout(settleTimer);
			clearTimeout(failsafeTimer);
		}
	};
};
