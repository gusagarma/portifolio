import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer, LoopOnce, LoopRepeat } from 'three';

// Cena
const scene = new THREE.Scene();

// Background + overlay escuro
const loader = new THREE.TextureLoader();
loader.load('bkg.jpg', function(texture) {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    scene.background = texture;

    const darkMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.5,
        transparent: true,
        depthWrite: false
    });

    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const darkOverlay = new THREE.Mesh(planeGeometry, darkMaterial);
    darkOverlay.position.z = -1;
    scene.add(darkOverlay);
});

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Luz ambiente fraca para preenchimento
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

// Luz solar com sombra
const sunLight = new THREE.DirectionalLight(0xfff3b0, 5.5);
sunLight.position.set(5, 10, 7);
sunLight.castShadow = true;

// Configurações de sombra realista
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 20;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.right = 10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.radius = 4; // borda suave
sunLight.shadow.bias = -0.001;

scene.add(sunLight);

// Chão para receber sombras
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Carregamento do modelo
const loaderModel = new GLTFLoader();
let activeCamera;
let mixer;
let idleAction, fireAction;
let canShoot = true;

loaderModel.load('emma.glb', function(gltf) {
    const model = gltf.scene;
    const animations = gltf.animations;
    const exportedCamera = gltf.cameras?.[0];

    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
    model.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    scene.add(model);

    // Câmera
    if (exportedCamera) {
        activeCamera = exportedCamera;
        scene.add(exportedCamera);
    } else {
        activeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        activeCamera.position.set(0, 1.5, 5);
        scene.add(activeCamera);
    }

    // Animações
    if (animations && animations.length > 0) {
        mixer = new AnimationMixer(model);

        const idleClip = animations.find(clip => clip.name.toLowerCase().includes('idle'));
        const fireClip = animations.find(clip => clip.name.toLowerCase().includes('fire'));

        if (idleClip) {
            idleAction = mixer.clipAction(idleClip);
            idleAction.setLoop(LoopRepeat);
            idleAction.play();
        }

        if (fireClip) {
            fireAction = mixer.clipAction(fireClip);
            fireAction.setLoop(LoopOnce);
            fireAction.clampWhenFinished = true;
            fireAction.timeScale = 2;
        }
    }

    // Evento de click = animação de fire
    window.addEventListener('click', () => {
        if (!canShoot || !fireAction || !idleAction) return;

        canShoot = false;

        idleAction.stop();
        fireAction.reset().play();

        const onAnimationFinished = (e) => {
            if (e.action === fireAction) {
                fireAction.stop();
                idleAction.reset().play();
                canShoot = true;
                mixer.removeEventListener('finished', onAnimationFinished);
            }
        };

        mixer.addEventListener('finished', onAnimationFinished);
    });

    // Loop de animação
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        renderer.render(scene, activeCamera);
    }

    animate();
},
undefined,
(error) => {
    console.error('Erro ao carregar emma.glb:', error);
});
