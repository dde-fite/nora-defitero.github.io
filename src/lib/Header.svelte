<script lang="ts">
	import GlassFilter from "./glass/GlassFilter.svelte";
	import GlassButton from "./glass/GlassButton.svelte"
	import Github from "../assets/github.svelte";
	import Linkedin from "../assets/linkedin.svelte";
</script>

<header class="fixed top-4 flex gap-6 justify-between items-center px-10 z-100">
	<GlassFilter radiusPercent={100} >
		<nav class="flex gap-6 justify-end">
			<button>
				<span class="text-xl text-primary font-extralight">Portfolio</span>
			</button>
			<button>
				<span class="text-xl text-primary font-extralight">About Me</span>
			</button>
			<button>
				<span class="text-xl text-primary font-extralight">Contact</span>
			</button>
		</nav>
	</GlassFilter>
	<div class="flex items-center gap-3">
		<GlassButton type="circle" width={48} height={48}>
			<Github />
		</GlassButton>
		<GlassButton type="circle" width={48} height={48}>
			<Linkedin />
		</GlassButton>
	</div>
</header>