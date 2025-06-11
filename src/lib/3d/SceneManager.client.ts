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
    type Nullable,
    Observer,
} from '@babylonjs/core';

export type BeforeRenderCallback = (scene: Scene) => void;

export class SceneManager {
    private static _instance: SceneManager;
    public engine!: Engine;
    public scene!: Scene;
    public mainCamera!: ArcRotateCamera;
    private _beforeRenderObserver: Nullable<Observer<Scene>> = null;
    public ready: Promise<void>; // Promise to indicate readiness
    private _resolveReady!: () => void;

    private defaultCameraTarget = Vector3.Zero(); // Default camera target
    private defaultCameraRadius = 40; // Default camera radius
    private followObserver: Nullable<Observer<Scene>> = null;

    private constructor() {
        this.ready = new Promise((resolve) => {
            this._resolveReady = resolve;
        });
    }

    public static get instance(): SceneManager {
        if (!this._instance) {
            this._instance = new SceneManager();
        }
        return this._instance;
    }

    /**
     * Initialize BabylonJS with our canvas, camera, lights, and render loop.
     */
    public init(canvas: HTMLCanvasElement): void {
        if (typeof window === 'undefined' || !canvas) {
            console.error('SceneManager.init: Canvas is not available or running in a non-browser environment.');
            return; // Ensure this runs only in the browser and with a valid canvas
        }

        // 1) Create engine and scene
        this.engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: true });
        this.scene = new Scene(this.engine);

        // 2) Main orbit camera
        this.mainCamera = new ArcRotateCamera(
          'MainCamera',
          Math.PI / 2,
          Math.PI / 2.5,
          40,
          Vector3.Zero(),
          this.scene
        );
        this.mainCamera.attachControl(canvas, true);
        this.mainCamera.wheelDeltaPercentage = 0.01;

        // 3) Lighting: a point‐light “sun” + ambient
        const sunSphere = MeshBuilder.CreateSphere('Sun', { diameter: 4 }, this.scene);
        // (You would later apply an emissive shader to this mesh)

        const sunLight = new PointLight('SunLight', Vector3.Zero(), this.scene);
        sunLight.intensity = 2;

        new HemisphericLight('AmbientLight', new Vector3(0, 1, 0), this.scene);

        // 4) Render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // 5) Handle resize
        window.addEventListener('resize', () => this.engine.resize());

        // Resolve the ready promise
        this._resolveReady();
    }

    /**
     * Registers a callback that's called on every frame, before render.
     * Useful for animating planets, rings, etc.
     */
    public registerBeforeRender(fn: BeforeRenderCallback): void {
        if (this._beforeRenderObserver) {
            this.scene.onBeforeRenderObservable.remove(this._beforeRenderObserver);
        }
        this._beforeRenderObserver = this.scene.onBeforeRenderObservable.add(() => fn(this.scene));
    }

    /**
     * Smoothly animates camera.target and radius to focus on a mesh.
     * @param meshName The name of the mesh to zoom into.
     * @param durationMs Animation duration in milliseconds (default 800ms)
     */
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

        // Animate camera target
        const fromTarget = this.mainCamera.target.clone();
        const toTarget = mesh.getAbsolutePosition();

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

        // Animate radius
        const fromRadius = this.mainCamera.radius;
        const toRadius = mesh.getBoundingInfo().boundingSphere.radius * 4;

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

        // Easing
        const ease = new CubicEase();
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        targetAnim.setEasingFunction(ease);
        radiusAnim.setEasingFunction(ease);

        // Apply animations
        this.mainCamera.animations = [targetAnim, radiusAnim];
        this.scene.beginAnimation(this.mainCamera, 0, 100, false, 1);
    }

    /**
     * Follow a planet by its mesh name.
     * @param meshName The name of the mesh to follow.
     */
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

        // Remove any existing follow observer
        if (this.followObserver) {
            this.scene.onBeforeRenderObservable.remove(this.followObserver);
        }

        // Add an observer to follow the planet
        this.followObserver = this.scene.onBeforeRenderObservable.add(() => {
            const planetPosition = mesh.getAbsolutePosition();
            this.mainCamera.target = planetPosition;
        });
    }

    /**
     * Reset the camera to its default position.
     */
    public resetCamera(): void {
        if (!this.scene || !this.mainCamera) {
            console.error('SceneManager.resetCamera: Scene or camera is not initialized.');
            return;
        }

        // Remove the follow observer
        if (this.followObserver) {
            this.scene.onBeforeRenderObservable.remove(this.followObserver);
            this.followObserver = null;
        }

        // Smoothly animate the camera back to the default position
        const targetAnim = new Animation(
            'resetCameraTargetAnim',
            'target',
            60,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        targetAnim.setKeys([
            { frame: 0, value: this.mainCamera.target.clone() },
            { frame: 100, value: this.defaultCameraTarget },
        ]);

        const radiusAnim = new Animation(
            'resetCameraRadiusAnim',
            'radius',
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        radiusAnim.setKeys([
            { frame: 0, value: this.mainCamera.radius },
            { frame: 100, value: this.defaultCameraRadius },
        ]);

        const ease = new CubicEase();
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        targetAnim.setEasingFunction(ease);
        radiusAnim.setEasingFunction(ease);

        this.mainCamera.animations = [targetAnim, radiusAnim];
        this.scene.beginAnimation(this.mainCamera, 0, 100, false, 1);
    }

    /**
     * Dispose of the engine & scene (call on unmount or full teardown).
     */
    public dispose(): void {
        if (typeof window === 'undefined') return; // Ensure this runs only in the browser

        window.removeEventListener('resize', () => this.engine.resize());
        this.scene.dispose();
        this.engine.dispose();
    }
}
