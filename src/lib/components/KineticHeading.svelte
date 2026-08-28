<script lang="ts">
	import { reveal } from '$lib/actions/reveal';
	let {
		lines = [] as string[],
		/** Index of the first line painted in the accent colour. -1 paints none. */
		accentFrom = -1
	}: { lines?: string[]; accentFrom?: number } = $props();
</script>

<h1 class="kinetic">
	{#each lines as line, li (li)}
		<span class="line" class:accent={accentFrom >= 0 && li >= accentFrom}>
			{#each line.split(' ') as word, wi (wi)}
				<span class="word-wrap"
					><span class="word" use:reveal={{ delay: (li * 3 + wi) * 60, y: 30 }}>{word}</span></span
				>
			{/each}
		</span>
	{/each}
</h1>

<style lang="scss">
	.kinetic {
		font-style: italic;
		font-weight: 600;
		font-size: clamp(2.5rem, 7vw, 5.5rem);
	}
	.line {
		display: block;
	}
	.word-wrap {
		display: inline-block;
		overflow: hidden;
		padding: 0 0.12em 0.08em 0;
	}
	.word {
		display: inline-block;
	}
</style>
