Below is a high-level architecture and starter-code sketch for a SvelteKit + TailwindCSS + BabylonJS portfolio that meets your interstellar cyberpunk requirements. It’s written in TypeScript, follows SvelteKit’s conventions, and is designed for maintainability, testability and smooth performance.

---

## 1. Project Structure

```
my-portfolio/
├─ src/
│  ├─ lib/
│  │  ├─ babylon/
│  │  │  ├─ SceneManager.client.ts       ← singleton to init and switch scenes/cameras
│  │  │  ├─ shaders/               ← your GLSL shader chunks (planet surfaces, rings)
│  │  │  └─ utils.ts               ← orbit calculations, resource loading helpers
│  │  ├─ components/
│  │  │  ├─ Planet.svelte          ← encapsulates one planet mesh + click logic
│  │  │  ├─ HudOverlay.svelte      ← Svelte HUD UI that subscribes to store
│  │  │  └─ LoadingScreen.svelte   ← initial welcome + spinner
│  │  ├─ stores.ts                 ← Svelte writable stores for app state
│  │  └─ routes/                   ← SvelteKit page routes
│  │     ├─ +layout.svelte         ← wraps the whole app (canvas + HUD)
│  │     ├─ +page.svelte           ← entrypoint, lazy-loads SceneCanvas
│  │     ├─ about/+page.svelte     ← content for “About” (rendered via HUD)
│  │     ├─ projects/+page.svelte  ← etc.
│  │     ├─ blog/+page.svelte
│  │     └─ contact/+page.svelte
│  ├─ app.html                     ← include `<canvas>` placeholder
│  └─ tailwind.config.cjs
├─ static/                         ← textures, environment HDR, fonts
├─ tests/                          ← Vitest + Playwright
├─ vite.config.ts                  ← add vite-plugin-glsl, asset handling
├─ svelte.config.js
└─ package.json
```

---

## 2. Core Concepts

### 2.1 Scene Initialization & Management

* **`SceneManager`**

  * Initialize BabylonJS engine on a shared `<canvas>`
  * Create a root `Scene` with a central point (the “sun”) using a `PointLight` and an emissive sphere shader.
  * Manage a single “main” camera (`ArcRotateCamera`) for orbits, and target-switching for zooming.

```ts
// src/lib/babylon/SceneManager.client.ts
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, PointLight } from '@babylonjs/core';

export class SceneManager {
  private static _instance: SceneManager;
  public engine!: Engine;
  public scene!: Scene;
  public mainCamera!: ArcRotateCamera;

  private constructor() {}

  public static get instance() {
    if (!this._instance) this._instance = new SceneManager();
    return this._instance;
  }

  public init(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, { stencil: true });
    this.scene = new Scene(this.engine);
    // Main camera: orbit control around origin
    this.mainCamera = new ArcRotateCamera('camera', 0, Math.PI / 3, 30, Vector3.Zero(), this.scene);
    this.mainCamera.attachControl(canvas, true);
    // Lighting: sun as emissive + point light
    const sun = MeshBuilder.CreateSphere('sun', { diameter: 4 }, this.scene);
    // apply custom glow/emissive shader...
    const light = new PointLight('sunLight', Vector3.Zero(), this.scene);
    light.intensity = 2;
    // Hemispheric fill
    new HemisphericLight('hemi', new Vector3(0, 1, 0), this.scene);
    // Start render loop
    this.engine.runRenderLoop(() => this.scene.render());
    // Resize handling
    window.addEventListener('resize', () => this.engine.resize());
  }

  /** Smoothly zooms to a target mesh */
  public async zoomTo(meshName: string) {
    const mesh = this.scene.getMeshByName(meshName);
    if (!mesh) return;
    // animate camera.target and radius using Babylon’s Animation APIs
    // ...
  }
}
```

### 2.2 Planet Component

Each planet is a `<Planet>` Svelte component that:

1. Loads its own mesh + custom GLSL material (e.g. ring shader).
2. Animates orbit via `scene.registerBeforeRender()` with its own orbital parameters.
3. Emits a click event to your Svelte store.

