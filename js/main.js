// ============================================================
// main.js — Bundled static build (no ES modules)
// Merged: cursor.js + orb.js + card.js + main logic
// Compatible with file:// protocol and GitHub Pages
// ============================================================

// ─── CURSOR ─────────────────────────────────────────────────
function initCursor() {
    const cursorDot = document.getElementById('custom-cursor');
    if (!cursorDot) return;

    const isDesktop = window.matchMedia("(pointer: fine)").matches;
    if (!isDesktop) {
        document.body.classList.remove('js-cursor-active');
        cursorDot.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let cursorInitialized = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!cursorInitialized) {
            cursorInitialized = true;
            document.body.classList.add('js-cursor-active');
            cursorDot.style.opacity = '1';
        }
    });

    function updateCursor() {
        if (cursorInitialized) {
            // Direct tracking — no lerp lag
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(updateCursor);
    }

    cursorDot.style.opacity = '0';
    updateCursor();

    function attachHoverListeners() {
        const interactiveItems = document.querySelectorAll('a, button, .btn, .glass-card, .pill, .social-btn, .project-link, .copy-email-btn, .menu-toggle');
        interactiveItems.forEach(el => {
            el.removeEventListener('mouseenter', addHoverClass);
            el.removeEventListener('mouseleave', removeHoverClass);
            el.addEventListener('mouseenter', addHoverClass);
            el.addEventListener('mouseleave', removeHoverClass);
        });
    }

    function addHoverClass() { cursorDot.classList.add('cursor-hover'); }
    function removeHoverClass() { cursorDot.classList.remove('cursor-hover'); }

    attachHoverListeners();
    window.refreshCursorHoverListeners = attachHoverListeners;
}

// ─── 3D ORB (Three.js global) ───────────────────────────────
function initOrb() {
    function hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) { return false; }
    }

    if (!hasWebGL() || typeof THREE === 'undefined') {
        document.body.classList.add('no-webgl');
        console.warn('WebGL or Three.js not available. Activating CSS fallback.');
        return;
    }

    const canvas = document.getElementById('orb-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    function setCanvasSize() {
        const container = canvas.parentElement;
        if (!container) return;
        const size = Math.min(container.clientWidth, 460);
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        canvas.width = size;
        canvas.height = size;
        camera.aspect = 1;
        camera.updateProjectionMatrix();
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const geo = new THREE.IcosahedronGeometry(1.2, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.1, metalness: 0.9, flatShading: true });
    const core = new THREE.Mesh(geo, mat);
    coreGroup.add(core);

    const wireGeo = new THREE.IcosahedronGeometry(1.25, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xff4d4f, wireframe: true, transparent: true, opacity: 0.25 });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireframe);

    for (let i = 0; i < 18; i++) {
        const boxSize = 0.1 + Math.random() * 0.2;
        const bGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        const bMesh = new THREE.Mesh(bGeo, mat);
        const radius = 1.7 + Math.random() * 0.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        bMesh.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        bMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        bMesh.userData = { speedX: (Math.random() - 0.5) * 0.04, speedY: (Math.random() - 0.5) * 0.04, orbitSpeed: (Math.random() - 0.5) * 0.005, radius, theta, phi };
        coreGroup.add(bMesh);
    }

    const pGeo = new THREE.BufferGeometry();
    const pCount = 200;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 5;
        pPos[i * 3 + 1] = (Math.random() - 0.5) * 5;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xff4d4f, size: 0.03, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(pGeo, pMat);
    coreGroup.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const redLight1 = new THREE.PointLight(0xff4d4f, 2.5, 10);
    redLight1.position.set(2, 2, 2);
    scene.add(redLight1);
    const redLight2 = new THREE.PointLight(0xff0033, 1.8, 10);
    redLight2.position.set(-2, -2, -2);
    scene.add(redLight2);

    camera.position.z = 4;

    let targetX = 0, targetY = 0;
    document.addEventListener('mousemove', (e) => {
        targetX = (e.clientX - window.innerWidth / 2) * 0.0006;
        targetY = (e.clientY - window.innerHeight / 2) * 0.0006;
    });

    let time = 0;
    let orbAnimating = false;
    let orbRAF = null;

    function animateOrb() {
        orbRAF = requestAnimationFrame(animateOrb);
        time += 0.01;
        coreGroup.rotation.y += (targetX - coreGroup.rotation.y) * 0.05;
        coreGroup.rotation.x += (targetY - coreGroup.rotation.x) * 0.05;
        coreGroup.rotation.y += 0.001;
        coreGroup.rotation.z += 0.0005;
        core.rotation.y = time * 0.3;
        core.rotation.x = time * 0.15;
        wireframe.rotation.copy(core.rotation);

        coreGroup.children.forEach(child => {
            if (child.userData.orbitSpeed) {
                child.rotation.x += child.userData.speedX;
                child.rotation.y += child.userData.speedY;
                child.userData.theta += child.userData.orbitSpeed;
                child.position.x = child.userData.radius * Math.sin(child.userData.phi) * Math.cos(child.userData.theta);
                child.position.z = child.userData.radius * Math.sin(child.userData.phi) * Math.sin(child.userData.theta);
            }
        });

        redLight1.intensity = 2 + Math.sin(time * 2.5) * 0.8;
        if (window.typingVelocityActivity && window.typingVelocityActivity > 0) {
            redLight1.intensity += window.typingVelocityActivity * 1.5;
            coreGroup.rotation.y += window.typingVelocityActivity * 0.05;
            window.typingVelocityActivity *= 0.95;
        }
        renderer.render(scene, camera);
    }

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!orbAnimating) { orbAnimating = true; animateOrb(); }
            } else {
                if (orbAnimating) { orbAnimating = false; cancelAnimationFrame(orbRAF); orbRAF = null; }
            }
        });
    }, { threshold: 0.05 });

    const homeSection = document.getElementById('home');
    if (homeSection) heroObserver.observe(homeSection);
    orbAnimating = true;
    animateOrb();
}

