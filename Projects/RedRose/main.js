import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Criar a cena
const scene = new THREE.Scene();

// Carregar a textura de plano de fundo
const loader = new THREE.TextureLoader();
loader.load('bkg.jpg', function(texture) {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    scene.background = texture;
    
    const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.5, transparent: true });
    const planeGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    const darkOverlay = new THREE.Mesh(planeGeometry, darkMaterial);
    darkOverlay.position.z = -1; 
    scene.add(darkOverlay);
});

// Criar a câmera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Criar o renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Adicionar iluminação
const ambientLight = new THREE.AmbientLight(0x808080);
scene.add(ambientLight);

const leftLight = new THREE.PointLight(0xffffff, 5);
leftLight.position.set(-5, 0, 5);
scene.add(leftLight);

const rightLight = new THREE.PointLight('#ffe4e2', 25);
rightLight.position.set(5, 0, 5);
scene.add(rightLight);


// Carregar o modelo 3D
const loaderModel = new GLTFLoader();
loaderModel.load('RedRose.glb', function(gltf) {
    const model = gltf.scene;

    // Ajustar a posição e escala do modelo
    model.position.set(0, 0, 0);
    model.scale.set(0.1, 0.1, 0.1);


    scene.add(model);

    // Função para animar o modelo girando horizontalmente
    function animateModel() {
        model.rotation.y += 0.005;
    }

    // Função de animação
    function animate() {
        requestAnimationFrame(animate);
        animateModel();
        renderer.render(scene, camera);
    }

    // Iniciar a animação
    animate();
});

// Posicionar a câmera
camera.position.z = 5;
