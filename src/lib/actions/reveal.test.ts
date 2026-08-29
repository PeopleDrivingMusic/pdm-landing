import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reveal } from './reveal';

/** An IntersectionObserver that records observation but never reports anything,
 *  standing in for the environments where the callback does not arrive. */
class SilentObserver {
	static instances: SilentObserver[] = [];
	observed: Element[] = [];
	constructor(public cb: IntersectionObserverCallback) {
		SilentObserver.instances.push(this);
	}
	observe(el: Element) {
		this.observed.push(el);
	}
	unobserve() {}
	disconnect() {}
	fire(isIntersecting: boolean) {
		this.cb(
			this.observed.map((target) => ({ target, isIntersecting })) as IntersectionObserverEntry[],
			this as unknown as IntersectionObserver
		);
	}
}

function mountNode() {
	const node = document.createElement('span');
	document.body.appendChild(node);
	return node;
}

beforeEach(() => {
	vi.useFakeTimers();
	SilentObserver.instances = [];
	window.matchMedia = vi.fn().mockReturnValue({
		matches: false,
		addEventListener: () => {},
		removeEventListener: () => {}
	}) as unknown as typeof window.matchMedia;
	(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
		SilentObserver;
});

afterEach(() => {
	vi.useRealTimers();
	document.body.innerHTML = '';
});

describe('reveal', () => {
	it('hides the node up front so it can animate in', () => {
		const node = mountNode();
		reveal(node, undefined);
		expect(node.style.opacity).toBe('0');
	});

	it('shows the node when the observer reports it visible', () => {
		const node = mountNode();
		reveal(node, undefined);
		SilentObserver.instances[0].fire(true);
		expect(node.style.opacity).toBe('1');
	});

	// The bug this guards: hero copy stayed invisible on some mobile browsers.
	// Whatever stops the observer firing, text that never appears is never
	// acceptable — visibility must not hinge on a single browser API.
	it('shows the node anyway if the observer never reports', () => {
		const node = mountNode();
		reveal(node, undefined);
		expect(node.style.opacity).toBe('0');

		vi.advanceTimersByTime(3000);

		expect(node.style.opacity).toBe('1');
	});

	it('does not fight the observer once it has already shown the node', () => {
		const node = mountNode();
		reveal(node, { delay: 0, y: 30 });
		SilentObserver.instances[0].fire(true);
		vi.advanceTimersByTime(5000);
		expect(node.style.opacity).toBe('1');
	});

	it('skips the animation entirely under reduced motion', () => {
		window.matchMedia = vi.fn().mockReturnValue({
			matches: true,
			addEventListener: () => {},
			removeEventListener: () => {}
		}) as unknown as typeof window.matchMedia;
		const node = mountNode();
		reveal(node, undefined);
		expect(node.style.opacity).toBe('1');
	});
});
