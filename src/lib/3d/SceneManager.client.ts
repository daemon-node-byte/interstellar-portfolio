import {
    Engine, Scene, ArcRotateCamera, Vector3, MeshBuilder,
    Animation, CubicEase, Color4,
    type Nullable, Observer, ShaderMaterial, ShadowGenerator, DirectionalLight, Matrix, Texture,
} from '@babylonjs/core';
import { getParticleSun } from './utils/particleSun';

export type BeforeRenderCallback = (scene: Scene) => void;

export class SceneManager {
    private static _instance: SceneManager;
    public engine!: Engine;
    public scene!: Scene;
    public mainCamera!: ArcRotateCamera;
    public ready: Promise<void>;
    private _resolveReady!: () => void;
    private _beforeRenderObserver: Nullable<Observer<Scene>> = null;
    private followObserver: Nullable<Observer<Scene>> = null;
    private planetLights = new Map<string, { light: DirectionalLight, shadowGen: ShadowGenerator }>();
    private readonly defaultCameraTarget = Vector3.Zero();
    private readonly defaultCameraRadius = 40;
    private _resizeHandler = () => this.engine.resize();

    private constructor() {
        this.ready = new Promise(resolve => { this._resolveReady = resolve; });
    }

    public static get instance(): SceneManager {
        return this._instance ??= new SceneManager();
    }

    public init(canvas: HTMLCanvasElement): void {
        if (typeof window === 'undefined' || !canvas) return;

        this.engine = new Engine(canvas, true, { stencil: true, preserveDrawingBuffer: true });
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0.02, 0.02, 0.07, 1);

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

        // Sun and lighting
        const sunSphere = MeshBuilder.CreateSphere('Sun', { diameter: 4 }, this.scene);
        sunSphere.isVisible = false;
        const sunLight = new DirectionalLight('SunLight', new Vector3(0, -1, 0), this.scene);
        sunLight.position = Vector3.Zero();
        sunLight.intensity = 1;
        new ShadowGenerator(2048, sunLight).useExponentialShadowMap = true;
        getParticleSun(this.scene);

        this.engine.runRenderLoop(() => this.scene.render());
        window.addEventListener('resize', this._resizeHandler);

        this._resolveReady();
    }

    public registerBeforeRender(fn: BeforeRenderCallback): void {
        if (this._beforeRenderObserver) {
            this.scene.onBeforeRenderObservable.remove(this._beforeRenderObserver);
        }
        this._beforeRenderObserver = this.scene.onBeforeRenderObservable.add(() => fn(this.scene));
    }

    public zoomTo(meshName: string): void {
        if (!this.scene || !this.mainCamera) return;
        const mesh = this.scene.getMeshByName(meshName);
        if (!mesh) return;
        const toTarget = mesh.getAbsolutePosition();
        const toRadius = mesh.getBoundingInfo().boundingSphere.radius * 4;
        this.animateCamera(this.mainCamera.target.clone(), toTarget, this.mainCamera.radius, toRadius);
    }

    public followPlanet(meshName: string): void {
        if (!this.scene || !this.mainCamera) return;
        const mesh = this.scene.getMeshByName(meshName);
        if (!mesh) return;
        if (this.followObserver) {
            this.scene.onBeforeRenderObservable.remove(this.followObserver);
        }
        this.followObserver = this.scene.onBeforeRenderObservable.add(() => {
            this.mainCamera.target = mesh.getAbsolutePosition();
        });
    }

    public resetCamera(): void {
        if (!this.scene || !this.mainCamera) return;
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
        const targetAnim = new Animation('cameraTargetAnim', 'target', 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        targetAnim.setKeys([{ frame: 0, value: fromTarget }, { frame: 100, value: toTarget }]);
        const radiusAnim = new Animation('cameraRadiusAnim', 'radius', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        radiusAnim.setKeys([{ frame: 0, value: fromRadius }, { frame: 100, value: toRadius }]);
        const ease = new CubicEase();
        ease.setEasingMode(CubicEase.EASINGMODE_EASEINOUT);
        targetAnim.setEasingFunction(ease);
        radiusAnim.setEasingFunction(ease);
        this.mainCamera.animations = [targetAnim, radiusAnim];
        this.scene.beginAnimation(this.mainCamera, 0, 100, false, 1);
    }

    private _createStarfield(): void {
        const starfieldSphere = MeshBuilder.CreateSphere('Starfield', { diameter: 400, segments: 32 }, this.scene);
        starfieldSphere.infiniteDistance = true;
        starfieldSphere.isPickable = false;
        const starfieldMat = new ShaderMaterial(
            'starfieldMat',
            this.scene,
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

    public createPlanetLight(planetName: string, planetPosition: Vector3): void {
        if (!this.scene || this.planetLights.has(planetName)) return;
        const sunPos = this.scene.getMeshByName('Sun')?.position ?? Vector3.Zero();
        const dir = planetPosition.subtract(sunPos).normalize();
        const light = new DirectionalLight(`${planetName}-DirLight`, dir, this.scene);
        light.position = sunPos.clone();
        light.intensity = 200.0;
        light.shadowMinZ = 50;
        light.shadowMaxZ = 150;
        const shadowGen = new ShadowGenerator(1024, light);
        shadowGen.useExponentialShadowMap = true;
        shadowGen.bias = 0.02;
        this.planetLights.set(planetName, { light, shadowGen });
    }

    public getPlanetShadowGen(planetName: string): ShadowGenerator | undefined {
        return this.planetLights.get(planetName)?.shadowGen;
    }

    public getPlanetLightMatrix(planetName: string): Matrix | undefined {
        return this.planetLights.get(planetName)?.shadowGen.getTransformMatrix();
    }

    public getPlanetShadowMap(planetName: string): Texture | undefined {
        const shadowMap = this.planetLights.get(planetName)?.shadowGen.getShadowMap();
        return shadowMap === null ? undefined : shadowMap;
    }

    public dispose(): void {
        if (typeof window === 'undefined') return;
        window.removeEventListener('resize', this._resizeHandler);
        this.scene.dispose();
        this.engine.dispose();
    }
}