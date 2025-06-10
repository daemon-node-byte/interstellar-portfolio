<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import HUD from '$lib/components/HUD.svelte';
    import SolarSystem from '$lib/components/SolarSystem.svelte';

    let selectedPlanet: string | null = null;

    const handlePlanetSelect = (planet: string) => {
        selectedPlanet = planet;
    };
</script>

<div class="absolute inset-0 z-0">
    <SolarSystem on:selectPlanet={(e) => handlePlanetSelect(e.detail)} {selectedPlanet} />
</div>

<div class="absolute inset-0 z-10 pointer-events-none">
    <HUD {selectedPlanet} />
</div>

<!-- Render child routes/pages -->
<slot />

<style>
    :global(body) {
        margin: 0;
        overflow: hidden;
        background: black;
    }
</style>
