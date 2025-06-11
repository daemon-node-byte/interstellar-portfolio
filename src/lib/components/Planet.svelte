<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import {
		MeshBuilder,
		ActionManager,
		ExecuteCodeAction,
		StandardMaterial,
		Texture,
		Scene,
		Observer,
		Mesh, // Import Mesh explicitly
	} from '@babylonjs/core';
	import { SceneManager } from '$lib/3d/SceneManager.client';

	export let name: string;
	export let orbitRadius: number = 10;
	export let speed: number = 1;

	const dispatch = createEventDispatcher();

	let _scene: Scene;
	let _mesh: Mesh; // Use Mesh directly
	let _obs: Observer<Scene>;

	onMount(async () => {
		if (typeof window === 'undefined') return; // Ensure this runs only in the browser

		// Wait for SceneManager to be ready
		await SceneManager.instance.ready;

		// 1) grab the scene
		_scene = SceneManager.instance.scene;
		if (!_scene) {
			console.error('Planet: SceneManager.scene is not initialized.');
			return;
		}

		// 2) create the planet mesh
		_mesh = MeshBuilder.CreateSphere(name, { diameter: 2 }, _scene);
		if (!_mesh) {
			console.error(`Planet: Failed to create mesh for planet "${name}".`);
			return;
		}

		// 3) apply a StandardMaterial with a texture (swap in your GLSL shader if you like)
		const mat = new StandardMaterial(`${name}-mat`, _scene);
		mat.diffuseTexture = new Texture(`/textures/${name}.jpg`, _scene);
		mat.specularPower = 64;
		_mesh.material = mat;

		// 4) set initial position on orbit
		const initAngle = Math.random() * Math.PI * 2;
		_mesh.position.x = Math.cos(initAngle) * orbitRadius;
		_mesh.position.z = Math.sin(initAngle) * orbitRadius;

		// 5) animate orbit every frame
		_obs = _scene.onBeforeRenderObservable.add(() => {
			const t = performance.now() * 0.0001 * speed;
			_mesh.position.x = Math.cos(t + initAngle) * orbitRadius;
			_mesh.position.z = Math.sin(t + initAngle) * orbitRadius;
		});

		// 6) click handling
		_mesh.actionManager = new ActionManager(_scene);
		_mesh.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
				dispatch('select', { name });
			})
		);
	});

	onDestroy(() => {
		// remove render observer
		if (_obs) {
			_scene.onBeforeRenderObservable.remove(_obs);
		}
		// dispose mesh & material
		_mesh?.material?.dispose();
		_mesh?.dispose();
	});
</script>

<!-- No visible HTML: this purely lives in the 3D canvas -->
