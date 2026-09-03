<script lang="ts">
    import { onMount } from 'svelte'
	import { gsap } from "gsap";
	import { ScrollTrigger } from "gsap/ScrollTrigger";
	import { ScrollSmoother } from "gsap/ScrollSmoother";
	import { Canvas } from '@threlte/core'
	import { Studio } from '@threlte/studio'

	import { scroll } from './shared.svelte';
	import Scene from './Scene.svelte';
    import Button from './lib/Button.svelte'
    import Header from './lib/Header.svelte'
    import PinnedArrow from './lib/PinnedArrow.svelte'

	let hero: HTMLDivElement
	let loveSpace: HTMLDivElement

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger,ScrollSmoother)
		scroll.smoother = ScrollSmoother.create({
			wrapper: '#smooth-wrapper',
			content: "#smooth-content",
			onUpdate: function(self) {
				scroll.scrollTop = self.scrollTop()
			}
		});
	})
	// scrollTop.scroll = 1500
</script>

<div class="fixed top-0 right-0 left-0 h-screen w-screen -z-10">
	<Canvas>
	<!-- {#if import.meta.env.MODE === 'development'}
		{#await import('@threlte/studio') then { Studio }}
		<Studio>
			<Scene />
		</Studio>
		{/await}
	{:else}
		<Scene />
	{/if} -->
		<Scene />
	</Canvas>
</div>
<Header />
<PinnedArrow to="{loveSpace}" tm_trigger={hero} />
<div id="smooth-wrapper">
	<div id="smooth-content">
		<div bind:this={hero} class="flex flex-col justify-center items-center pl-0 h-svh w-full md:items-start md:pl-[10svw]">
			<h1 class="pl-5 text-[clamp(6rem,20svw,12rem)] leading-[clamp(6rem,20svw,12rem)]">
				<span class="block">Nora</span>
				<span class="block pl-8">de Fitero</span>
			</h1>
			<h3 class="pb-4 text-7xl font-light">Systems Developer</h3>
		</div>
		<div bind:this={loveSpace} class="mt-145 flex flex-col justify-center items-center pr-0 h-svh w-full md:items-end md:pr-[10svw]">
			<h2 class="text-6xl">I love space</h2>
			<Button>Explore cloud of devotions</Button>
		</div>
		<div class="mt-145 flex flex-col justify-center items-center pr-0 h-svh w-full">
			<h2 class="text-6xl">Portfolio</h2>
			<Button>Explore cloud of devotions</Button>
		</div>
	</div>
</div>