<script lang="ts">
	import { gsap } from "gsap";

	import GlassFilter from "$lib/glass/GlassFilter.svelte";
	import GlassButton from "$lib/glass/GlassButton.svelte"
	import Github from "$assets/github.svelte";
	import Linkedin from "$assets/linkedin.svelte";
	import { scroll } from "$lib/shared.svelte";

	interface Props {
		projects: HTMLElement;
		about_me: HTMLElement;
		contact: HTMLElement;
	}

	const { projects, about_me, contact }: Props = $props();
</script>

<header class="fixed top-4 flex justify-between items-center gap-2 w-full h-12 px-10 z-10">
	<GlassFilter radius={25}>
		<nav class="flex gap-6 items-center ml-auto px-6">
			<button
				class="cursor-pointer"
				onclick={() => {
					if (scroll.smoother) {
						gsap.to(scroll.smoother, {
							scrollTop: projects.offsetTop,
							duration: 2,
					 		ease: "power2.inOut"
						});
					}
			}}>
				<span class="text-lg text-primary font-extralight">Projects</span>
			</button>
			<button onclick={() => {
				scroll.smoother?.scrollTo(about_me.offsetHeight)
			}}>
				<span class="text-lg text-primary font-extralight">About Me</span>
			</button>
			<button onclick={() => {
				scroll.smoother?.scrollTo(contact.offsetHeight)
			}}>
				<span class="text-lg text-primary font-extralight">Contact</span>
			</button>
		</nav>
	</GlassFilter>
	<a href="https://github.com/noradefitero">
		<GlassButton type="circle" width={48} height={48}>
			<Github />
		</GlassButton>
	</a>
	<a href="https://linkedin.com/in/nora-de-fitero/">
		<GlassButton type="circle" width={48} height={48}>
			<Linkedin />
		</GlassButton>
	</a>
</header>