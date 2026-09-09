<script lang="ts">
    import { onMount } from 'svelte'
	import { gsap } from "gsap"
	import { ScrollTrigger } from "gsap/ScrollTrigger"
	import { ScrollSmoother } from "gsap/ScrollSmoother"
	import { Canvas } from '@threlte/core'
	// import { Studio as ThrelteStudio } from '@threlte/studio'
	import { Project, Sequence, Sheet } from '@threlte/theatre'

	import { scroll } from '$lib/shared.svelte'
    import Header from '$lib/Header.svelte'
    import PinnedArrow from '$components/PinnedArrow.svelte'
    import Button from '$components/Button.svelte'
	import Scene from '$lib/Scene.svelte'
	import stateJson from '$lib/sequence.json'
    import Projects from '$lib/Projects.svelte'

	let hero = $state<HTMLDivElement>()
	let loveSpace = $state<HTMLDivElement>()
	let projects = $state<HTMLDivElement>()

	let position = $state(0)

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger,ScrollSmoother)
		scroll.smoother = ScrollSmoother.create({
			wrapper: '#smooth-wrapper',
			content: "#smooth-content",
			onUpdate: function(self) {
				scroll.scrollTop = self.scrollTop()
				position = scroll.scrollTop * 0.001
			}
		})
	})
</script>

<div class="fixed top-0 right-0 left-0 h-screen w-screen -z-100">
	{#if import.meta.env.MODE === 'development'}
		{#await import('@threlte/theatre') then { Studio }}
		<Studio />
		{/await}
	{/if}
	<Canvas>
		<!-- <ThrelteStudio> -->
			<Project config={{ state: stateJson }}>
				<Sheet>
					<Scene />
					<Sequence bind:position />
				</Sheet>
			</Project>
		<!-- </ThrelteStudio> -->
	</Canvas>
</div>
<Header projects={projects} about_me={projects} contact={projects} />
<PinnedArrow to={projects} tm_trigger={hero} />
<div id="smooth-wrapper">
	<div id="smooth-content">
		<div bind:this={hero} class="flex flex-col justify-center items-center pl-0 h-svh w-full md:items-start md:pl-[10svw]">
			<h1 class="pl-5 text-[clamp(6rem,20svw,12rem)] leading-[clamp(6rem,20svw,12rem)]">
				<span class="block">Nora</span>
				<span class="block pl-8">de Fitero</span>
			</h1>
			<h3 class="pb-4 text-7xl font-light">Systems Developer</h3>
		</div>
		<div class="mt-145"></div>
		<Projects />
		<div class="mt-300"></div>
		<div bind:this={loveSpace} class="mt-145 flex flex-col justify-center items-center pr-0 h-svh w-full md:items-end md:pr-[10svw]">
			<h2 class="text-6xl">I love space</h2>
			<Button>Explore cloud of devotions</Button>
		</div>
	</div>
</div>