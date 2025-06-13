// src/lib/babylon/entities/createComet.ts
import {
    MeshBuilder,
    Scene,
    TransformNode,
    StandardMaterial,
    Color3,
    Color4,
    ParticleSystem,
    Texture,
    Vector3,
    TrailMesh,
    // ArcRotateCamera
  } from '@babylonjs/core';
  
  export function createComet(scene: Scene, sunPosition: Vector3): TransformNode {
    const cometRoot = new TransformNode("cometRoot", scene);
  
    // === Comet Core ===
    const core = MeshBuilder.CreateSphere("cometCore", { diameter: 1.2 }, scene);
      core.parent = cometRoot;
      core.isVisible = false;
  
    const mat = new StandardMaterial("cometMat", scene);
    mat.emissiveColor = new Color3(0.8, 0.8, 1);
    mat.diffuseColor = Color3.Black();
      core.material = mat;
      
      const trail = new TrailMesh("cometTrail", core, scene, 60, 0.4, true);
      const trailMat = new StandardMaterial("trailMat", scene);
      trailMat.emissiveColor = new Color3(0.6, 0.8, 1.0);
      trailMat.alpha = 0.5;
      trail.material = trailMat;
      
  
    // === Particle Tail ===
    const particleSystem = new ParticleSystem("cometTail", 2000, scene);
    particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png", scene);
    particleSystem.emitter = core;
    particleSystem.minEmitBox = new Vector3(0, 0, 0);
    particleSystem.maxEmitBox = new Vector3(0, 0, 0);
  
    // Tail direction is away from the sun
    particleSystem.direction1 = new Vector3(1, 0, 0);
    particleSystem.direction2 = new Vector3(1.5, 0.2, -0.2);
    particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new Color4(0.4, 0.6, 1.0, 1.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.4;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 0.8;
    particleSystem.emitRate = 300;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
    particleSystem.gravity = Vector3.Zero();
    particleSystem.direction1.scaleInPlace(-1);
    particleSystem.direction2.scaleInPlace(-1);
  
    particleSystem.start();
  
    // === Orbit Logic ===
    let angle = 0;
    const radiusX = 40;
    const radiusZ = 20;
  
    scene.onBeforeRenderObservable.add(() => {
      angle += 0.001;
      const x = Math.cos(angle) * radiusX;
      const z = Math.sin(angle) * radiusZ;
      const position = new Vector3(x, 0, z);
      cometRoot.position.copyFrom(position);
  
      // Tail always faces away from sun
      const toSun = sunPosition.subtract(position).normalize().scale(-1);
      particleSystem.direction1 = toSun.add(new Vector3(0.3, 0.1, 0)).normalize();
        particleSystem.direction2 = toSun.add(new Vector3(-0.3, -0.1, 0)).normalize();
        
        trail.update();
    });
  
    return cometRoot;
  }
  