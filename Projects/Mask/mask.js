// Importando via CDN ESModule
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

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

// Carregar a textura normal map
const normalMapLoader = new THREE.TextureLoader();
const normalMap = normalMapLoader.load('NormalVoronoi.png');

// Shader Material para cor esverdeada limo com ruído
const customMaterial = new THREE.ShaderMaterial({
    uniforms: {
        normalMap: { type: 't', value: normalMap },
        lightPosition: { value: new THREE.Vector3(5, 0, 5) },
        colorLight: { value: new THREE.Color('#d4d8d8') }, // Cor clara
        colorDark: { value: new THREE.Color(0x293d3f) }  // Cor escura
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 colorLight;
        uniform vec3 colorDark;
        uniform sampler2D normalMap;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Função Perlin Noise
        vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x) {
            return mod289(((x*34.0)+1.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade(vec3 t) {
            return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        // Classic Perlin noise
        float cnoise(vec3 P) {
            vec3 Pi0 = floor(P); // Integer part for indexing
            vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
            Pi0 = mod289(Pi0);
            Pi1 = mod289(Pi1);
            vec3 Pf0 = fract(P); // Fractional part for interpolation
            vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.y, Pi0.y, Pi1.y, Pi1.y);
            vec4 iz0 = vec4(Pi0.z);
            vec4 iz1 = vec4(Pi1.z);

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 * (1.0 / 7.0);
            vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 * (1.0 / 7.0);
            vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000), dot(g010,g010), dot(g100,g100), dot(g110,g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001), dot(g011,g011), dot(g101,g101), dot(g111,g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
            return 2.2 * n_xyz;
        }

        void main() {
            vec3 light = normalize(vec3(5.0, 0.0, 5.0));
            float intensity = dot(vNormal, light);

            // Gerar ruído Perlin baseado na posição do fragmento
            float noise = cnoise(vPosition * 1.0); // Escalar para ajustar o tamanho do ruído
            vec3 baseColor = mix(colorDark, colorLight, vPosition.y * 0.5 + 0.5);
            baseColor += noise * 0.3; // Aumentar a influência do ruído na cor base

            // Ajustar a intensidade da cor baseada na profundidade e na iluminação
            vec3 finalColor = mix(colorDark, baseColor, intensity);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
    transparent: true
});

// Carregar o modelo 3D
const loaderModel = new GLTFLoader();
loaderModel.load('masklor.glb', function(gltf) {
    const model = gltf.scene;

    // Ajustar a posição e escala do modelo
    model.position.set(0, 0, 0);
    model.scale.set(25.0, 25.0, 25.0);

    // Aplicar o material personalizado ao modelo
    model.traverse((node) => {
        if (node.isMesh) {
            node.material = customMaterial;
            node.material.normalMap = normalMap;
            node.material.needsUpdate = true;
        }
    });

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
