<script lang="ts">
	import '../app.css';
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	import SceneCanvas from '$lib/components/SceneCanvas.svelte';
	import HUD from '$lib/components/HUD.svelte';
	import { selectedPlanet } from '$lib/store';
	import { SceneManager } from '$lib/3d/SceneManager.client';

	let { children } = $props();

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