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
    Quaternion
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
  export let moonOrbitAxes: Array<[number, number, number]> = [];

  const dispatch = createEventDispatcher();
  let _scene: Scene, _mesh: Mesh, ring: Mesh;
  const moons: Mesh[] = [];
  let _observers: Observer<Scene>[] = [];

  // Helper to generate a pseudo-random value per moon (deterministic per planet)
  function moonRand(seed: number) {
    // Simple LCG for deterministic pseudo-random
    return Math.sin(seed * 999 + name.length * 17) * 10000 % 1;
  }

  onMount(async () => {
    if (typeof window === 'undefined') return;
    await SceneManager.instance.ready;
    _scene = SceneManager.instance.scene;

    // Create planet mesh and shader material
    _mesh = MeshBuilder.CreateSphere(name, { diameter: planetSize, segments: 64 }, _scene);
    const sunShadowGen = SceneManager.instance.getSunShadowGenerator();
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

    if (sunShadowGen) {
      sunShadowGen.addShadowCaster(_mesh, true);
      _mesh.receiveShadows = true;
      const shadowMap = sunShadowGen.getShadowMap();
      if (shadowMap) surfMat.setTexture('shadowMap', shadowMap);
      surfMat.setMatrix('lightMatrix', sunShadowGen.getTransformMatrix());
    }

    _observers.push(_scene.onBeforeRenderObservable.add(() => {
      const now = performance.now();
      surfMat.setFloat('time', now * 0.001);
      const t = now * 0.0001 * speed;
      _mesh.position.x = Math.cos(t) * orbitRadius;
      _mesh.position.z = Math.sin(t) * orbitRadius;
      surfMat.setMatrix('world', _mesh.getWorldMatrix());
    }));

    if (hasRing) {
      ring = MeshBuilder.CreateTorus(
        `${name}-ring`,
        { diameter: planetSize + ringDiameter, thickness: ringThickness, tessellation: 64 },
        _scene
      );
      if (sunShadowGen) {
        sunShadowGen.addShadowCaster(ring, true);
        ring.receiveShadows = true;
      }
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
      ring.material = ringMat;
      ring.parent = _mesh;
      if (sunShadowGen) {
        const shadowMap = sunShadowGen.getShadowMap();
        if (shadowMap) ringMat.setTexture('shadowMap', shadowMap);
        ringMat.setMatrix('lightMatrix', sunShadowGen.getTransformMatrix());
      }
    }

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
      _observers.push(_scene.onBeforeRenderObservable.add(() => {
        atmoMat.setVector3('cameraPosition', _scene.activeCamera!.position);
      }));
      atmoMat.setVector3('atmoColor', { x: atmoColor[0], y: atmoColor[1], z: atmoColor[2] });
      atmoMat.setFloat('coef', 0.1);
      atmoMat.setFloat('power', 2.0);
    }

    for (let i = 0; i < moonCount; i++) {
      const m = MeshBuilder.CreateSphere(`${name}-moon-${i}`, { diameter: 0.4 }, _scene);
      if (sunShadowGen) {
        sunShadowGen.addShadowCaster(m, true);
        m.receiveShadows = true;
      }
      const mat = new StandardMaterial(`${name}-moonMat-${i}`, _scene);
      mat.diffuseColor = new Color3(0.8, 0.8, 0.8);
      m.material = mat;
      m.parent = _mesh;
      moons.push(m);
    }
    if (moonCount > 0) {
      _observers.push(_scene.onBeforeRenderObservable.add(() => {
        const t = performance.now() * 0.0002;
        moons.forEach((m, idx) => {
          const baseRadius = orbitRadius * 0.08 + 0.025;
          const baseSpeed = 1 + moonRand(idx + 2) * 1.5;
          const axisArr = moonOrbitAxes[idx] || [0, 1, 0];
          const axis = new Vector3(axisArr[0], axisArr[1], axisArr[2]).normalize();
          let pos = new Vector3(
            Math.cos(t * baseSpeed + idx) * baseRadius,
            0,
            Math.sin(t * baseSpeed + idx) * baseRadius
          );
          if (!(axis.x === 0 && axis.y === 1 && axis.z === 0)) {
            const up = new Vector3(0, 1, 0);
            const q = new Quaternion();
            Quaternion.FromUnitVectorsToRef(up, axis, q);
            const rotMat = Matrix.Identity();
            q.toRotationMatrix(rotMat);
            pos = Vector3.TransformCoordinates(pos, rotMat);
          }
          m.position = pos;
        });
      }));
    }

    _mesh.actionManager = new ActionManager(_scene);
    _mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, () => dispatch('select', { name }))
    );
  });

  onDestroy(() => {
    if (_scene && _observers.length) _observers.forEach(obs => _scene.onBeforeRenderObservable.remove(obs));
    if (_mesh) _mesh.dispose();
    moons.forEach(m => m.dispose());
  });
</script>