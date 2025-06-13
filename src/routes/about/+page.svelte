<script lang="ts">
  import { fly, fade } from 'svelte/transition';
</script>

<div class="cyber-container" in:fly={{ y: 40, duration: 700 }} out:fade={{ duration: 300 }}>
  <h2 class="cyber-title" in:fly={{ x: -30, duration: 700, delay: 200 }}>About Me</h2>
  <div class="cyber-text" in:fade={{ duration: 800, delay: 400 }}>
    <p>
      I’m Josh, a software engineer specializing in WebGL, SvelteKit, and futuristic front-end experiences.
    </p>
    <ul>
      <li>🛠️ 10+ years building interactive 3D demos</li>
      <li>🚀 Love optimizing shaders & pipeline performance</li>
      <li>🎮 Passion for gaming tech & cyberpunk aesthetics</li>
    </ul>
  </div>
</div>

<style>
.cyber-container {
  background: linear-gradient(120deg, rgba(0,255,231,0.08) 0%, rgba(162,0,255,0.10) 100%);
  border: 2px solid var(--color-neon-cyan, #00ffe7);
  box-shadow: 0 0 24px 2px var(--color-neon-cyan, #00ffe7), 0 0 2px 1px var(--color-cyber-purple, #a200ff);
  border-radius: 1.2rem;
  padding: 2.5rem 2rem;
  margin: 2rem auto;
  max-width: 540px;
  position: relative;
  overflow: hidden;
}
.cyber-title {
  color: var(--color-neon-cyan, #00ffe7);
  font-size: 2.5rem;
  font-family: 'Orbitron', 'Share Tech Mono', monospace;
  text-shadow: 0 0 12px var(--color-neon-cyan, #00ffe7), 0 0 32px #a200ff;
  margin-bottom: 1.2rem;
  letter-spacing: 0.08em;
}
.cyber-text {
  color: #fff;
  font-size: 1.15rem;
  font-family: var(--font-mono, 'Share Tech Mono', monospace);
  text-shadow: 0 0 6px var(--text-glow, #00ffe7);
  line-height: 1.7;
  animation: cyber-flicker 2.5s infinite alternate;
}
.cyber-text ul {
  margin-top: 1.2rem;
  padding-left: 1.5rem;
}
.cyber-text li {
  margin-bottom: 0.7rem;
  list-style: disc;
  color: var(--color-cyber-purple, #a200ff);
  text-shadow: 0 0 8px #a200ff, 0 0 16px #00ffe7;
}
@keyframes cyber-flicker {
  0% { opacity: 1; }
  97% { opacity: 1; }
  98% { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>
