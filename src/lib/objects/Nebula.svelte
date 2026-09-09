<script lang="ts">
	import { T, useThrelte } from '@threlte/core'
	import { Stars } from '@threlte/extras';
	import {
		ACESFilmicToneMapping,
		AdditiveBlending,
		CanvasTexture,
		Color,
	} from 'three'

	function createNebulaTexture() {
		const canvas = document.createElement('canvas')
		canvas.width = 512
		canvas.height = 512
		const ctx = canvas.getContext('2d')!
		const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
		gradient.addColorStop(0, 'rgba(140, 200, 120, 0.45)')
		gradient.addColorStop(0.35, 'rgba(90, 150, 170, 0.18)')
		gradient.addColorStop(0.65, 'rgba(210, 170, 70, 0.10)')
		gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
		ctx.fillStyle = gradient
		ctx.fillRect(0, 0, 512, 512)
		const tex = new CanvasTexture(canvas)
		tex.colorSpace = 'srgb'
		return tex
	}
	const nebulaTexture = createNebulaTexture()
</script>

<T.Sprite position={[ 15.5, -1.7, -240 ]} scale={[350, 350, 1]} rotation={[ 0, 1.5708, 0 ]}>
	<T.SpriteMaterial
		map={nebulaTexture}
		color="#b4d066"
		blending={AdditiveBlending}
		transparent
		opacity={0.32}
		depthWrite={false}
	/>
</T.Sprite>