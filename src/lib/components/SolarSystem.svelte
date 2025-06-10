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

    function createPlanet(name: string, x: number, color: number): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color });
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

        planetNames.forEach((name, i) => {
            const mesh = createPlanet(name, (i - 1.5) * 5, Math.random() * 0xffffff);
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
                    cameraTarget.set(planet.mesh.position);
                    dispatcher('selectPlanet', planet.name);
                }
            }
        };

        window.addEventListener('click', onClick);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();

            camera.lookAt(cameraTarget);
            renderer.render(scene, camera);
        };

        animate();

        return () => window.removeEventListener('click', onClick);
    });
</script>

<canvas bind:this={canvas} class="w-full h-full"></canvas>
