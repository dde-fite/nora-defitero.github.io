<script lang="ts">
	import { onMount } from "svelte";
	import { gsap } from "gsap";
	import { ScrollTrigger } from "gsap/ScrollTrigger";

	import LargeArrow from "$assets/large_arrow.svelte";
	import { scroll } from "$lib/shared.svelte";

	interface Props {
		to: HTMLElement;
		tm_trigger: HTMLElement;
	}

	const { to, tm_trigger }: Props = $props()

	let arrowElement: HTMLButtonElement

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: tm_trigger,
				start: "top top",
				end: "+=100%",
				scrub: 1
			}
		})


		tl.to(arrowElement, {
			keyframes: [
				{
					y: "0svh",
					duration: 2,
					ease: "power2.out"
				},
				{
					y: "-20svh",
					duration: 4,
					ease: "power2.inOut"
				}
			]
		})
		.to(arrowElement, {
			rotation: 180,
			duration: 2.5,
			ease: "power2.inOut"
		})
		return (() => {
			tl.kill()
		})
	})

	const handleClick = () => {
		if (scroll.smoother) {
			if (scroll.scrollTop <= tm_trigger.offsetHeight) {
				gsap.to(scroll.smoother, {
					scrollTop: to.offsetTop,
					duration: 2,
					ease: "power2.inOut"
				});
			}
			else
			{
				gsap.to(scroll.smoother, {
					scrollTop: 0,
					duration: 2,
					ease: "power2.inOut"
				});
			}
		}
	}
</script>

<button
	bind:this={arrowElement}
	onclick={handleClick}
	class="fixed top-1/3 right-2 md:right-auto md:left-12 z-50 cursor-pointer"
	style="translate: 0 -33.3333%;"
>
	<LargeArrow />
</button>