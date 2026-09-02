<script lang="ts">
	import { T } from '@threlte/core'
	import { Float, useGltf } from '@threlte/extras'
	import { onMount } from 'svelte'
	import { scrollTop } from '../shared.svelte'

	const earth = useGltf('/models/exoplanet.glb')

	const planetTimeRot = 0.00001

	let time = $state(0)

	onMount(() => {
		let animationFrame: number

		const animate = (timestamp: number) => {
			time = timestamp
			animationFrame = requestAnimationFrame(animate)
		}

		animationFrame = requestAnimationFrame(animate)

		return () => cancelAnimationFrame(animationFrame)
	})
</script>

{#if $earth}
	<T.Group
		position={[ -92.2, -1.1, -109.9 ]}
		rotation={[ -0.7191, -0.5239, 0.5789 ]}
		scale={[ 25, 25, 25 ]}
	>
		<T
			is={$earth.nodes["Sketchfab_model"]}
			rotation={[0, 0, time * planetTimeRot]}
		/>
	</T.Group>
{/if}
