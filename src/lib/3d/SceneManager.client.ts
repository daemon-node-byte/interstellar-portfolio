import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    PointLight,
    Animation,
    EasingFunction,
    CubicEase,
    GlowLayer,
    StandardMaterial,
    Color3,
    Color4,
    type Nullable,
    Observer,
    ShaderMaterial,
    Mesh,
} from '@babylonjs/core';

export type BeforeRenderCallback = (scene: Scene) => void;

export class SceneManager {
    private static _instance: SceneManager;
    public engine!: Engine;
    public scene!: Scene;
    public mainCamera!: ArcRotateCamera;
    private _beforeRenderObserver: Nullable<Observer<Scene>> = null;
    public ready: Promise<void>;
    private _resolveReady!: () => void;

    private readonly defaultCameraTarget = Vector3.Zero();
    private readonly defaultCameraRadius = 40;
    private followObserver: Nullable<Observer<Scene>> = null;
    private glowLayer!: GlowLayer;
    private plasmaMat!: ShaderMaterial;

    private constructor() {
        this.ready = new Promise(resolve => { this._resolveReady = resolve; });
    }

    public static get instance(): SceneManager {
        return this._instance ??= new SceneManager();
    }

    public init(canvas: HTMLCanvasElement): void {
        if (typeof window === 'undefined' || !canvas) {
            console.error('SceneManager.init: Canvas is not available or running in a non-browser environment.');
            return;
        }

        this.engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: true });
        this.scene = new Scene(this.engine);

        // Set a dark background color
        this.scene.clearColor = new Color4(0.02, 0.02, 0.07, 1);

        // Starfield generation
        this._createStarfield();

        this.mainCamera = new ArcRotateCamera(
          'MainCamera',
          Math.PI / 2,
          Math.PI / 2.5,
          this.defaultCameraRadius,
          this.defaultCameraTarget,
          this.scene
        );
        this.mainCamera.attachControl(canvas, true);
        this.mainCamera.wheelDeltaPercentage = 0.01;

        const sunSphere = MeshBuilder.CreateSphere('Sun', { diameter: 4 }, this.scene);
        const sunLight = new PointLight('SunLight', Vector3.Zero(), this.scene);
        sunLight.intensity = 200;
        new HemisphericLight('AmbientLight', new Vector3(0, 0, 0), this.scene);

        const sunMaterial = new StandardMaterial('SunMaterial', this.scene);
        sunMaterial.emissiveColor = new Color3(100, 7.0, 2.0);
        sunSphere.material = sunMaterial;

        this.glowLayer = new GlowLayer('GlowLayer', this.scene);
        this.glowLayer.intensity = 1.5;
        this.glowLayer.referenceMeshToUseItsOwnMaterial(sunSphere);

        const plasmaSphere = MeshBuilder.CreateSphere('sunPlasma', { diameter: 5.2, segments: 32 }, this.scene);
        this.plasmaMat = new ShaderMaterial(
          'plasmaMat',
          this.scene,
          '/Shaders/solarPlasma',
          {
              attributes: ['position', 'uv'],
              uniforms: ['worldViewProjection', 'time'],
              needAlphaBlending: true,
          }
        );
        this.plasmaMat.alpha = 0.8;
        this.plasmaMat.backFaceCulling = false;
        plasmaSphere.material = this.plasmaMat;
        plasmaSphere.parent = sunSphere;

        this.scene.onBeforeRenderObservable.add(() => {
            this.plasmaMat.setFloat('time', performance.now() * 0.001);
        });

        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener('resize', () => this.engine.resize());

        this._resolveReady();
    }

    public registerBeforeRender(fn: BeforeRenderCallback): void {
        if (this._beforeRenderObserver) {
            this.scene.onBeforeRenderObservable.remove(this._beforeRenderObserver);
        }
        this._beforeRenderObserver = this.scene.onBeforeRenderObservable.add(() => fn(this.scene));
    }

    public zoomTo(meshName: string, durationMs = 800): void {
        if (!this.scene || !this.mainCamera) {
            console.error('SceneManager.zoomTo: Scene or camera is not initialized.');
            return;
        }
        const mesh = this.scene.getMeshByName(meshName);
        if (!mesh) {
            console.warn(`SceneManager.zoomTo: no mesh named "${meshName}"`);
            return;
        }

        const toTarget = mesh.getAbsolutePosition();
        const toRadius = mesh.getBoundingInfo().boundingSphere.radius * 4;

        this.animateCamera(this.mainCamera.target.clone(), toTarget, this.mainCamera.radius, toRadius);
    }

    public followPlanet(meshName: string): void {
        if (!this.scene || !this.mainCamera) {
            console.error('SceneManager.followPlanet: Scene or camera is not initialized.');
            return;
        }
        const mesh = this.scene.getMeshByName(meshName);
        if (!mesh) {
            console.warn(`SceneManager.followPlanet: No mesh named "${meshName}"`);
            return;
        }
        if (this.followObserver) {
            this.scene.onBeforeRenderObservable.remove(this.followObserver);
        }
        this.followObserver = this.scene.onBeforeRenderObservable.add(() => {
            this.mainCamera.target = mesh.getAbsolutePosition();
        });
    }

    public resetCamera(): void {
        if (!this.scene || !this.mainCamera) {
            console.error('SceneManager.resetCamera: Scene or camera is not initialized.');
            return;
        }
        if (this.followObserver) {
            this.scene.onBeforeRenderObservable.remove(this.followObserver);
            this.followObserver = null;
        }
        this.animateCamera(
          this.mainCamera.target.clone(),
          this.defaultCameraTarget,
          this.mainCamera.radius,
          this.defaultCameraRadius
        );
    }

    private animateCamera(fromTarget: Vector3, toTarget: Vector3, fromRadius: number, toRadius: number): void {
        const targetAnim = new Animation(
          'cameraTargetAnim',
          'target',
          60,
          Animation.ANIMATIONTYPE_VECTOR3,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        targetAnim.setKeys([
            { frame: 0, value: fromTarget },
            { frame: 100, value: toTarget },
        ]);

        const radiusAnim = new Animation(
          'cameraRadiusAnim',
          'radius',
          60,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        radiusAnim.setKeys([
            { frame: 0, value: fromRadius },
            { frame: 100, value: toRadius },
        ]);

        const ease = new CubicEase();
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        targetAnim.setEasingFunction(ease);
        radiusAnim.setEasingFunction(ease);

        this.mainCamera.animations = [targetAnim, radiusAnim];
        this.scene.beginAnimation(this.mainCamera, 0, 100, false, 1);
    }

    /**
     * Creates a distant starfield using a large inverted sphere and a procedural shader.
     */
    private _createStarfield(): void {
        const starfieldSphere = MeshBuilder.CreateSphere('Starfield', { diameter: 400, segments: 32 }, this.scene);
        starfieldSphere.infiniteDistance = true;
        starfieldSphere.isPickable = false;

        // Simple procedural starfield shader
        const starfieldMat = new ShaderMaterial(
            'starfieldMat',
            this.scene,
            // Inline shader code for brevity; in production, use external .fx files
            '/Shaders/starfield',
            {
                attributes: ['position', 'uv'],
                uniforms: ['worldViewProjection', 'time'],
                needAlphaBlending: false,
            }
        );
        starfieldMat.backFaceCulling = false;
        starfieldSphere.material = starfieldMat;
        starfieldSphere.renderingGroupId = 0;
    }

    public dispose(): void {
        if (typeof window === 'undefined') return;
        window.removeEventListener('resize', () => this.engine.resize());
        this.scene.dispose();
        this.engine.dispose();
    }
}