// ─── FLIP CARD ───────────────────────────────────────────────
function initCard() {
    const flipCardWrapper = document.getElementById('flip-card');
    const flipCardInner = document.getElementById('flip-inner');
    if (!flipCardWrapper || !flipCardInner) return;

    let rotationY = 0, isDragging = false, startX = 0, startRotationY = 0;
    let velocityY = 0, lastX = 0, momentumID, hasSpun = false;

    const applyRotation = (val) => {
        rotationY = val;
        flipCardInner.style.transform = `rotateY(${rotationY}deg)`;
    };

    const animateMomentum = () => {
        if (!isDragging) {
            rotationY += velocityY;
            velocityY *= 0.95;
            if (Math.abs(velocityY) < 0.1) {
                const targetSnap = Math.round(rotationY / 180) * 180;
                const diff = targetSnap - rotationY;
                rotationY += diff * 0.1;
                if (Math.abs(diff) < 0.01) {
                    rotationY = targetSnap;
                    velocityY = 0;
                    cancelAnimationFrame(momentumID);
                    momentumID = null;
                }
            }
        }
        applyRotation(rotationY);
        if (Math.abs(velocityY) > 0.01 || isDragging || Math.abs(Math.round(rotationY / 180) * 180 - rotationY) > 0.01) {
            momentumID = requestAnimationFrame(animateMomentum);
        }
    };

    flipCardWrapper.addEventListener('mousedown', (e) => {
        isDragging = true; startX = e.clientX; startRotationY = rotationY;
        lastX = e.clientX; velocityY = 0;
        if (momentumID) cancelAnimationFrame(momentumID);
        momentumID = requestAnimationFrame(animateMomentum);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        velocityY = (e.clientX - lastX) * 0.5;
        lastX = e.clientX;
        applyRotation(startRotationY + deltaX * 0.5);
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        if (Math.abs(e.clientX - startX) < 5) {
            velocityY = (Math.round(rotationY / 180) * 180 - rotationY >= 0) ? 10 : -10;
        }
    });

    flipCardWrapper.addEventListener('touchstart', (e) => {
        isDragging = true; startX = e.touches[0].clientX; startRotationY = rotationY;
        lastX = e.touches[0].clientX; velocityY = 0;
        if (momentumID) cancelAnimationFrame(momentumID);
        momentumID = requestAnimationFrame(animateMomentum);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        velocityY = (e.touches[0].clientX - lastX) * 0.5;
        lastX = e.touches[0].clientX;
        applyRotation(startRotationY + (e.touches[0].clientX - startX) * 0.5);
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        if (Math.abs(e.changedTouches[0].clientX - startX) < 5) {
            velocityY = (Math.round(rotationY / 180) * 180 - rotationY >= 0) ? 10 : -10;
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasSpun) {
                hasSpun = true;
                setTimeout(() => {
                    velocityY = 22;
                    if (!momentumID) momentumID = requestAnimationFrame(animateMomentum);
                }, 800);
            }
        });
    }, { threshold: 0.6 });

    const contactSection = document.getElementById('contact');
    if (contactSection) observer.observe(contactSection);
}

