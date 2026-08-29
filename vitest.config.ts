import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	resolve: {
		// SvelteKit provides $lib at build time; vitest runs outside that, so
		// modules importing through the alias are otherwise untestable.
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['src/lib/test-setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
