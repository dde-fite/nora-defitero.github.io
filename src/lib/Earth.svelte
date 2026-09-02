<script lang="ts">
	import { T } from '@threlte/core'
	import { Float, useGltf } from '@threlte/extras'
	import { onMount } from 'svelte'
	import { scrollTop } from '../shared.svelte'

	const earth = useGltf('/models/earth.glb')

	const planetTimeRot = 0.00001
	const initialRotX = -0.611
	const initialRotY = -0.1077

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

	let rotX = $derived(
		initialRotX - scrollTop.scroll * 0.0004
	)
	let rotY = $derived(
		initialRotY + scrollTop.scroll * 0.001
	)
</script>

{#if $earth}
	<T.Group
		position={[ 30.8, 14, -137.7 ]}
		rotation={[ rotX, rotY, 0.9166 ]}
		scale={[ 33.1, 33.1, 33.1 ]}
	>
		<T
			is={$earth.nodes["Sketchfab_model"]}
			rotation={[0, 0, time * planetTimeRot]}
			position={[ 0, 0, 0 ]}
		/>
	</T.Group>
{/if}