// ─── MAIN ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initOrb();
    initCard();

    // Mobile Navigation
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Scroll Reveal & Navbar Shrink
    const nav = document.getElementById('mainNav');
    const revealItems = document.querySelectorAll('.reveal');

    function handleScrollEffects() {
        if (window.scrollY > 40) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        revealItems.forEach(el => {
            const rect = el.getBoundingClientRect();
            const threshold = el.id === 'contact' ? window.innerHeight - 150 : window.innerHeight - 80;
            if (rect.top < threshold) el.classList.add('active');
        });
    }

    window.addEventListener('scroll', handleScrollEffects, { passive: true });
    handleScrollEffects();

    // Typing Effect
    const roleElement = document.getElementById('dynamic-role');
    if (roleElement) {
        const roles = [
            "secure SaaS apps",
            "AI threat tools",
            "typing biometrics",
            "intelligent agents",
            "automation APIs"
        ];
        let roleIdx = 0, charIdx = 0, isDeleting = false;

        function typeRole() {
            const currentRole = roles[roleIdx];
            if (!isDeleting) {
                roleElement.innerHTML = currentRole.substring(0, charIdx + 1);
                charIdx++;
                if (charIdx === currentRole.length) {
                    isDeleting = true;
                    setTimeout(typeRole, 2200);
                    return;
                }
            } else {
                roleElement.innerHTML = currentRole.substring(0, charIdx - 1);
                charIdx--;
                if (charIdx === 0) {
                    isDeleting = false;
                    roleIdx = (roleIdx + 1) % roles.length;
                }
            }
            setTimeout(typeRole, isDeleting ? 25 : 55);
        }
        setTimeout(typeRole, 500);
    }

    // Projects Drag-to-Scroll & Carousel Snap
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
        let projectCards = Array.from(projectsGrid.querySelectorAll('.project-card'));

        const updateActiveCard = () => {
            const gridRect = projectsGrid.getBoundingClientRect();
            const containerCenter = gridRect.left + gridRect.width / 2;
            let closestCard = null, minDistance = Infinity;

            projectCards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const distance = Math.abs(containerCenter - (cardRect.left + cardRect.width / 2));
                if (distance < minDistance) { minDistance = distance; closestCard = card; }
            });

            projectCards.forEach(card => { card.classList.remove('active'); card.classList.add('inactive'); });
            if (closestCard) { closestCard.classList.add('active'); closestCard.classList.remove('inactive'); }
        };

        setTimeout(() => {
            updateActiveCard();
            projectsGrid.addEventListener('scroll', updateActiveCard, { passive: true });
        }, 100);

        window.addEventListener('resize', updateActiveCard);

        let isDown = false, startX, scrollLeft, dragged = false;

        projectsGrid.addEventListener('mousedown', (e) => {
            isDown = true; dragged = false;
            projectsGrid.style.scrollSnapType = 'none';
            startX = e.pageX - projectsGrid.offsetLeft;
            scrollLeft = projectsGrid.scrollLeft;
        });

        projectsGrid.addEventListener('mouseleave', () => { if (!isDown) return; isDown = false; projectsGrid.style.scrollSnapType = 'x mandatory'; });
        projectsGrid.addEventListener('mouseup', () => { if (!isDown) return; isDown = false; projectsGrid.style.scrollSnapType = 'x mandatory'; });

        projectsGrid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const walk = (e.pageX - projectsGrid.offsetLeft - startX) * 2;
            if (Math.abs(walk) > 5) dragged = true;
            projectsGrid.scrollLeft = scrollLeft - walk;
        });

        projectCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('a')) return;
                if (dragged) return;
                card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            });
        });
    }

    // Copy Email Button
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const copyTooltip = document.getElementById('copyTooltip');
    if (copyEmailBtn && copyTooltip) {
        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText("vineethkrishna002@gmail.com").then(() => {
                copyTooltip.classList.add('show');
                copyEmailBtn.innerHTML = "<span>✓</span> Copied!";
                setTimeout(() => {
                    copyTooltip.classList.remove('show');
                    copyEmailBtn.innerHTML = "Copy Email";
                }, 2000);
            }).catch(err => console.error('Failed to copy email: ', err));
        });
    }
});
