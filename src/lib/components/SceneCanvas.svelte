<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { SceneManager } from '$lib/3d/SceneManager.client';
import Planet from '$lib/components/Planet.svelte';
import { selectedPlanet } from '$lib/store';



let canvasEl: HTMLCanvasElement;
let isSceneReady = false;
let selectedPlanetName: string | null = null;

const planetConfigs = [
	{
		name: 'about',
		orbitRadius: 12,
    planetSize: 1.3,
		speed: 0.9,
		equatorColor: [0.2, 0.5, 0.8],
		midColor: [0.1, 0.3, 0.6],
		poleColor: [0.8, 0.8, 0.9],
		noiseScale: 5.0,
		noiseSpeed: 0.05,
		detailMix: 0.5
	},
	{
		name: 'projects',
		orbitRadius: 22,
    atmosphere: true,
		speed: 0.4,
		equatorColor: [0.8, 0.4, 0.2],
		midColor: [0.7, 0.3, 0.1],
		poleColor: [0.9, 0.8, 0.7],
		noiseScale: 7.0,
		noiseSpeed: 0.03,
		detailMix: 0.7
	},
	{
		name: 'blog',
		orbitRadius: 30,
    planetSize: 2.5,
    moonCount: 2,
    moonOrbitAxes: [
      [0.2, 0, 0] as [number, number, number],
      [0, 0.4, 0] as [number, number, number],
    ],
		speed: 0.2,
		equatorColor: [0.2, 0.8, 0.4],
		midColor: [0.1, 0.6, 0.3],
		poleColor: [0.7, 0.9, 0.8],
		noiseScale: 4.0,
		noiseSpeed: 0.07,
		detailMix: 0.4
	},
	{
		name: 'contact',
		orbitRadius: 45,
		speed: 0.7,
		equatorColor: [0.7, 0.7, 0.2],
		midColor: [0.5, 0.5, 0.1],
		poleColor: [0.9, 0.9, 0.6],
		noiseScale: 6.0,
		noiseSpeed: 0.02,
		detailMix: 0.6,
		hasRing: false,
		ringDiameter: 0.7,
		ringThickness: 0.10
	}
];

function onSelect(event: CustomEvent<{ name: string }>) {
	selectedPlanetName = event.detail.name;
	if (typeof window !== 'undefined') {
		SceneManager.instance.followPlanet(selectedPlanetName);
		selectedPlanet.set(selectedPlanetName);
	}
}

function handleKeydown(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		selectedPlanetName = null;
		if (typeof window !== 'undefined') {
			SceneManager.instance.resetCamera();
			selectedPlanet.set(null);
		}
	}
}

onMount(async () => {
	

	SceneManager.instance.init(canvasEl);
	await SceneManager.instance.ready;
	isSceneReady = true;
	// if (typeof window === 'undefined' || !canvasEl) return;
	// const {Inspector} = await import('@babylonjs/inspector');
	// 	if (SceneManager.instance.scene) {
	// 		Inspector.Show(SceneManager.instance.scene, { showExplorer: true, showInspector: true, overlay: true, });
	// 	}
});

onDestroy(() => {
	if (typeof window === 'undefined') return;
	SceneManager.instance.dispose();
	window.removeEventListener('keydown', handleKeydown);
});
</script>

<style>
/* Ensure the canvas fills the viewport and does not overflow */
:global(body) {
	margin: 0;
	padding: 0;
	overflow: hidden;
}
.scene-canvas-container {
	position: fixed;
	inset: 0;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}
canvas {
	display: block;
	width: 100vw;
	height: 100vh;
	max-width: 100vw;
	max-height: 100vh;
	overflow: hidden;
}
</style>

<div class="scene-canvas-container">
	<canvas bind:this={canvasEl} class="scene-canvas"></canvas>
</div>

{#if isSceneReady}
	{#each planetConfigs as cfg}
		<Planet {...cfg} on:select={onSelect} />
	{/each}
{/if}