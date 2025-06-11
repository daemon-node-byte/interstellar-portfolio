<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
    import { tweened } from 'svelte/motion';

    const dispatcher = createEventDispatcher();

    let canvas: HTMLCanvasElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;

    let planets: { name: string; mesh: THREE.Mesh; position: THREE.Vector3 }[] = [];
    const planetNames = ['about', 'projects', 'blog', 'contact'];

    const cameraTarget = tweened(new THREE.Vector3(0, 0, 0), { duration: 1000 });
    let cameraTargetValue = new THREE.Vector3(0, 0, 0);
    cameraTarget.subscribe(v => cameraTargetValue.copy(v));

    const fragmentShader = `
    varying vec2 vUv;
    void main() {
      float glow = sin(vUv.x * 30.0) * 0.5 + 0.5;
      vec3 color = mix(vec3(0.0, 0.1, 0.3), vec3(0.0, 1.0, 0.8), glow);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    function createPlanet(name: string, x: number, hue: number): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {},
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, 0);
        return mesh;
    }

    onMount(() => {
        scene = new THREE.Scene();
        scene.background = new THREE.Color('#000011');

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 10;

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const light = new THREE.PointLight(0xffffff, 1.5);
        light.position.set(0, 0, 0);
        scene.add(light);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableZoom = false;

        // Clear planets array to avoid duplicates on hot reload
        planets = [];

        planetNames.forEach((name, i) => {
            const hue = i / planetNames.length;
            const mesh = createPlanet(name, (i - 1.5) * 5, hue);
            planets.push({ name, mesh, position: mesh.position });
            scene.add(mesh);
        });

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onClick = (event: MouseEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

            if (intersects.length > 0) {
                const planet = planets.find(p => p.mesh === intersects[0].object);
                if (planet) {
                    cameraTarget.set(planet.mesh.position.clone());
                    dispatcher('selectPlanet', planet.name);
                }
            }
        };

        window.addEventListener('click', onClick);

        // Handle window resize
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();

            // Use the current value of cameraTarget for lookAt
            camera.lookAt(cameraTargetValue);
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', onResize);
        };
    });
</script>

<canvas bind:this={canvas} class="w-full h-full"></canvas>
