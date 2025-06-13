<script lang="ts">
	import '../app.css';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import SceneCanvas from '$lib/components/SceneCanvas.svelte';
	import HUD from '$lib/components/HUD.svelte';
	import LoadingScreen from '$lib/../components/LoadingScreen.svelte';
	import { selectedPlanet } from '$lib/store';
	import { SceneManager } from '$lib/3d/SceneManager.client';
	onMount(async () => {
		// Wait for 3D scene to be ready
		await SceneManager.instance.waitUntilReady();
		// Hide loading screen
		loadingScreenRef?.hide();
	})
	let { children } = $props();
	let loadingScreenRef: InstanceType<typeof LoadingScreen> | null = null;

	// Subscribe to store changes
	const unsubscribe = selectedPlanet.subscribe((planetName) => {
		if (planetName) {
			// 1) zoom in on the selected planet
			SceneManager.instance.zoomTo(planetName);

			// 2) update the URL (/about, /projects, etc.)
			goto(`/${planetName}`);
		}
	});

	onDestroy(unsubscribe);
	
</script>

<!-- 3D canvas -->
<SceneCanvas />

<!-- HUD overlay + routed page content -->
<HUD>
	{@render children()}
</HUD>

<LoadingScreen bind:this={loadingScreenRef} />