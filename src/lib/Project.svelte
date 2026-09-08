<script lang="ts">
	import { onMount } from 'svelte'
	import { gsap } from 'gsap'
	import { ScrollTrigger } from 'gsap/ScrollTrigger'

	gsap.registerPlugin(ScrollTrigger)

	let title = "MLX Python Game Engine"

	let sections: HTMLElement[] = []
	let wrappers: HTMLElement[] = []

	onMount(() => {
		const ctx = gsap.context(() => {
			sections.forEach((section, index) => {
				const wrapper = wrappers[index]

				if (!section || !wrapper) return

				const isReversed = index % 2 === 1

				const getDistance = () => {
					return Math.max(0, wrapper.scrollWidth - section.clientWidth)
				}

				gsap.set(wrapper, {
					x: isReversed ? -getDistance() : 0
				})

				gsap.to(wrapper, {
					x: () => (isReversed ? 0 : -getDistance()),
					ease: 'none',
					scrollTrigger: {
						trigger: section,
						start: 'top bottom',
						end: 'bottom top',
						scrub: 0.5,
						invalidateOnRefresh: true
					}
				})
			})

			ScrollTrigger.refresh()
		})

		return () => ctx.revert()
	})
</script>

<div class="w-full overflow-hidden">
	<section
		bind:this={sections[0]}
		class="w-full overflow-hidden h-[50vh] flex items-center"
	>
		<h3
			bind:this={wrappers[0]}
			class="wrapper flex w-max whitespace-nowrap text-[15vw] leading-none font-display font-light text-primary"
		>
			{title}
		</h3>
	</section>
	<section
		bind:this={sections[1]}
		class="w-full overflow-hidden"
	>
		<div
			bind:this={wrappers[1]}
			class="wrapper flex w-max gap-6 m-0 p-0"
		>
			<p>Mlx Python Game Engine is a Python library for developing video games or graphic applications with the MiniLibx from 42. The idea behind this project is to achieve an experience similar to other popular graphics engines such as Unity or Godot.</p>
		</div>
	</section>
	<section
		bind:this={sections[2]}
		class="w-full overflow-hidden"
	>
		<ul
			bind:this={wrappers[2]}
			class="wrapper flex w-max gap-6 m-0 p-0 list-none"
		>
			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/mlx-pge/image1.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/mlx-pge/image2.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-03.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-04.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>
		</ul>
	</section>
	<section
		bind:this={sections[3]}
		class="w-full overflow-hidden"
	>
		<ul
			bind:this={wrappers[3]}
			class="wrapper flex w-max gap-6 m-0 p-0 list-none"
		>
			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-05.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-06.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-07.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>
		</ul>
	</section>
	<section
		bind:this={sections[4]}
		class="w-full overflow-hidden"
	>
		<ul
			bind:this={wrappers[4]}
			class="wrapper flex w-max gap-6 m-0 p-0 list-none"
		>
			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-08.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-09.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-10.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-11.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>
		</ul>
	</section>
	<section
		bind:this={sections[5]}
		class="w-full overflow-hidden"
	>
		<ul
			bind:this={wrappers[5]}
			class="wrapper flex w-max gap-6 m-0 p-0 list-none"
		>
			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-12.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-13.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-14.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>

			<li class="shrink-0 w-[80vw] max-w-[620px]">
				<img src="/images/image-15.jpg" alt="" class="block w-full h-auto object-cover" />
			</li>
		</ul>
	</section>
	<section
		bind:this={sections[6]}
		class="w-full overflow-hidden h-[50vh] flex items-center"
	>
		<div
			bind:this={wrappers[6]}
			class="wrapper flex w-max whitespace-nowrap text-[15vw] leading-none font-display font-light text-primary"
		>
			{title}
		</div>
	</section>
</div>
