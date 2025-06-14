<!-- src/lib/components/HudOverlay.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { fade, slide } from 'svelte/transition';
    import { onMount } from 'svelte';
    import PlanetLabelToggle from './PlanetLabelToggle.svelte';
    import { writable } from 'svelte/store';
    import { planetLabels } from '$lib/store/planetLabels';

    // Modal state
    let showModal = false;

    // Keyboard shortcut: H for help and Esc for close
    onMount(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'h') {
                showModal = !showModal;
            }
            if (e.key === 'Escape' && showModal) {
                showModal = false;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });
</script>

<div class="pointer-events-none fixed inset-0 flex flex-col p-8 font-mono text-neon-cyan">
  <!-- Help/info button -->
  <button class="help-btn pointer-events-auto" aria-label="Help / Info" on:click={() => showModal = true}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="#00ffe7" stroke-width="2"/><path d="M12 8v2m0 4h.01" stroke="#00ffe7" stroke-width="2" stroke-linecap="round"/></svg>
  </button>

  {#if showModal}
    <div class="modal-backdrop" on:click={() => showModal = false} />
    <div class="modal" in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}>
      <button class="modal-close" aria-label="Close" on:click={() => showModal = false}>&times;</button>
      <h2>Help & Shortcuts</h2>
      <ul class="shortcuts">
        <li><b>H</b>: Open/close this help</li>
        <li><b>Click planet</b>: Focus/zoom to planet</li>
        <li><b>Drag</b>: Rotate camera</li>
        <li><b>Scroll</b>: Zoom in/out</li>
        <li><b>Double-click background</b>: Reset camera</li>
        <li><b>Click planet label</b>: Focus planet</li>
      </ul>
      <div class="toggle-row">
        <PlanetLabelToggle bind:checked={$planetLabels} />
      </div>
      <p class="info">Explore the scene! You can interact with planets, moons, and more. Use the controls above to customize your view.</p>
    </div>
  {/if}

  {#if $page.url.pathname === '/'}
    <div in:fade={{ duration: 600 }} out:fade={{ duration: 300 }}>
      <h1 class="text-5xl mb-4">Welcome, traveler.</h1>
      <p class="text-lg">Select a planet to explore my portfolio.</p>
    </div>
  {:else}
    <div
      in:slide={{ duration: 400, delay: 100 }}
      out:slide={{ duration: 300 }}
      class="pointer-events-auto bg-black/50 rounded-lg p-6 max-w-xl -z-50"
    >
      <slot />
    </div>
  {/if}
</div>

<style>
.help-btn {
  position: absolute;
  top: 1.5rem;
  right: 2.5rem;
  background: #181828cc;
  border: 2px solid #00ffe7;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 0 12px #00ffe7, 0 0 2px #a200ff;
  cursor: pointer;
  transition: background 0.2s, border 0.2s;
}
.help-btn:hover {
  background: #00ffe733;
  border-color: #a200ff;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 30, 0.7);
  z-index: 101;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #181828;
  border: 2px solid #00ffe7;
  border-radius: 1.2rem;
  box-shadow: 0 0 32px #00ffe7, 0 0 8px #a200ff;
  padding: 2.2rem 2.5rem 1.5rem 2.5rem;
  z-index: 102;
  min-width: 320px;
  max-width: 95vw;
  color: #fff;
  font-family: 'Share Tech Mono', monospace;
  text-shadow: 0 0 6px #00ffe7;
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: #00ffe7;
  font-size: 2rem;
  cursor: pointer;
  z-index: 103;
}
.modal h2 {
  color: #00ffe7;
  font-size: 1.5rem;
  margin-bottom: 1.2rem;
}
.shortcuts {
  list-style: none;
  padding: 0;
  margin-bottom: 1.2rem;
}
.shortcuts li {
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
}
.toggle-row {
  margin: 1.2rem 0 1.5rem 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.info {
  color: #a200ff;
  font-size: 1rem;
  margin-top: 1.2rem;
}
</style>
