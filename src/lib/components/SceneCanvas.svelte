<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SceneManager } from '$lib/3d/SceneManager.client';
	import Planet from '$lib/components/Planet.svelte';
	import { selectedPlanet } from '$lib/store';

	let canvasEl: HTMLCanvasElement;
	let isSceneReady = false;
	let selectedPlanetName: string | null = null;

	onMount(async () => {
		if (typeof window === 'undefined') return; // Ensure this runs only in the browser

		if (!canvasEl) {
			console.error('SceneCanvas: Canvas element is not available.');
			return;
		}

		SceneManager.instance.init(canvasEl);
		await SceneManager.instance.ready;
		isSceneReady = true;

		// Listen for Esc key to reset the camera
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (typeof window === 'undefined') return; // Ensure this runs only in the browser
		SceneManager.instance.dispose();
		window.removeEventListener('keydown', handleKeydown);
	});

	function onSelect(event) {
		selectedPlanetName = event.detail.name;
		SceneManager.instance.followPlanet(selectedPlanetName);
		selectedPlanet.set(selectedPlanetName);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			selectedPlanetName = null;
			SceneManager.instance.resetCamera();
			selectedPlanet.set(null);
		}
	}

	const planetConfigs = [
		{ name: 'about', orbitRadius: 12, speed: 0.8 },
		{ name: 'projects', orbitRadius: 18, speed: 0.5 },
		{ name: 'blog', orbitRadius: 24, speed: 0.3 },
		{ name: 'contact', orbitRadius: 30, speed: 0.2 },
	];
</script>

<canvas bind:this={canvasEl} class="absolute inset-0 w-full h-full"></canvas>

{#if isSceneReady}
	{#each planetConfigs as cfg}
		<Planet
			name={cfg.name}
			orbitRadius={cfg.orbitRadius}
			speed={cfg.speed}
			on:select={onSelect}
		/>
	{/each}
{/if}
