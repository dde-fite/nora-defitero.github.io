<script lang="ts">
	import { T } from '@threlte/core'
	import { useGltf, useMeshopt } from '@threlte/extras'
	import { onMount } from 'svelte'

	const meshoptDecoder = useMeshopt()
	const earth = useGltf('/models/exoplanet.glb', {
		meshoptDecoder
	})

	const planetTimeRot = 0.00003

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
		position={[ -143.3, 0, -188.9 ]}
		rotation={[ -0, -0.32, -0.6 ]}
		scale={[ 25, 25, 25 ]}
	>
		<T
			is={$earth.scene}
			rotation={[0, time * planetTimeRot, 0]}
			position={[ 0, 0, 0 ]}
		/>
	</T.Group>
{/if}
