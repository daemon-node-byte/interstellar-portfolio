<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  let name = '';
  let email = '';
  let message = '';
  let sent = false;
  function handleSubmit(e: Event) {
    e.preventDefault();
    sent = true;
    // Here you would add your form submission logic (API, email, etc)
  }
  // Simple SVG icons for demonstration
  const github = `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#00ffe7" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .26.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/></svg>`;
  const linkedin = `<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#00ffe7" d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg>`;
  const user = `<svg width='20' height='20' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='8' r='4' stroke='#a200ff' stroke-width='2'/><path d='M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4' stroke='#a200ff' stroke-width='2'/></svg>`;
  const mail = `<svg width='20' height='20' fill='none' viewBox='0 0 24 24'><rect x='3' y='5' width='18' height='14' rx='2' stroke='#a200ff' stroke-width='2'/><path d='M3 7l9 6 9-6' stroke='#a200ff' stroke-width='2'/></svg>`;
  const messageIcon = `<svg width='20' height='20' fill='none' viewBox='0 0 24 24'><rect x='3' y='5' width='18' height='14' rx='2' stroke='#a200ff' stroke-width='2'/><path d='M3 7l9 6 9-6' stroke='#a200ff' stroke-width='2'/></svg>`;
</script>

<div class="contact-hud-center">
  <div class="contact-hud-grid">
    <div class="cyber-container" in:fly={{ x: -40, duration: 700 }} out:fade={{ duration: 300 }}>
      <h2 class="cyber-title" in:fly={{ y: 20, duration: 700, delay: 200 }}>Contact Me</h2>
      {#if !sent}
        <form class="cyber-form" on:submit={handleSubmit} autocomplete="off">
          <label for="name"><span class="icon">{@html user}</span> Name</label>
          <input id="name" type="text" bind:value={name} required />
          <label for="email"><span class="icon">{@html mail}</span> Email</label>
          <input id="email" type="email" bind:value={email} required />
          <label for="message"><span class="icon">{@html messageIcon}</span> Message</label>
          <textarea id="message" rows="4" bind:value={message} required></textarea>
          <button type="submit">Send</button>
        </form>
      {:else}
        <div class="cyber-success" in:fade={{ duration: 600 }}>Message sent! Thank you.</div>
      {/if}
    </div>
    <div class="cyber-container cyber-social" in:fly={{ x: 40, duration: 700 }} out:fade={{ duration: 300 }}>
      <h3 class="cyber-title" in:fly={{ y: 20, duration: 700, delay: 200 }}>Connect</h3>
      <div class="cyber-links">
        <a href="https://github.com/yourusername" target="_blank" rel="noopener" class="cyber-link">
          <span class="icon">{@html github}</span>
          <span>GitHub</span>
        </a>
        <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener" class="cyber-link">
          <span class="icon">{@html linkedin}</span>
          <span>LinkedIn</span>
        </a>
        <!-- Add more social links as needed -->
      </div>
    </div>
  </div>
</div>

<style>
.contact-hud-center {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: transparent;
  z-index: 10;
  pointer-events: none;
}
.contact-hud-grid {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  justify-content: center;
  align-items: center;
  margin: 2.5rem 0;
  pointer-events: auto;
}
.icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
  filter: drop-shadow(0 0 6px #00ffe7) drop-shadow(0 0 2px #a200ff);
}
.cyber-container {
  background: linear-gradient(120deg, rgba(0,255,231,0.08) 0%, rgba(162,0,255,0.10) 100%);
  border: 2px solid var(--color-neon-cyan, #00ffe7);
  box-shadow: 0 0 24px 2px var(--color-neon-cyan, #00ffe7), 0 0 2px 1px var(--color-cyber-purple, #a200ff);
  border-radius: 1.2rem;
  padding: 1.5rem 1.2rem;
  min-width: 340px;
  max-width: 540px;
  position: relative;
  overflow: hidden;
  margin-bottom: 1.2rem;
  pointer-events: auto;
}
.cyber-title {
  color: var(--color-neon-cyan, #00ffe7);
  font-size: 1.4rem;
  font-family: 'Orbitron', 'Share Tech Mono', monospace;
  text-shadow: 0 0 12px var(--color-neon-cyan, #00ffe7), 0 0 32px #a200ff;
  margin-bottom: 1rem;
  letter-spacing: 0.08em;
}
.cyber-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.cyber-form label {
  font-size: 1rem;
}
.cyber-form input,
.cyber-form textarea {
  font-size: 0.95rem;
  padding: 0.5rem 0.8rem;
}
.cyber-form button {
  font-size: 1rem;
  padding: 0.7rem 1rem;
}
.cyber-success {
  color: var(--color-neon-cyan, #00ffe7);
  font-size: 1.05rem;
  text-align: center;
  margin-top: 2rem;
  text-shadow: 0 0 12px var(--color-neon-cyan, #00ffe7), 0 0 32px #a200ff;
}
.cyber-social {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}
.cyber-links {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 1.2rem;
}
.cyber-link {
  color: var(--color-neon-cyan, #00ffe7);
  font-size: 1rem;
  font-family: var(--font-mono, 'Share Tech Mono', monospace);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.4rem 0.8rem;
  border: 1.5px solid var(--color-cyber-purple, #a200ff);
  border-radius: 0.7rem;
  background: #181828cc;
  box-shadow: 0 0 8px #a200ff55, 0 0 2px #00ffe755;
  transition: background 0.2s, border 0.2s, color 0.2s;
}
.cyber-link:hover {
  background: #a200ff33;
  border-color: #00ffe7;
  color: #fff;
}
</style>