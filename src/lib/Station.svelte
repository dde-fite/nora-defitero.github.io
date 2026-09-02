<script lang="ts">
	import { T } from '@threlte/core'
	import { Float, useGltf } from '@threlte/extras'
	import { scrollTop } from '../shared.svelte'

	const station = useGltf('/models/station.glb')

	// Stage 1
	let stage1Threshold = 950
	let stage1X = 8.1
	let stage1Y = -2.2
	let stage1Z = -35.0
	let stage1RotX = -0.631
	let stage1RotY = 0.9082
	let stage1RotZ = -1.8307

	// Stage 2
	let stage2X = 4.778
	let stage2Y = 3.778
	let stage2Z = -9.151
	let stage2RotX = -0.698
	let stage2RotY = 0.549
	let stage2RotZ = -1.737

	// Stage 3
	let stage3Threshold = 1500
	let stage3X = -43.0
	let stage3Y = -4.4
	let stage3Z = -61.7
	let stage3RotX = -1.154598775598299
	let stage3RotY = 0.9082
	let stage3RotZ = 1.3071012244017013

	let posX = $state(stage1X)
	let posY = $state(stage1Y)
	let posZ = $state(stage1Z)
	let rotX = $state(stage1RotX)
	let rotY = $state(stage1RotY)
	let rotZ = $state(stage1RotZ)
	$effect(() => {
		const scroll = scrollTop.scroll

		if (scroll <= stage1Threshold) {
			posX = stage1X
			posY = stage1Y
			posZ = stage1Z
			rotX = stage1RotX
			rotY = stage1RotY
			rotZ = stage1RotZ
		}
		else if (scroll > stage1Threshold && scroll < stage3Threshold)
		{
			const t =
				(scroll - stage1Threshold) /
				(stage3Threshold - stage1Threshold)
			const smooth = t * t * (3 - 2 * t)
			posX = stage2X + (stage3X - stage2X) * smooth
			posY = stage2Y + (stage3Y - stage2Y) * smooth
			posZ = stage2Z + (stage3Z - stage2Z) * smooth
			rotX = stage2RotX + (stage3RotX - stage2RotX) * smooth
			rotY = stage2RotY + (stage3RotY - stage2RotY) * smooth
			rotZ = stage2RotZ + (stage3RotZ - stage2RotZ) * smooth
		}
		else if (scroll >= stage3Threshold) {
			posX = stage3X
			posY = stage3Y
			posZ = stage3Z
			rotX = stage3RotX
			rotY = stage3RotY
			rotZ = stage3RotZ
		}
	})
</script>

{#if $station}
	<Float floatIntensity={4}>
	<T
		is={$station.nodes["Sketchfab_model"]}
		position={[ posX, posY, posZ ]}
		rotation={[ rotX, rotY, rotZ ]}
		scale={[ 3.1, 3.1, 3.1 ]}
	/>
	</Float>
{/if}
