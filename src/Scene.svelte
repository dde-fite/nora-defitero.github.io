<script lang="ts">
	import { T, useThrelte } from '@threlte/core'
	import { Stars } from '@threlte/extras';
	import {
		ACESFilmicToneMapping,
		Color,
	} from 'three'

    import Station from './lib/Station.svelte'
	import Earth from './lib/Earth.svelte'
	import { scroll } from './shared.svelte'
    import Nebula from './lib/Nebula.svelte'
    import Exoplanet from './lib/Exoplanet.svelte'

	const { scene, renderer } = useThrelte()

	// Color management / renderer setup
	const bgColor = new Color('#0a0a12')
	$effect(() => {
		renderer.toneMapping = ACESFilmicToneMapping
		renderer.toneMappingExposure = 1.1
		scene.background = bgColor
	})


	// Stage 1
	let stage1Threshold = 500
	let stage1Angle = 0

	// Stage 2
	let stage2Threshold = 1300
	let stage2Angle = 0.5235988 // 30°

	let cameraRotY = $derived.by(() => {
		const scrollTop = scroll.scrollTop
		if (scrollTop <= stage1Threshold) {
			return stage1Angle
		}
		if (scrollTop >= stage2Threshold) {
			return stage2Angle
		}
		const t =
			(scrollTop - stage1Threshold) /
			(stage2Threshold - stage1Threshold)
		const smooth = t * t * (3 - 2 * t)
		return stage1Angle + (stage2Angle - stage1Angle) * smooth
	})
</script>

<T.PerspectiveCamera
	makeDefault
	fov={26}
	near={0.1}
	far={2000}
	position={[ 0, 0, 0 ]}
	rotation={[ 0, cameraRotY, 0 ]}
/>
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
