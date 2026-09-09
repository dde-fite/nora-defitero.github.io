<script lang="ts">
	import ProjectItem from "$components/ProjectItem.svelte";
	import mlxImage1 from "$assets/images/mlx-pge/image1.jpg"
	import mlxImage2 from "$assets/images/mlx-pge/image2.jpg"
	import mlxImage3 from "$assets/images/mlx-pge/image3.jpg"
	import mlxImage4 from "$assets/images/mlx-pge/image4.jpg"
	import flyImage1 from "$assets/images/fly-in/image1.gif"
</script>

<div class="flex flex-col justify-center items-center pr-0 h-min-svh w-full">
	<h2 class="text-7xl text-primary">Projects</h2>
	<ProjectItem
		title="MLX Python Game Engine"
		description="Python library for developing video games or graphic applications with the MiniLibx from 42. The idea behind this project is to achieve an experience similar to other popular graphics engines such as Unity or Godot."
		images={[
			{
				src: mlxImage4,
				alt: ""
			},
			{
				src: mlxImage3,
				alt: ""
			},
			{
				src: mlxImage2,
				alt: ""
			},
			{
				src: mlxImage1,
				alt: ""
			},
		]}
	/>
	<ProjectItem
		title="42_Fly_in"
		description="Drone traffic simulation inspired by how railway networks move."
		images={[
			{
				src: flyImage1,
				alt: ""
			}
		]}
	/>
</div>