<script lang="ts">
		import { onMount, onDestroy, createEventDispatcher } from 'svelte';
		import {
		  MeshBuilder,
		  StandardMaterial,
		  Color3,
		  Mesh,
		  Scene,
		  Observer,
		  ActionManager,
		  ExecuteCodeAction,
		  DirectionalLight,
		  Vector3,
		  Matrix,
		} from '@babylonjs/core';
		import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
		import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
		import { SceneManager } from '$lib/3d/SceneManager.client';

		export let name: string;
		export let planetSize = 2.0;
		export let orbitRadius = 10;
		export let speed = 1;
		export let hasRing = false;
		export let ringDiameter = 2.2;
		export let ringThickness = 3.0;
		export let ringColor = [0.8, 0.8, 0.2];
		export let ringRotation = [Math.PI / 4, 0, 0];
		export let ringOuter = 2.5;
		export let ringInner = 1.5;
		export let moonCount = 0;
		export let atmosphere = false;
		export let atmoColor = [0.2, 0.6, 1.0];
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
		let ring: Mesh;
		let ringShadowGen: ShadowGenerator;
		let ringDirLight: DirectionalLight;

		onMount(async () => {
		  if (typeof window === 'undefined') return;
		  await SceneManager.instance.ready;
		  _scene = SceneManager.instance.scene;

		  // Create planet mesh and shader material
		  _mesh = MeshBuilder.CreateSphere(name, { diameter: planetSize, segments: 64 }, _scene);
		  const surfMat = new ShaderMaterial(
		    `${name}-surfMat`, _scene, '/Shaders/planet',
		    {
		      attributes: ['position', 'uv', 'normal'],
		      uniforms: [
		        'worldViewProjection', 'world', 'time',
		        'equatorColor', 'midColor', 'poleColor',
		        'noiseScale', 'noiseSpeed', 'detailMix', 'sunPosition',
		        'shadowMap', 'lightMatrix'
		      ]
		    }
		  );
		  surfMat.backFaceCulling = false;
		  surfMat.setVector3('equatorColor', { x: equatorColor[0], y: equatorColor[1], z: equatorColor[2] });
		  surfMat.setVector3('midColor', { x: midColor[0], y: midColor[1], z: midColor[2] });
		  surfMat.setVector3('poleColor', { x: poleColor[0], y: poleColor[1], z: poleColor[2] });
		  surfMat.setFloat('noiseScale', noiseScale);
		  surfMat.setFloat('noiseSpeed', noiseSpeed);
		  surfMat.setFloat('detailMix', detailMix);
		  _mesh.material = surfMat;

		  // Sun position uniform
		  const sun = _scene.getMeshByName('Sun');
		  if (sun) {
		    _scene.onBeforeRenderObservable.add(() => {
		      surfMat.setVector3('sunPosition', sun.position);
		    });
		  }

		  // Animate planet
		  _obs = _scene.onBeforeRenderObservable.add(() => {
		    const now = performance.now();
		    surfMat.setFloat('time', now * 0.001);
		    const t = now * 0.0001 * speed;
		    _mesh.position.x = Math.cos(t) * orbitRadius;
		    _mesh.position.z = Math.sin(t) * orbitRadius;

		    // --- Directional light and shadow for this planet ---
		    // Create or update the directional light for this planet
		    SceneManager.instance.createPlanetLight(name, _mesh.position);

		    // Pass shadow map and light matrix to shader
		    const shadowGen = SceneManager.instance.getPlanetShadowGen(name);
		    if (shadowGen) {
		      surfMat.setTexture('shadowMap', shadowGen.getShadowMap());
		      surfMat.setMatrix('lightMatrix', shadowGen.getTransformMatrix());
		      shadowGen.addShadowCaster(_mesh, true);
		      _mesh.receiveShadows = true;
		    }
		    // Pass world matrix for shadow mapping
		    surfMat.setMatrix('world', _mesh.getWorldMatrix());

		    // --- Ring shadow logic ---
		    if (hasRing && ring && sun) {
		      // Update ring directional light direction
		      const sunToRing = ring.getAbsolutePosition().subtract(sun.position).normalize();
		      if (ringDirLight) {
		        ringDirLight.direction = sunToRing;
		        ringDirLight.position = sun.position.clone();
		      }
		      // Update shadow generator
		      if (ringShadowGen) {
		        ringShadowGen.addShadowCaster(ring, true);
		        _mesh.receiveShadows = true;

		        // Pass ring shadow map and matrix to planet shader if needed
		        surfMat.setTexture('ringShadowMap', ringShadowGen.getShadowMap());
		        surfMat.setMatrix('ringLightMatrix', ringShadowGen.getTransformMatrix());
		      }
		    }
		  });

		  // Ring
		  if (hasRing) {
		    ring = MeshBuilder.CreateTorus(
		      `${name}-ring`,
		      {
		        diameter: planetSize + ringDiameter,
		        thickness: ringThickness,
		        tessellation: 64
		      },
		      _scene
		    );
		    ring.rotation.x = ringRotation[0];
		    ring.rotation.y = ringRotation[1];
		    ring.rotation.z = ringRotation[2];
		    const ringMat = new ShaderMaterial(`${name}-ringMat`, _scene, '/Shaders/ring', {
		      attributes: ['position', 'uv'],
		      uniforms: [
		        'worldViewProjection', 'color', 'outerRadius', 'innerRadius',
		        'sunPosition', 'shadowMap', 'lightMatrix'
		      ]
		    });
		    ringMat.setVector3('color', { x: ringColor[0], y: ringColor[1], z: ringColor[2] });
		    ringMat.setFloat('outerRadius', ringOuter);
		    ringMat.setFloat('innerRadius', ringInner);
		    if (sun) {
		      _scene.onBeforeRenderObservable.add(() => {
		        ringMat.setVector3('sunPosition', sun.position);
		      });
		    }
		    ring.material = ringMat;
		    ring.parent = _mesh;

		    // --- Ring directional light and shadow ---
		    if (sun) {
		      // Create a directional light from sun to ring
		      const sunToRing = ring.getAbsolutePosition().subtract(sun.position).normalize();
		      ringDirLight = new DirectionalLight(`${name}-ringDirLight`, sunToRing, _scene);
		      ringDirLight.position = sun.position.clone();
		      ringDirLight.intensity = 2.0;
		      ringShadowGen = new ShadowGenerator(1024, ringDirLight);
		      ringShadowGen.useExponentialShadowMap = true;
		      ringShadowGen.bias = 0.0005;
		      ringShadowGen.addShadowCaster(ring, true);
		      _mesh.receiveShadows = true;
		      // Pass shadow map and matrix to ring shader
		      ringMat.setTexture('shadowMap', ringShadowGen.getShadowMap());
		      ringMat.setMatrix('lightMatrix', ringShadowGen.getTransformMatrix());
		    }
		  }

		  // Atmosphere
		  if (atmosphere) {
		    const atmoSphere = MeshBuilder.CreateSphere(
		      `${name}-atmo`, { diameter: planetSize + 0.15, segments: 32 }, _scene
		    );
		    const atmoMat = new ShaderMaterial(
		      `${name}-atmoMat`, _scene, '/Shaders/atmo',
		      { attributes: ['position'], uniforms: ['worldViewProjection', 'cameraPosition', 'atmoColor', 'coef', 'power'] }
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
		    mat.diffuseColor = new Color3(0.8, 0.8, 0.8);
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