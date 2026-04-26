import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Intro Loader Logic
    const loader = document.getElementById('loader');
    const startAnimations = () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 1s ease';
            setTimeout(() => {
                loader.style.display = 'none';
                initHeroAnimations();
            }, 1000);
        }, 1500);
    };
    window.onload = startAnimations;

    // 2. Three.js Advanced Scene (Torus Knot + Particle System)
    const initThreeJS = () => {
        const canvas = document.getElementById('three-canvas');
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Main object: Torus Knot with neon material
        const knotGeometry = new THREE.TorusKnotGeometry(1.2, 0.3, 200, 32, 3, 4);
        const knotMaterial = new THREE.MeshStandardMaterial({
            color: 0x9d4edd,
            emissive: 0x4cc9f0,
            emissiveIntensity: 1.2,
            metalness: 0.8,
            roughness: 0.2,
            wireframe: false
        });
        const torusKnot = new THREE.Mesh(knotGeometry, knotMaterial);
        scene.add(torusKnot);

        // Outer wireframe glow
        const wireframeGeo = new THREE.TorusKnotGeometry(1.25, 0.32, 200, 32, 3, 4);
        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0xff0054,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const wireframeKnot = new THREE.Mesh(wireframeGeo, wireframeMat);
        scene.add(wireframeKnot);

        // Particle system (floating stars)
        const particleCount = 1500;
        const particlesGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            particlePositions[i * 3] = (Math.random() - 0.5) * 30;
            particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x9d4edd,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
        scene.add(particleSystem);

        // Additional floating rings
        const ringGeo = new THREE.TorusGeometry(1.6, 0.03, 64, 200);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x4cc9f0, emissive: 0x4cc9f0, emissiveIntensity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);

        const ring2Geo = new THREE.TorusGeometry(1.9, 0.02, 64, 200);
        const ring2Mat = new THREE.MeshStandardMaterial({ color: 0xff0054, emissive: 0xff0054, emissiveIntensity: 0.5 });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.z = Math.PI / 3;
        scene.add(ring2);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x222222);
        scene.add(ambientLight);
        const pointLight1 = new THREE.PointLight(0x9d4edd, 1.5);
        pointLight1.position.set(3, 3, 3);
        scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(0x4cc9f0, 1.2);
        pointLight2.position.set(-2, 4, 2);
        scene.add(pointLight2);
        const backLight = new THREE.PointLight(0xff0054, 0.8);
        backLight.position.set(0, 0, -4);
        scene.add(backLight);

        camera.position.z = 5;
        camera.position.y = 0.5;
        camera.lookAt(0, 0, 0);

        // Animation loop
        let time = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.008;

            torusKnot.rotation.x += 0.005;
            torusKnot.rotation.y += 0.01;
            torusKnot.rotation.z += 0.007;
            wireframeKnot.rotation.copy(torusKnot.rotation);

            ring.rotation.z += 0.003;
            ring.rotation.x += 0.002;
            ring2.rotation.x += 0.004;
            ring2.rotation.y += 0.003;

            particleSystem.rotation.y += 0.0005;
            particleSystem.rotation.x = Math.sin(time * 0.2) * 0.1;

            // Pulse intensity
            const intensity = 0.8 + Math.sin(time * 3) * 0.3;
            pointLight1.intensity = intensity;
            pointLight2.intensity = intensity * 0.9;
            knotMaterial.emissiveIntensity = 0.9 + Math.sin(time * 4) * 0.3;

            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
    };
    initThreeJS();

    // 3. Hero Text Animations
    const initHeroAnimations = () => {
        const title = document.querySelector('.fade-in-name');
        if (title) {
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
            title.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        setTimeout(startTyping, 800);
    };

    const startTyping = () => {
        const roleText = "AI ENGINEER | SECURITY & FULL-STACK";
        const typingElement = document.getElementById('hero-role');
        if (!typingElement) return;

        let i = 0;
        const type = () => {
            if (i < roleText.length) {
                typingElement.innerHTML += roleText.charAt(i);
                i++;
                setTimeout(type, 50);
            }
        };
        type();
    };

    // 4. Premium Cursor with Trail (No default cursor visible)
    const cursor = document.getElementById('glow-cursor');
    const trails = [];
    const trailCount = 6;

    for (let i = 0; i < trailCount; i++) {
        const t = document.createElement('div');
        t.className = 'cursor-trail';
        document.body.appendChild(t);
        trails.push({ el: t, x: 0, y: 0 });
    }

    let curX = 0, curY = 0;
    let tgtX = 0, tgtY = 0;

    document.addEventListener('mousemove', (e) => {
        tgtX = e.clientX;
        tgtY = e.clientY;
    });

    const updateCursor = () => {
        curX += (tgtX - curX) * 0.2;
        curY += (tgtY - curY) * 0.2;
        cursor.style.left = `${curX}px`;
        cursor.style.top = `${curY}px`;

        trails.forEach((trail, index) => {
            const prev = index === 0 ? { x: curX, y: curY } : trails[index - 1];
            trail.x += (prev.x - trail.x) * 0.25;
            trail.y += (prev.y - trail.y) * 0.25;
            trail.el.style.left = `${trail.x}px`;
            trail.el.style.top = `${trail.y}px`;
            trail.el.style.opacity = (1 - index / trailCount) * 0.4;
            const size = 12 - index * 1.5;
            trail.el.style.width = `${size}px`;
            trail.el.style.height = `${size}px`;
        });
        requestAnimationFrame(updateCursor);
    };
    updateCursor();

    // Hover effects for interactive elements
    const interactables = document.querySelectorAll('a, button, .glass, .pill, .project-card');
    interactables.forEach(item => {
        item.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        item.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });

    // 5. Scroll & Navbar Logic
    const navbar = document.getElementById('main-nav');
    const reveals = document.querySelectorAll('.reveal');

    const handleScroll = () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        reveals.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) el.classList.add('active');
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
});