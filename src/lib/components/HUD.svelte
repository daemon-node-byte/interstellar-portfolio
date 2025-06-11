<!-- src/lib/components/HudOverlay.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { fade, slide } from 'svelte/transition';
</script>

<div class="pointer-events-none fixed inset-0 flex flex-col p-8 font-mono text-neon-cyan">
    {#if $page.url.pathname === '/'}
        <div in:fade={{ duration: 600 }} out:fade={{ duration: 300 }}>
            <h1 class="text-5xl mb-4">Welcome, traveler.</h1>
            <p class="text-lg">Select a planet to explore my portfolio.</p>
        </div>
    {:else}
        <div
          in:slide={{ duration: 400, delay: 100 }}
          out:slide={{ duration: 300 }}
          class="pointer-events-auto bg-black/50 rounded-lg p-6 max-w-xl"
        >
            <slot />
        </div>
    {/if}
</div>
