<script lang="ts">
	import { T, useThrelte } from '@threlte/core'
	import { Stars } from '@threlte/extras';
	import {
		ACESFilmicToneMapping,
		Color,
	} from 'three'
	import { SheetObject } from '@threlte/theatre'

    import Station from '$lib/Station.svelte'
	import Earth from '$lib/Earth.svelte'
    import Nebula from '$lib/Nebula.svelte'
    import Exoplanet from '$lib/Exoplanet.svelte'
    import Chipset from '$lib/Chipset.svelte'

	const { scene, renderer } = useThrelte()

	// Color management / renderer setup
	const bgColor = new Color('#0a0a12')
	$effect(() => {
		renderer.toneMapping = ACESFilmicToneMapping
		renderer.toneMappingExposure = 1.1
		scene.background = bgColor
	})
</script>

<SheetObject key="Camera">
	{#snippet children({ Transform })}
	<Transform>
		<T.PerspectiveCamera
			makeDefault
			fov={26}
			near={0.1}
			far={2000}
		/>
	</Transform>
	{/snippet}
</SheetObject>
<Chipset />
<Station />
<T.DirectionalLight
	position={[ 176.3, 183.1, 126.1 ]}
	intensity={2.2}
	color="#fff5e6"
	castShadow={false}
	target.position={[ 47.3, 20.6, -220.4 ]}
/>
<T.AmbientLight intensity={0.61} color="#7883a0" />
<Stars />
<Nebula />
<Earth />
<Exoplanet />
