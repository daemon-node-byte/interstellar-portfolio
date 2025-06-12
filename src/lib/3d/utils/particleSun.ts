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

function getParticleSun(scene: Scene) {

  // Core sphere and material
  const coreSphere = MeshBuilder.CreateSphere("coreSphere", { diameter: 4, segments: 64 }, scene);
  // coreSphere.isVisible = false; // Hide the core sphere
  const coreMat = new StandardMaterial("coreMat", scene);
  coreMat.emissiveColor = new Color3(0.3773, 0.093, 0.0266);
  coreMat.diffuseColor = Color3.Black();
  coreMat.specularColor = Color3.Black();
  coreSphere.material = coreMat;

  // Particle system
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

  return scene;
}

export { getParticleSun };