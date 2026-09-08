<script lang="ts">
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import { ScrollTrigger } from "gsap/all";

	import Button from "$lib/Button.svelte";
    import Project from "$lib/Project.svelte"

	let { section } = $props()

	let arrowElement: HTMLButtonElement;

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: section,
				start: "top topi",
				end: "+=100%",
				pin: true,
				scrub: 1
			}
		})
	})
</script>

<div bind:this={section} class="flex flex-col justify-center items-center pr-0 h-svh w-full">
	<h2 class="text-6xl">Projects</h2>
	<Button>Explore cloud of devotions</Button>
	<Project />
</div>