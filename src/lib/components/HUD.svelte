<script lang="ts">
    export let selectedPlanet: string | null;
</script>

<div class="hud-container p-4 text-green-300 font-mono text-sm">
    {#if selectedPlanet === null}
        <div class="animate-fade-in">
            <p>Welcome Commander.</p>
            <p>Click a planet to begin your mission.</p>
        </div>
    {:else if selectedPlanet === 'about'}
        <div class="animate-fade-in">
            <h2 class="text-xl">About Me</h2>
            <p>I am an interstellar software engineer from Earth...</p>
        </div>
    {:else if selectedPlanet === 'projects'}
        <div class="animate-fade-in">
            <h2 class="text-xl">Projects</h2>
            <ul>
                <li>⚙️ Alien UI Framework</li>
                <li>🛰️ Satellite CMS</li>
                <li>👾 Nebula JS</li>
            </ul>
        </div>
    {:else if selectedPlanet === 'blog'}
        <div class="animate-fade-in">
            <h2 class="text-xl">Blog</h2>
            <p>Reflections from beyond the galaxy...</p>
        </div>
    {:else if selectedPlanet === 'contact'}
        <div class="animate-fade-in">
            <h2 class="text-xl">Contact</h2>
            <p>Send a signal via deep-space frequency...</p>
        </div>
    {/if}
</div>

<style>
    .hud-container {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(6px);
    }
    .animate-fade-in {
        animation: fadeIn 0.8s ease-in-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>