<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import {
		MeshBuilder,
		StandardMaterial,
		Texture,
		Scene,
		Observer,
		ActionManager,
		ExecuteCodeAction,
		Color3,
		Mesh,
	} from '@babylonjs/core';
	import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
	import { SceneManager } from '$lib/3d/SceneManager.client';

	export let name: string;
	export let orbitRadius = 10;
	export let speed = 1;
	export let hasRing = false;
	export let ringInner = 2.2;
	export let ringOuter = 3.0;
	export let ringColor = [0.8, 0.8, 0.2];
	export let moonCount = 0;
	export let atmosphere = false;
	export let atmoColor = [0.2, 0.6, 1.0];

	// Add planet appearance props
	export let equatorColor = [0.2, 0.5, 0.8];
	export let midColor = [0.1, 0.3, 0.1];
	export let poleColor = [0.8, 0.8, 0.9];
	export let noiseScale = 5.0;
	export let noiseSpeed = 0.05;
	export let detailMix = 0.5;

	const dispatch = createEventDispatcher();
	let _scene: Scene;
	let _mesh: Mesh;
	let _obs: Observer<Scene>;
	const moons: Mesh[] = [];

	onMount(async () => {
		if (typeof window === 'undefined') return;
		await SceneManager.instance.ready;
		_scene = SceneManager.instance.scene;

		// Planet surface
		const surfMat = new ShaderMaterial(
			`${name}-surfMat`, _scene, '/Shaders/planet',
			{
				attributes: ['position','uv','normal'],
				uniforms: [
					'worldViewProjection','time',
					'equatorColor','midColor','poleColor',
					'noiseScale','noiseSpeed','detailMix'
				]
			}
		);
		surfMat.backFaceCulling = false;

		// Set planet-specific uniforms
		surfMat.setVector3('equatorColor', { x: equatorColor[0], y: equatorColor[1], z: equatorColor[2] });
		surfMat.setVector3('midColor', { x: midColor[0], y: midColor[1], z: midColor[2] });
		surfMat.setVector3('poleColor', { x: poleColor[0], y: poleColor[1], z: poleColor[2] });
		surfMat.setFloat('noiseScale', noiseScale);
		surfMat.setFloat('noiseSpeed', noiseSpeed);
		surfMat.setFloat('detailMix', detailMix);

		_mesh = MeshBuilder.CreateSphere(name, { diameter: 2, segments: 64 }, _scene);
		_mesh.material = surfMat;

		// Animate planet
		_obs = _scene.onBeforeRenderObservable.add(() => {
			const now = performance.now();
			surfMat.setFloat('time', now * 0.001);
			const t = now * 0.0001 * speed;
			_mesh.position.x = Math.cos(t) * orbitRadius;
			_mesh.position.z = Math.sin(t) * orbitRadius;
		});

		// Ring
		if (hasRing) {
			const ring = MeshBuilder.CreateTorus(
				`${name}-ring`,
				{
					diameter: ringInner + ringOuter,
					thickness: ringOuter - ringInner,
					tessellation: 128
				},
				_scene
			);
			ring.rotation.x = Math.PI / 2;
			// Use StandardMaterial for guaranteed rendering
			const ringMat = new StandardMaterial(`${name}-ringMat`, _scene);
			ringMat.diffuseColor = new Color3(ringColor[0], ringColor[1], ringColor[2]);
			ringMat.specularColor = Color3.Black();
			ringMat.emissiveColor = new Color3(ringColor[0], ringColor[1], ringColor[2]);
			ringMat.alpha = 0.6;
			ring.material = ringMat;
			ring.parent = _mesh;
			ring.isPickable = false;
		}

		// Atmosphere
		if (atmosphere) {
			const atmoSphere = MeshBuilder.CreateSphere(
				`${name}-atmo`, { diameter: 2.2, segments: 32 }, _scene
			);
			const atmoMat = new ShaderMaterial(
				`${name}-atmoMat`, _scene, '/Shaders/atmo',
				{ attributes: ['position'], uniforms: ['worldViewProjection','cameraPosition','atmoColor','coef','power'] }
			);
			atmoMat.backFaceCulling = true;
			atmoMat.alpha = 0.5;
			atmoSphere.material = atmoMat;
			atmoSphere.parent = _mesh;
			_scene.onBeforeRenderObservable.add(() => {
				atmoMat.setVector3('cameraPosition', _scene.activeCamera!.position);
			});
			atmoMat.setVector3('atmoColor', { x: atmoColor[0], y: atmoColor[1], z: atmoColor[2] });
			atmoMat.setFloat('coef', 0.1);
			atmoMat.setFloat('power', 2.0);
		}

		// Moons
		for (let i = 0; i < moonCount; i++) {
			const m = MeshBuilder.CreateSphere(`${name}-moon-${i}`, { diameter: 0.4 }, _scene);
			const mat = new StandardMaterial(`${name}-moonMat-${i}`, _scene);
			mat.diffuseColor = new Color3(0.8,0.8,0.8);
			m.material = mat;
			m.parent = _mesh;
			moons.push(m);
		}
		if (moonCount > 0) {
			_scene.onBeforeRenderObservable.add(() => {
				const t = performance.now() * 0.0002;
				moons.forEach((m, idx) => {
					const radius = orbitRadius * 0.2 + idx * 0.8;
					m.position.x = Math.cos(t + idx) * radius;
					m.position.z = Math.sin(t + idx) * radius;
				});
			});
		}

		// Click handling
		_mesh.actionManager = new ActionManager(_scene);
		_mesh.actionManager.registerAction(
			new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
				dispatch('select', { name });
			})
		);
	});

	onDestroy(() => {
		_scene.onBeforeRenderObservable.remove(_obs);
		_mesh.dispose();
		moons.forEach(m => m.dispose());
	});
</script>