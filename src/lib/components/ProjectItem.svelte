<script lang="ts">
	import { onMount } from 'svelte'
	import { gsap } from 'gsap'
	import { ScrollTrigger } from 'gsap/ScrollTrigger'

	interface ProjectImage {
		src: string
		alt: string
	}

	interface Props {
		title: string
		description: string
		images: ProjectImage[]
	}

	let { title, description, images }: Props = $props()

	let groupElement: HTMLDivElement
	let backgroundElement: HTMLDivElement
	let titleElement: HTMLHeadingElement
	let descriptionElement: HTMLParagraphElement
	let imagesElement: HTMLUListElement

	// Animation tuning values.
	const PIN_DISTANCE = 150
	const BACKGROUND_EXPANSION = 48
	const HORIZONTAL_TRAVEL_PERCENT = 100
	const DESCRIPTION_OFFSET = 20

	const pinSection = () => {
		ScrollTrigger.create({
			trigger: groupElement,
			start: 'top top',
			end: `+=${PIN_DISTANCE}`,
			pin: true
		})
	}

	const animateTitle = () => {
		gsap.set(backgroundElement, { height: titleElement.offsetHeight })
		gsap.fromTo(
			titleElement,
			{ xPercent: HORIZONTAL_TRAVEL_PERCENT },
			{
				xPercent: -HORIZONTAL_TRAVEL_PERCENT,
				ease: 'none',
				scrollTrigger: { trigger: titleElement, start: 'top bottom', end: 'bottom top', scrub: true }
			}
		)
	}

	const animateDescription = () => {
		gsap.set(descriptionElement, { opacity: 0, y: -DESCRIPTION_OFFSET })
		const expandedHeight =
		titleElement.offsetHeight + descriptionElement.offsetHeight + BACKGROUND_EXPANSION
		gsap
		.timeline({
			scrollTrigger: { trigger: titleElement, start: 'top 45%', end: 'top 15%', scrub: true }
		})
		.to(backgroundElement, { height: expandedHeight, ease: 'none' }, 0)
		.to(descriptionElement, { opacity: 1, y: 0, ease: 'none' }, 0)
	}

	const animateImages = () => {
		gsap.fromTo(
			imagesElement,
			{ xPercent: -HORIZONTAL_TRAVEL_PERCENT },
			{
				xPercent: HORIZONTAL_TRAVEL_PERCENT,
				ease: 'none',
				scrollTrigger: { trigger: titleElement, start: 'top 90%', end: 'bottom -80%', scrub: true }
			}
		)
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger)
		const ctx = gsap.context(() => {
			pinSection()
			animateTitle()
			animateDescription()
			animateImages()
		})

		ScrollTrigger.refresh()
		return () => ctx.revert()
	})
</script>

<div
	bind:this={groupElement}
	class="flex flex-col items-center justify-center w-full h-svh overflow-hidden"
>
	<div
		bind:this={backgroundElement}
		class="flex flex-col items-center w-full bg-primary overflow-hidden"
	>
		<h3
			bind:this={titleElement}
			class="text-[110px] whitespace-nowrap font-display font-extralight text-black"
		>
			{title}
		</h3>
		<p
			bind:this={descriptionElement}
			class="w-180 max-w-[90vw] mt-6 text-black-secondary text-xl"
		>
			{description}
		</p>
	</div>
	<ul
		bind:this={imagesElement}
		class="flex gap-6 mt-10 list-none"
	>
		{#each images as image (image.src)}
			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<enhanced:img
					src={image.src}
					alt={image.alt}
					class="block w-full h-auto object-cover"
				/>
			</li>
		{/each}
	</ul>
</div>
