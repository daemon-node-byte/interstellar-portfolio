<script lang="ts">
  import { onMount } from 'svelte';
  import { SceneManager } from '$lib/3d/SceneManager.client';
  export let name: string;
  export let getWorldPosition: () => [number, number, number];
  export let visible = true;
  let screenX = 0, screenY = 0;
  let show = false;

  function updateLabelPosition() {
    if (!visible) { show = false; return; }
    const [x, y, z] = getWorldPosition();
    const scene = SceneManager.instance.scene;
    const camera = SceneManager.instance.mainCamera;
    if (!scene || !camera) { show = false; return; }
    // Use Babylon's built-in projection
    const engine = SceneManager.instance.engine;
    const projected = (window as any).BABYLON.Vector3.Project(
      new (window as any).BABYLON.Vector3(x, y, z),
      scene.getTransformMatrix(),
      camera.getViewMatrix(),
      camera.getProjectionMatrix(),
      { x: 0, y: 0, width: engine.getRenderWidth(), height: engine.getRenderHeight() }
    );
    screenX = projected.x;
    screenY = projected.y;
    show = projected.z < 1.0;
  }

  onMount(() => {
    const scene = SceneManager.instance.scene;
    scene.onAfterRenderObservable.add(updateLabelPosition);
    updateLabelPosition();
    return () => {
      scene.onAfterRenderObservable.removeCallback(updateLabelPosition);
    };
  });
</script>

{#if visible && show}
  <div class="planet-label" style="left: {screenX}px; top: {screenY - 32}px;">
    {name}
  </div>
{/if}

<style>
.planet-label {
  position: fixed;
  pointer-events: auto;
  background: #181828cc;
  color: #00ffe7;
  border: 1.5px solid #a200ff;
  border-radius: 0.7rem;
  padding: 0.3rem 1.1rem;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.1rem;
  text-shadow: 0 0 8px #00ffe7, 0 0 2px #a200ff;
  box-shadow: 0 0 8px #a200ff55, 0 0 2px #00ffe755;
  z-index: 200;
  transform: translate(-50%, 0);
  transition: opacity 0.2s;
  opacity: 0.95;
  user-select: none;
}
</style>
