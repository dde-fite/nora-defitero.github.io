<script lang="ts">
	import { flip } from 'svelte/animate'
	import ButtonArrow from '$assets/button_arrow.svelte'

	let { children } = $props()

	let elements = $state(['text', 'arrow'])
</script>

<a
	href="#d"
	class="group flex items-center gap-3 mt-4 py-1 px-4 border-2 border-primary rounded-3xl hover:bg-primary transition-colors duration-700 ease-in-out"
	onmouseenter={() => elements = ['arrow', 'text']}
	onmouseleave={() => elements = ['text', 'arrow']}
>
	{#each elements as element (element)}
		<div animate:flip={{ duration: 500 }}>
			{#if element === 'text'}
				<span class="text-xl text-primary font-display font-light group-hover:text-black transition-colors duration-600 ease-in-out">
					{@render children()}
				</span>
			{:else}
				<div class="arrow h-2 stroke-primary group-hover:stroke-black transition-colors duration-600 ease-in-out">
					<ButtonArrow />
				</div>
			{/if}
		</div>
	{/each}
</a>