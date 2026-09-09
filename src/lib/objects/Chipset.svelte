<script lang="ts">
	import { T } from '@threlte/core'
	import { useGltf, useMeshopt } from '@threlte/extras'
	import { SheetObject } from '@threlte/theatre'
	import type { Mesh } from 'three'

	const meshoptDecoder = useMeshopt()
	const model = useGltf('/models/chipset.glb', {
		meshoptDecoder
	})

	let chipset: Mesh | undefined = $state()

	let targetX = $state(0)
	let targetY = $state(0)

	const handleMouseMove = (event: MouseEvent) => {
		targetX = (event.clientX / window.innerWidth - 0.5) * 2
		targetY = (event.clientY / window.innerHeight - 0.5) * 2
	}

	$effect(() => {
		if (!chipset) return
		chipset.rotation.x = targetY * 0.4
		chipset.rotation.z = -targetX * 0.45
	})
</script>

<svelte:window onmousemove={handleMouseMove} />

{#if $model}
	<SheetObject key="Chipset">
		{#snippet children({ Transform })}
			<Transform>
				<T.Group>
					<T.Mesh
						bind:ref={chipset}
						is={$model.scene}
					/>
				</T.Group>
			</Transform>
		{/snippet}
	</SheetObject>
{/if}
