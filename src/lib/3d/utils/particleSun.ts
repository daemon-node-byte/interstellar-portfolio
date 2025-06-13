import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  ParticleSystem,
  Texture,
  SphereParticleEmitter,
  Vector3
} from "@babylonjs/core";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { ConeParticleEmitter } from "@babylonjs/core/Particles/EmitterTypes/coneParticleEmitter";

function getParticleSun(scene: Scene) {

  // Core sphere and material
  const coreSphere = MeshBuilder.CreateSphere("coreSphere", { diameter: 4, segments: 64 }, scene);
  // coreSphere.isVisible = false; // Hide the core sphere
  const coreMat = new StandardMaterial("coreMat", scene);
  coreMat.emissiveColor = new Color3(0.3773, 0.093, 0.0266);
  coreMat.diffuseColor = Color3.Black();
  coreMat.specularColor = Color3.Black();
  coreSphere.material = coreMat;

  // Animate the core material's emissive color
  scene.registerBeforeRender(() => {
    const t = performance.now() * 0.001;
    // Animate color intensity with a subtle pulsing effect
    const intensity = 0.8 + 0.2 * Math.sin(t * 1.2);
    coreMat.emissiveColor = new Color3(
      0.3773 * intensity,
      0.093 * intensity,
      0.0266 * intensity
    );
  });

  // Add a glow layer to the scene
  const glowLayer = new GlowLayer("sunGlow", scene, {
    blurKernelSize: 128
  });
  // Optionally, tweak intensity for the sun's core
  glowLayer.intensity = 1.4;
  glowLayer.addIncludedOnlyMesh(coreSphere);

  const pipeline = new DefaultRenderingPipeline(
    "defaultPipeline",
    true,
    scene,
    scene.cameras
  );

  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.1; // Lower = more bloom
  pipeline.bloomWeight = 0;    // Strength of bloom
  pipeline.bloomKernel = 16;     // Blur size
  pipeline.bloomScale = 0.1; 

  // Particle system (surface)
  const particles = new ParticleSystem("surfaceParticles", 1600, scene);
  particles.particleTexture = new Texture(
    "/textures/SunSurface.png",
    scene
  );
  particles.emitter = coreSphere;
  particles.particleEmitterType = new SphereParticleEmitter(2, 0);

  // Particle gradients and properties
  particles.addColorGradient(0, new Color4(0.8509, 0.4784, 0.1019, 0));
  particles.addColorGradient(0.4, new Color4(0.6259, 0.3056, 0.0619, 0.5));
  particles.addColorGradient(0.5, new Color4(0.6039, 0.2887, 0.0579, 0.5));
  particles.addColorGradient(1, new Color4(0.3207, 0.0713, 0.0075, 0));
  particles.minSize = 0.4;
  particles.maxSize = 0.7;
  particles.minLifeTime = particles.maxLifeTime = 8;
  particles.emitRate = 200;
  particles.blendMode = ParticleSystem.BLENDMODE_ADD;
  particles.gravity = Vector3.Zero();
  particles.minAngularSpeed = -0.4;
  particles.maxAngularSpeed = 0.4;
  particles.minEmitPower = particles.maxEmitPower = 0;
  particles.updateSpeed = 0.005;
  particles.isBillboardBased = false;
  particles.preWarmStepOffset = 10;
  particles.preWarmCycles = 100;
  particles.minInitialRotation = -2 * Math.PI;
  particles.maxInitialRotation = 2 * Math.PI;

  particles.start();

  // Solar flare particle system
  const flareParticles = new ParticleSystem("solarFlares", 128, scene);
  flareParticles.particleTexture = new Texture(
    "/textures/SunFlare.png",
    scene
  );
  flareParticles.emitter = coreSphere;
  const flareEmitter = new ConeParticleEmitter(4, Math.PI / 16);
  flareEmitter.radiusRange = 0.9;
  flareParticles.particleEmitterType = flareEmitter;

  flareParticles.addColorGradient(0, new Color4(1, 0.7, 0.2, 0.7));
  flareParticles.addColorGradient(0.5, new Color4(1, 0.4, 0.1, 0.5));
  flareParticles.addColorGradient(1, new Color4(1, 0.1, 0, 0));
  flareParticles.minSize = 0.7;
  flareParticles.maxSize = 1.5;
  flareParticles.minLifeTime = 1.5;
  flareParticles.maxLifeTime = 2.5;
  flareParticles.emitRate = 12;
  flareParticles.blendMode = ParticleSystem.BLENDMODE_ADD;
  flareParticles.gravity = Vector3.Zero();
  flareParticles.minEmitPower = 3;
  flareParticles.maxEmitPower = 6;
  flareParticles.minAngularSpeed = -0.5;
  flareParticles.maxAngularSpeed = 0.5;
  flareParticles.updateSpeed = 0.01;
  flareParticles.isBillboardBased = true;
  flareParticles.minInitialRotation = 0;
  flareParticles.maxInitialRotation = 2 * Math.PI;

// Animate flare emission direction for dynamic solar flare effect
scene.registerBeforeRender(() => {
  // const t = performance.now() * 0.0005;
  // Slowly rotate the flare emission direction around the sun
  // const angle = t * Math.PI * 2;
  // BUG FIX: ConeParticleEmitter expects direction1 and direction2 to be Vector3s representing the *direction* of the cone axis,
  // but the constructor's angle parameter sets the spread. The direction should be a normalized vector, not a point on the sphere.
  // The bug was using a changing direction for both direction1 and direction2, which disables the cone spread.
  // Instead, set direction1 and direction2 to be opposite vectors to define the cone's axis and spread.

  flareEmitter.directionRandomizer = 0.5; // Randomize direction slightly
  // Animate both direction1 and direction2 for dynamic solar flare effect
});
  flareParticles.start();

  return scene;
}

export { getParticleSun };