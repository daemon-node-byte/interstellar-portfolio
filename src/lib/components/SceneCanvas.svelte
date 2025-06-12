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
    speed: 0.8,
    equatorColor: [0.2, 0.5, 0.8],
    midColor: [0.1, 0.3, 0.6],
    poleColor: [0.8, 0.8, 0.9],
    noiseScale: 5.0,
    noiseSpeed: 0.05,
    detailMix: 0.5,
  },
  {
    name: 'projects',
    orbitRadius: 18,
    speed: 0.5,
    equatorColor: [0.8, 0.4, 0.2],
    midColor: [0.7, 0.3, 0.1],
    poleColor: [0.9, 0.8, 0.7],
    noiseScale: 7.0,
    noiseSpeed: 0.03,
    detailMix: 0.7
  },
  {
    name: 'blog',
    orbitRadius: 24,
    speed: 0.3,
    equatorColor: [0.2, 0.8, 0.4],
    midColor: [0.1, 0.6, 0.3],
    poleColor: [0.7, 0.9, 0.8],
    noiseScale: 4.0,
    noiseSpeed: 0.07,
    detailMix: 0.4
  },
  {
    name: 'contact',
    orbitRadius: 30,
    speed: 0.2,
    equatorColor: [0.7, 0.7, 0.2],
    midColor: [0.5, 0.5, 0.1],
    poleColor: [0.9, 0.9, 0.6],
    noiseScale: 6.0,
    noiseSpeed: 0.02,
    detailMix: 0.6,
    hasRing: true,
    ringDiameter: 0.35,
    ringThickness: 0.15,
  }
];

onMount(async () => {
  if (typeof window === 'undefined' || !canvasEl) return;
  SceneManager.instance.init(canvasEl);
  await SceneManager.instance.ready;
  isSceneReady = true;
  window.addEventListener('keydown', handleKeydown);
});

onDestroy(() => {
  if (typeof window === 'undefined') return;
  SceneManager.instance.dispose();
  window.removeEventListener('keydown', handleKeydown);
});

function onSelect(event: CustomEvent<{ name: string }>) {
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
</script>

<canvas bind:this={canvasEl} class="absolute inset-0 w-full h-full"></canvas>

{#if isSceneReady}
  {#each planetConfigs as cfg}
    <Planet
      {...cfg}
      on:select={onSelect}
    />
  {/each}
{/if}