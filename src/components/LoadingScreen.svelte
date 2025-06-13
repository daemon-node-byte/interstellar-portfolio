<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  let loadingText = "";
  const fullText = "Don't Panic, Loading...";
  let show = true;
  let typewriterDone = false;
  let pendingHide = false;

  // Typewriter effect
  onMount(() => {
    let i = 0;
    const interval = setInterval(() => {
      loadingText = fullText.slice(0, i + 1);
      i++;
      if (i === fullText.length) {
        clearInterval(interval);
        typewriterDone = true;
        if (pendingHide) show = false;
      }
    }, 80);
  });

  // Expose a function to hide the loading screen
  export function hide() {
    if (typewriterDone) {
      show = false;
    } else {
      pendingHide = true;
    }
  }
</script>

{#if show}
  <div class="loading-screen" transition:fade={{ duration: 600 }}>
    <div class="typewriter">{loadingText}</div>
  </div>
{/if}

<style>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0a0a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.6s;
}
.typewriter {
  color: #fff;
  font-size: 2rem;
  font-family: 'Fira Mono', 'Consolas', monospace;
  white-space: pre;
  border-right: 2px solid #fff;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  0%, 100% { border-color: #fff; }
  50% { border-color: transparent; }
}
</style>
