<script lang="ts">
	import { T } from '@threlte/core'
	import { useGltf, useMeshopt } from '@threlte/extras'
	import { onMount } from 'svelte'
	import { scroll } from '$lib/shared.svelte'

	const meshoptDecoder = useMeshopt()
	const earth = useGltf('/models/earth.glb', {
		meshoptDecoder
	})

	const planetTimeRot = 0.00001
	const initialRotX = 0.9
	const initialRotY = 0.9

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
		initialRotX - scroll.scrollTop * 0.0004
	)
	let rotY = $derived(
		initialRotY + scroll.scrollTop * 0.001
	)
</script>

{#if $earth}
	<T.Group
		position={[ 30.8, 14, -137.7 ]}
		rotation={[ rotX, rotY, 0 ]}
		scale={[ 33.1, 33.1, 33.1 ]}
	>
		<T
			is={$earth.scene}
			rotation={[0, time * planetTimeRot, 0]}
		/>
	</T.Group>
{/if}