```svelte
<!-- src/lib/components/Planet.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { SceneManager } from '$lib/babylon/SceneManager';
  import { getOrbitParams } from '$lib/babylon/utils';

  export let name: string;
  export let orbitRadius: number;
  export let speed: number;
  const dispatch = createEventDispatcher();

  let mesh: BABYLON.Mesh;

  onMount(() => {
    const scene = SceneManager.instance.scene;
    mesh = BABYLON.MeshBuilder.CreateSphere(name, { diameter: 2 }, scene);
    // assign unique shader from shaders/ based on `name`
    const mat = new BABYLON.ShaderMaterial(/*...*/);
    mesh.material = mat;

    // Animate orbit
    scene.registerBeforeRender(() => {
      const t = performance.now() * 0.0001 * speed;
      mesh.position.x = Math.cos(t) * orbitRadius;
      mesh.position.z = Math.sin(t) * orbitRadius;
    });

    mesh.actionManager = new BABYLON.ActionManager(scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
        dispatch('select', { name });
      })
    );
  });
</script>
```

### 2.3 Svelte Stores & Routing

* **`stores.ts`** holds the current selection:

```ts
// src/lib/stores.ts
import { writable } from 'svelte/store';
export const selectedPlanet = writable<string | null>(null);
```

* In your layout or root component, subscribe and trigger the scene zoom + `goto`:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { selectedPlanet } from '$lib/stores';
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { SceneManager } from '$lib/babylon/SceneManager';

  const unsubscribe = selectedPlanet.subscribe(async (planet) => {
    if (planet) {
      await SceneManager.instance.zoomTo(planet);
      goto(`/${planet}`);        // e.g. “/about”, “/projects”
    }
  });
  onDestroy(unsubscribe);
</script>

<canvas id="renderCanvas" class="absolute inset-0"></canvas>
<slot />  <!-- HUD overlay lives here -->
```

* Each route (`src/routes/about/+page.svelte`, etc.) renders its section inside a `<HudOverlay>` component, driven by the same theme and responsive Tailwind layout.

### 2.4 Heads-Up Display Overlay

Use a pure-Svelte component overlaid atop the canvas (position: absolute; pointer-events managed):

```svelte
<!-- src/lib/components/HudOverlay.svelte -->
<script lang="ts">
  import { selectedPlanet } from '$lib/stores';
  import { page } from '$app/stores';
  // derive welcome vs section state
</script>

<div class="pointer-events-none fixed inset-0 flex flex-col p-6 text-neon-cyan font-mono">
  {#if $page.url.pathname === '/'}
    <h1 class="text-4xl">Welcome, traveler.</h1>
    <p>Click a planet to explore.</p>
  {:else}
    <slot /> <!-- your route page injects its content here -->
  {/if}
</div>
```

---

## 3. Smooth Transitions & Animations

* **Babylon Animations**: camera radius/target, material fades.
* **Svelte Transitions**: fade / slide for the HTML HUD content via `svelte/transition`.
* Keep all animation durations consistent (e.g. 800 ms easings).

---

## 4. Performance & Best Practices

* **Lazy-load routes**: SvelteKit does this out-of-the-box for `/about`, `/projects`, etc.
* **GLSL via vite-plugin-glsl**: import `.frag`/`.vert` directly.
* **Resource Disposal**: on route change, dispose old meshes/materials if no longer used.
* **TypeScript everywhere**: strict mode on, `@babylonjs/core` types.
* **Testing**:

  * **Unit**: Vitest for utility functions (orbit math, store updates).
  * **Integration/E2E**: Playwright to click a planet, assert camera moved & correct HUD content visible.

---

## 5. TailwindCSS & Styling

```js
// tailwind.config.cjs
module.exports = {
  content: ['./src/**/*.{svelte,ts}'],
  theme: {
    extend: {
      colors: { 'neon-cyan': '#00ffe7', 'cyber-purple': '#a200ff' },
      fontFamily: { mono: ['"Share Tech Mono"', 'monospace'] },
    }
  },
  plugins: [],
};
```

Use utility classes to enforce your cyberpunk palette and HUD typography.

---

## 6. Next Steps & Enhancements

* **Post-processing**: Babylon’s GlowLayer for bloom on the sun.
* **Interactive Orbits**: allow “pause orbit” or show trajectory lines.
* **Mobile Responsiveness**: adjust camera speeds, HUD scale.
* **Analytics**: track which planets (sections) users explore most.

---

This scaffold gives you a clean separation between the BabylonJS scene, the Svelte UI, and application state/routing. From here you can flesh out each planet’s GLSL shader, tailor each route’s HUD content, and add more layers of polish (sound effects, particle trails, etc.) while keeping your code fully typed, testable, and performant.


[NEXT](./next1.md)
