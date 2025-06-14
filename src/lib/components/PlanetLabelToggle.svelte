<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  export let checked = false;
  const dispatch = createEventDispatcher();
  let inputEl: HTMLInputElement;
  function toggle() {
    checked = !checked;
    dispatch('change', { checked });
  }
  // Allow parent to focus the toggle for accessibility
  export function focus() {
    inputEl?.focus();
  }
</script>

<label class="toggle-switch">
  <input type="checkbox" bind:checked on:change={toggle} bind:this={inputEl} />
  <span class="slider"></span>
  <span class="label">Show Planet Labels</span>
</label>

<style>
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  user-select: none;
}
.toggle-switch input {
  display: none;
}
.slider {
  width: 38px;
  height: 20px;
  background: #222;
  border-radius: 12px;
  position: relative;
  transition: background 0.2s;
  box-shadow: 0 0 8px #00ffe7, 0 0 2px #a200ff;
}
.slider:before {
  content: '';
  position: absolute;
  left: 3px;
  top: 3px;
  width: 14px;
  height: 14px;
  background: #00ffe7;
  border-radius: 50%;
  transition: transform 0.2s;
}
input:checked + .slider:before {
  transform: translateX(18px);
  background: #a200ff;
}
.label {
  color: #00ffe7;
  font-size: 1rem;
  font-family: 'Share Tech Mono', monospace;
  text-shadow: 0 0 6px #00ffe7;
}
</style>
