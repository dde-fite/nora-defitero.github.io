<script lang="ts">
	import { T } from '@threlte/core'
	import { Float, useGltf, useMeshopt } from '@threlte/extras'
	import { SheetObject } from '@threlte/theatre'

	const meshoptDecoder = useMeshopt()
	const station = useGltf('/models/station.glb', {
		meshoptDecoder
	})
</script>

{#if $station}
<Float floatIntensity={4}>
	<SheetObject key="Station">
		{#snippet children({ Transform })}
		<Transform>
			<T
				is={$station.scene}
			/>
		</Transform>
		{/snippet}
	</SheetObject>
</Float>
{/if}
