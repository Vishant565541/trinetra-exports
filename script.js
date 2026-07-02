// ── 3D GLOBE ANIMATION (PREMIUM CINEMATIC WORLDWIDE LOGISTICS) ──
(function initHeroGlobe() {
  const canvas = document.getElementById('hero-globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const hero = canvas.parentElement;
  let W = hero.offsetWidth;
  let H = hero.offsetHeight || window.innerHeight;
  canvas.width = W;
  canvas.height = H;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  
  // Camera responsive configuration
  const isMobile = W < 768;
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
  
  // Position camera differently for mobile vs desktop so globe fits properly
  if (isMobile) {
    camera.position.set(0.0, -0.15, 3.8); // Centered, slightly lower to fit above stats cards
  } else {
    camera.position.set(0.6, 0.2, 3.5);  // Right-aligned for desktop splits
  }

  const mainGroup = new THREE.Group();
  scene.add(mainGroup);


  // --- LIGHTING SETUP (Cinematic Golden Sunlight & Volume Glow) ---
  const ambientLight = new THREE.AmbientLight(0x0b2e24, 1.2);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffdfa9, 4.5);
  sunLight.position.set(5, 3, 2);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Soft fill green light
  const fillLight = new THREE.DirectionalLight(0x145a32, 2.5);
  fillLight.position.set(-5, -2, -2);
  scene.add(fillLight);

  // Volumetric background/glow helper
  const bgGlowGeo = new THREE.PlaneGeometry(10, 10);
  const bgGlowMat = new THREE.MeshBasicMaterial({
    color: 0x0b2e24,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const bgGlow = new THREE.Mesh(bgGlowGeo, bgGlowMat);
  bgGlow.position.set(0, 0, -2);
  scene.add(bgGlow);

  // --- GLOBE COMPOSITION ---
  const globeGroup = new THREE.Group();
  mainGroup.add(globeGroup);

  // Procedural Earth surface textures (using high contrast dark forest/emerald green and gold continents)
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 1024;
  textureCanvas.height = 512;
  const ctx = textureCanvas.getContext('2d');
  
  // Fill ocean
  ctx.fillStyle = '#0B2E24';
  ctx.fillRect(0, 0, 1024, 512);

  // Draw procedural realistic landmasses/continents
  ctx.fillStyle = '#145A32';
  for (let i = 0; i < 480; i++) {
    const x = Math.random() * 1024;
    const y = 80 + Math.random() * 350;
    const size = 15 + Math.random() * 75;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    // Overlapping nodes for organic land shapes
    ctx.beginPath();
    ctx.arc(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw procedural gold veins on land
  ctx.fillStyle = '#D4AF37';
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * 1024;
    const y = 100 + Math.random() * 300;
    ctx.fillRect(x, y, 4 + Math.random() * 8, 2 + Math.random() * 5);
  }

  const earthTexture = new THREE.CanvasTexture(textureCanvas);
  
  // Earth Sphere
  const globeGeo = new THREE.SphereGeometry(1, 64, 64);
  const globeMat = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.45,
    metalness: 0.6,
    bumpScale: 0.05
  });
  const earthMesh = new THREE.Mesh(globeGeo, globeMat);
  globeGroup.add(earthMesh);

  // Atmosphere Outer Glow Shader
  const atmosphereGeo = new THREE.SphereGeometry(1.08, 32, 32);
  const atmosphereMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(0.08, 0.35, 0.2, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  });
  const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  globeGroup.add(atmosphere);

  // Custom coordinate helper
  function latLngToVec3(lat, lng, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  }

  // --- 10 EXPORT ROUTES FROM INDIA ---
  const INDIA_COORD = [20.5937, 78.9629];
  const DESTINATIONS = [
    { name: "USA", coords: [37.0902, -95.7129] },
    { name: "Canada", coords: [56.1304, -106.3468] },
    { name: "United Kingdom", coords: [55.3781, -3.4360] },
    { name: "Germany", coords: [51.1657, 10.4515] },
    { name: "France", coords: [46.2276, 2.2137] },
    { name: "UAE", coords: [23.4241, 53.8478] },
    { name: "Saudi Arabia", coords: [23.8859, 45.0792] },
    { name: "Australia", coords: [-25.2744, 133.7751] },
    { name: "Singapore", coords: [1.3521, 103.8198] },
    { name: "South Africa", coords: [-30.5595, 22.9375] }
  ];

  const routesGroup = new THREE.Group();
  globeGroup.add(routesGroup);

  const routeParticles = [];
  const arcCurves = [];

  DESTINATIONS.forEach(dest => {
    const start = latLngToVec3(INDIA_COORD[0], INDIA_COORD[1], 1.01);
    const end = latLngToVec3(dest.coords[0], dest.coords[1], 1.01);
    
    // Calculate arc height depending on distance
    const dist = start.distanceTo(end);
    const midHeight = 1.0 + dist * 0.32;
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(midHeight);
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    arcCurves.push(curve);

    // Glowing arc line
    const points = curve.getPoints(50);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
    const arcMat = new THREE.LineBasicMaterial({
      color: 0xD4AF37,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending
    });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    routesGroup.add(arcLine);

    // Destination glowing point
    const destGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const destMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37 });
    const destMesh = new THREE.Mesh(destGeo, destMat);
    destMesh.position.copy(end);
    routesGroup.add(destMesh);

    // Dynamic light particles traveling the arcs
    const pGeo = new THREE.SphereGeometry(0.008, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({
      color: 0xffdfa9,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    const pMesh = new THREE.Mesh(pGeo, pMat);
    routesGroup.add(pMesh);
    routeParticles.push({
      mesh: pMesh,
      curve: curve,
      progress: Math.random() // randomized initial offsets
    });
  });

  // Glowing India origin marker
  const indiaPos = latLngToVec3(INDIA_COORD[0], INDIA_COORD[1], 1.015);
  const originGeo = new THREE.SphereGeometry(0.024, 16, 16);
  const originMat = new THREE.MeshBasicMaterial({
    color: 0xD4AF37,
    transparent: true,
    opacity: 0.95
  });
  const originMesh = new THREE.Mesh(originGeo, originMat);
  originMesh.position.copy(indiaPos);
  routesGroup.add(originMesh);

  // Pulse rings
  const ringGeo = new THREE.RingGeometry(0.035, 0.045, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xD4AF37,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.copy(indiaPos);
  ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
  routesGroup.add(ringMesh);

  // --- FLOATING AGRICULTURAL PRODUCTS ---
  const productsGroup = new THREE.Group();
  mainGroup.add(productsGroup);

  const floatingItems = [];

  // 1. Organic Jaggery Cube
  const jaggeryGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const jaggeryMat = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    roughness: 0.1,
    metalness: 0.8,
    clearcoat: 1.0
  });
  const jaggeryCube = new THREE.Mesh(jaggeryGeo, jaggeryMat);
  jaggeryCube.position.set(-1.1, 0.6, 0.5);
  productsGroup.add(jaggeryCube);
  floatingItems.push({ mesh: jaggeryCube, speedY: 0.0015, speedRot: 0.006, amp: 0.14, offset: 0 });

  // 2. Sugarcane Stalk (cylinder segments)
  const caneGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8);
  const caneMat = new THREE.MeshStandardMaterial({
    color: 0x27ae60,
    roughness: 0.6,
    metalness: 0.1
  });
  const caneStalk = new THREE.Mesh(caneGeo, caneMat);
  caneStalk.position.set(1.2, -0.5, 0.7);
  caneStalk.rotation.z = Math.PI / 4;
  productsGroup.add(caneStalk);
  floatingItems.push({ mesh: caneStalk, speedY: 0.0012, speedRot: 0.004, amp: 0.18, offset: Math.PI / 3 });

  // 3. Cardamom Pod / Spices
  const cardGeo = new THREE.SphereGeometry(0.04, 8, 8);
  cardGeo.scale(1.7, 1.0, 1.0); // stretch to resemble pod
  const cardMat = new THREE.MeshStandardMaterial({ color: 0x82e0aa, roughness: 0.8 });
  const cardPod = new THREE.Mesh(cardGeo, cardMat);
  cardPod.position.set(-0.8, -0.6, 0.8);
  productsGroup.add(cardPod);
  floatingItems.push({ mesh: cardPod, speedY: 0.0018, speedRot: 0.007, amp: 0.15, offset: Math.PI });

  // 4. Red Chilli
  const chilliGeo = new THREE.ConeGeometry(0.03, 0.2, 8);
  const chilliMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.3, metalness: 0.2 });
  const chilli = new THREE.Mesh(chilliGeo, chilliMat);
  chilli.position.set(1.0, 0.7, 0.4);
  chilli.rotation.x = Math.PI / 3;
  productsGroup.add(chilli);
  floatingItems.push({ mesh: chilli, speedY: 0.001, speedRot: 0.005, amp: 0.2, offset: Math.PI * 1.5 });

  // --- LOGISTICS SCENE ENTITIES (Seaport crane, plane, ship) ---
  const logisticsGroup = new THREE.Group();
  globeGroup.add(logisticsGroup);

  // Tiny Cargo Airplane circling Earth
  const planeGeo = new THREE.ConeGeometry(0.015, 0.07, 5);
  planeGeo.rotateX(Math.PI / 2);
  const wingGeo = new THREE.BoxGeometry(0.09, 0.004, 0.02);
  const planeMesh = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const wingMesh = new THREE.Mesh(wingGeo, new THREE.MeshBasicMaterial({ color: 0xcccccc }));
  planeMesh.add(wingMesh);
  logisticsGroup.add(planeMesh);

  // Tiny Cargo Ship
  const shipGeo = new THREE.BoxGeometry(0.07, 0.018, 0.02);
  const shipMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const shipMesh = new THREE.Mesh(shipGeo, shipMat);
  const cargoContainerGeo = new THREE.BoxGeometry(0.04, 0.015, 0.016);
  const cargoMesh = new THREE.Mesh(cargoContainerGeo, new THREE.MeshBasicMaterial({ color: 0xD4AF37 }));
  cargoMesh.position.y = 0.016;
  shipMesh.add(cargoMesh);
  logisticsGroup.add(shipMesh);

  // Reflective ocean backdrop at base
  const oceanGeo = new THREE.PlaneGeometry(8, 8);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x051a14,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.55
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = -1.25;
  scene.add(ocean);

  // --- AMBIENT DUST / GLOW PARTICLES ---
  const particlesCount = 80;
  const pPos = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 4.5;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  const ambientGeo = new THREE.BufferGeometry();
  ambientGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const ambientMat = new THREE.PointsMaterial({
    color: 0xD4AF37,
    size: 0.016,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  const dustParticles = new THREE.Points(ambientGeo, ambientMat);
  scene.add(dustParticles);

  // --- INTERACTIVE MOUSE CONTROLS (Tilt & Parallax) ---
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  
  hero.addEventListener('mousemove', (e) => {
    // Normalise mouse values from -1 to 1
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = ((e.clientX - rect.left) / W) * 2 - 1;
    mouse.targetY = -((e.clientY - rect.top) / H) * 2 + 1;
  });

  // Render loop & cinematic timeline variables
  let clock = new THREE.Clock();
  let frame = 0;

  globeGroup.rotation.y = -1.37; // Initial view focuses on India

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    frame++;

    // Continuous smooth rotation (Idle animation)
    earthMesh.rotation.y += 0.045 * delta;
    routesGroup.rotation.y += 0.045 * delta;

    // Pulse Origin Ring
    const s = 1.0 + 0.38 * Math.sin(elapsedTime * 4.5);
    ringMesh.scale.setScalar(s);
    ringMat.opacity = 0.9 - (s - 1.0) / 0.38;

    // Animate route particles along curves
    routeParticles.forEach(p => {
      p.progress += 0.28 * delta;
      if (p.progress > 1.0) p.progress = 0.0;
      const point = p.curve.getPointAt(p.progress);
      p.mesh.position.copy(point);
    });

    // Airplane trajectory flight path (slow orbit)
    const planeAngle = elapsedTime * 0.15;
    planeMesh.position.set(Math.cos(planeAngle) * 1.15, Math.sin(planeAngle * 0.5) * 0.4, Math.sin(planeAngle) * 1.15);
    planeMesh.lookAt(new THREE.Vector3(Math.cos(planeAngle + 0.1) * 1.15, Math.sin((planeAngle + 0.1) * 0.5) * 0.4, Math.sin(planeAngle + 0.1) * 1.15));

    // Ship sailing path
    const shipAngle = elapsedTime * 0.05 + Math.PI;
    shipMesh.position.set(Math.cos(shipAngle) * 1.08, -0.15, Math.sin(shipAngle) * 1.08);
    shipMesh.rotation.y = -shipAngle + Math.PI / 2;

    // Floating agricultural items (Sinusoidal float & individual rotation)
    floatingItems.forEach(item => {
      item.offset += item.speedY * 60 * delta;
      item.mesh.position.y += Math.sin(item.offset) * 0.0018;
      item.mesh.rotation.x += item.speedRot * 60 * delta;
      item.mesh.rotation.y += item.speedRot * 1.1 * 60 * delta;
    });

    // Interactive inertia alignment (lerp mouse parallax)
    mouse.x += (mouse.targetX - mouse.x) * 0.07;
    mouse.y += (mouse.targetY - mouse.y) * 0.07;

    // Apply interactive tilt to globe and floating products
    globeGroup.rotation.z = mouse.x * 0.18;
    globeGroup.rotation.x = -mouse.y * 0.18;
    productsGroup.position.x = mouse.x * 0.25;
    productsGroup.position.y = mouse.y * 0.25;

    // Slow cinematic zoom-in/out parallax camera movement
    const dynamicZ = (W < 768) ? 3.8 : 3.5;
    camera.position.z = dynamicZ + Math.sin(elapsedTime * 0.18) * 0.12;

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    W = hero.offsetWidth;
    H = hero.offsetHeight || window.innerHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    
    // Dynamically adjust position on resize
    if (W < 768) {
      camera.position.set(0.0, -0.15, camera.position.z);
    } else {
      camera.position.set(0.6, 0.2, camera.position.z);
    }
  });
})();


document.addEventListener('DOMContentLoaded', () => {


  // ── NAVBAR SCROLL EFFECT ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ── MOBILE MENU TOGGLE ──
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.classList.toggle('no-scroll');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  });

  // Close mobile menu if resized to desktop screen size
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      mobileToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
  });

  // ── PORTFOLIO DIVISION TABS ──
  const tabButtons = document.querySelectorAll('.tab-btn');
  const grids = document.querySelectorAll('.products-grid');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all tabs
      tabButtons.forEach(b => b.classList.remove('active'));
      // Add active to clicked tab
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-tab');

      // Hide all grids, display selected grid
      grids.forEach(grid => {
        grid.classList.remove('active');
        if (grid.id === `${targetTab}-grid`) {
          // Force layout reflow to restart CSS animations
          grid.offsetHeight; 
          grid.classList.add('active');
        }
      });
    });
  });

  // ── SCROLL REVEAL ANIMATIONS ──
  const revealElements = document.querySelectorAll('[data-reveal]');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Stop tracking after it animates
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // ── LANGUAGE PICKER TOGGLE ──
  const langToggle = document.getElementById('langToggle');
  const langDropdown = document.getElementById('langDropdown');
  const langPicker = document.querySelector('.lang-picker');
  const langItems = document.querySelectorAll('.lang-item');
  const mobLangBtns = document.querySelectorAll('.mob-lang-btn');

  // Desktop dropdown toggle
  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    langPicker.classList.toggle('open');
    const isExpanded = langToggle.getAttribute('aria-expanded') === 'true';
    langToggle.setAttribute('aria-expanded', !isExpanded);
  });

  // Close dropdown on clicking outside
  document.addEventListener('click', (e) => {
    if (!langPicker.contains(e.target)) {
      langPicker.classList.remove('open');
      langToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Handle language selection (Desktop)
  langItems.forEach(item => {
    item.addEventListener('click', () => {
      langItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      const lang = item.getAttribute('data-lang');
      langToggle.querySelector('span').textContent = lang.toUpperCase();
      langPicker.classList.remove('open');
      
      // Update active mobile lang button too
      mobLangBtns.forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-lang') === lang) b.classList.add('active');
      });

      switchLanguage(lang);
    });
  });

  // Handle language selection (Mobile)
  mobLangBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mobLangBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const lang = btn.getAttribute('data-lang');
      langToggle.querySelector('span').textContent = lang.toUpperCase();
      
      // Update active desktop lang item too
      langItems.forEach(i => {
        i.classList.remove('active');
        if (i.getAttribute('data-lang') === lang) i.classList.add('active');
      });

      switchLanguage(lang);
    });
  });

  // ── TRANSLATION ENGINE & DICTIONARY ──
  const translations = {
    en: {
      // NAV
      navHome: "Home", navStory: "Our Story", navPortfolios: "Portfolios",
      navWCU: "Why Choose Us", navInquiry: "Inquiry", btnQuote: "Request Quote",
      // HERO
      heroBadge: "ESTABLISHED SINCE 1937",
      heroTitle: "Bridging Indian <em>Heritage</em> with Global Markets.",
      heroDesc: "At TRINETRA EXPORTS, we bring the authentic sweetness of premium Indian jaggery, rich spices, and essential commodities, alongside robust industrial excavators, to clients worldwide. Sourced with care, exported with integrity.",
      btnExplore: "Explore Portfolio", btnLegacy: "Our Legacy",
      statLabel1: "Heritage Roots", statLabel2: "Organic Jaggery", statLabel3: "Global Destinations",
      // OUR STORY
      storyLabel: "Since 1937",
      storyTitle: "Best Quality, Service & Pure Organic Jaggery",
      storyP1: "At TRINETRA EXPORTS, we bring the authentic sweetness of premium Indian jaggery to customers across the world. Sourced from carefully selected farms and processed with attention to quality, our jaggery preserves its natural taste, rich color, and traditional purity. We are committed to delivering products that meet international standards while maintaining the original essence of Indian agriculture.",
      storyP2: "We offer a carefully selected range of export-quality products including natural jaggery, Indian spices, and grocery essentials. Our jaggery is sourced to preserve its rich taste and traditional purity, while our spices are selected for aroma, freshness, and authentic flavor. Along with this, we supply quality grocery products that meet international market requirements.",
      storyLink: "Explore our export divisions →",
      // PRODUCTS SECTION
      productsLabel: "Featured Products", productsTitle: "Our Premium Export Collection",
      productsDesc: "Explore our premium range of export-quality products carefully sourced, securely packed, and delivered worldwide with quality, freshness, and reliability.",
      tabAgro: "Agro-Commodities Division", tabMachinery: "Heavy Machinery Division",
      badgeFeatured: "Featured Product",
      // Jaggery Card
      jaggeryLocal: "Indian Gur / Shakkar", jaggeryName: "Premium Indian Jaggery",
      jaggeryDesc: "Sourced from heritage cane farms, preserving natural vitamins, iron content, rich deep golden color, and traditional purity. Completely free of chemicals or synthetic bleaching agents.",
      jaggeryB1: "Rich Aroma", jaggeryB2: "Chemical-Free", jaggeryB3: "Strict Quality Control",
      // Spices Card
      spicesLocal: "Masala & Herbage", spicesName: "Authentic Spices",
      spicesDesc: "Selected specifically for rich essential oil content, fresh aroma, and bold flavor. We export cardamom, turmeric, red chili, black & green pepper, cumin, and customized spice blends.",
      spicesB1: "High Aroma", spicesB2: "Perfect Moisture", spicesB3: "Eco-friendly Packing",
      // Pulses Card
      pulsesLocal: "Grocery Staples", pulsesName: "Essential Pulses & Grains",
      pulsesDesc: "Premium grade chickpeas, lentils, rice, and grocery staples processed to meet global food standards. Sortex cleaned and securely sealed for longer shelf-life.",
      pulsesB1: "Sortex Cleaned", pulsesB2: "Nutrient-Dense", pulsesB3: "Custom Quantities",
      // Machinery Card
      machLocal: "Heavy Equipment", machName: "Crawler Excavators",
      machDesc: "High-performance, fuel-efficient crawler excavators and heavy industrial machinery for international construction, mining, and agricultural drainage projects. Fully certified logistics.",
      machB1: "Heavy Duty", machB2: "Global Emissions Compliance", machB3: "Spares Support",
      // WHY CHOOSE US
      wcuLabel: "Our Process", wcuTitle: "From Farm to Export in Four Simple Steps",
      wcuDesc: "We combine direct farmer partnerships, rigorous quality control checks, and export-ready logistics so your supply chain remains seamless and highly dependable.",
      step1Title: "Farmer Partnerships", step1Desc: "We work directly with certified growers and sugarcane farms to source premium raw commodities and organic jaggery at the source, ensuring fair trade practices.",
      step2Title: "Quality Inspection", step2Desc: "Each cargo shipment undergoes multi-stage inspections and lab-testing for moisture, purity, and safety, strictly complying with APEDA and FSSAI food quality criteria.",
      step3Title: "Custom Packaging", step3Desc: "From bulk export bags to tailored retail packages, we pack and seal every batch using food-grade materials to preserve natural flavor and freshness during sea transit.",
      step4Title: "Export Logistics", step4Desc: "Our trade desk handles custom clearances, global marine freight lines, phytosanitary certifications, and tracking, ensuring your consignments arrive on time.",
      // LOGISTICS
      logisticsLabel: "Trusted Agricultural Exports Worldwide",
      logisticsTitle: "Let's Connect Global Markets Together",
      logisticsCTA: "Send Your Inquiry Today",
      roadTitle: "Road Freight", roadDesc: "Safe and reliable ground transportation.",
      oceanTitle: "Ocean Freight", oceanDesc: "Secure international sea cargo solutions.",
      airTitle: "Air Freight", airDesc: "Fast global shipping for urgent deliveries.",
      // PARTNER CTA
      partnerLabel: "Ready to Partner?", partnerTitle: "Start With a Free Sample",
      partnerDesc: "Whether you need a sample kit or a full container, our team is ready to assist with competitive pricing, custom packaging, and secure export documentation.",
      partnerBtn1: "Request Free Sample", partnerBtn2: "View All Products",
      // INQUIRY
      inquiryLabel: "Connect Globally", inquiryTitle: "Initiate a Trade Inquiry",
      inquiryP1: "Interested in sourcing our organic jaggery, Indian spices, essential pulses, or requesting custom machinery procurement?",
      inquiryP2: "Fill out our formal inquiry sheet. A regional trade coordinator will connect with you within 12 business hours.",
      formNameLabel: "Full Name *", formNamePlaceholder: "e.g., John Doe",
      formCompanyLabel: "Company / Firm Name *", formCompanyPlaceholder: "e.g., Global Foods Ltd",
      formEmailLabel: "Work Email *", formEmailPlaceholder: "e.g., buyer@company.com",
      formCategoryLabel: "Product Division of Interest *", formCategoryDefault: "Select a division...",
      formOptJaggery: "Premium Jaggery", formOptSpices: "Indian Spices",
      formOptPulses: "Essential Grains/Pulses", formOptExcavators: "Crawler Excavators",
      formOptAll: "Multiple Divisions",
      formMsgLabel: "Detailed Inquiry / Sourcing Volume Requirement *",
      formMsgPlaceholder: "Describe your destination port, shipping terms (FOB/CIF), and packaging/volume requirements...",
      formSubmitBtn: "Send Sourcing Request",
      // FOOTER
      footerTagline: "Partner with Trinetra Exports for trusted agricultural exports, premium organic jaggery, and dependable global trading solutions since 1937.",
      footerCompany: "Company",
      footerContact: "Get In Touch",
      footerQuickInquiry: "Quick Inquiry",
      footerNamePlaceholder: "Your Name", footerPhonePlaceholder: "Your Phone Number",
      footerSendBtn: "Send Inquiry",
      footerHome: "» Home", footerStory: "» Our Story", footerPortfolios: "» Portfolios",
      footerWCU: "» Why Choose Us", footerContact2: "» Contact",
      footerCopyright: "© 2026 Trinetra Exports. All Rights Reserved. Developed and Designed with ❤"
    },
    hi: {
      // NAV
      navHome: "होम", navStory: "हमारी कहानी", navPortfolios: "उत्पाद",
      navWCU: "हमारा चयन क्यों", navInquiry: "पूछताछ", btnQuote: "कोटेशन मांगें",
      // HERO
      heroBadge: "1937 से स्थापित",
      heroTitle: "भारतीय <em>धरोहर</em> को वैश्विक बाजारों से जोड़ना।",
      heroDesc: "त्रिनेत्र एक्सपोर्ट्स में, हम दुनिया भर के ग्राहकों के लिए प्रीमियम भारतीय गुड़ की असली मिठास, समृद्ध मसाले और आवश्यक खाद्य वस्तुएं, तथा मजबूत औद्योगिक उत्खनन यंत्र प्रदान करते हैं। सावधानीपूर्वक स्रोत और ईमानदारी से निर्यात।",
      btnExplore: "पोर्टफोलियो देखें", btnLegacy: "हमारी विरासत",
      statLabel1: "विरासत की जड़ें", statLabel2: "जैविक गुड़", statLabel3: "वैश्विक गंतव्य",
      // OUR STORY
      storyLabel: "1937 से",
      storyTitle: "सर्वोत्तम गुणवत्ता, सेवा और शुद्ध जैविक गुड़",
      storyP1: "त्रिनेत्र एक्सपोर्ट्स में, हम दुनिया भर के ग्राहकों को प्रीमियम भारतीय गुड़ की असली मिठास प्रदान करते हैं। सावधानी से चुने गए खेतों से प्राप्त और गुणवत्ता पर ध्यान देकर संसाधित, हमारा गुड़ अपने प्राकृतिक स्वाद, समृद्ध रंग और पारंपरिक शुद्धता को बनाए रखता है।",
      storyP2: "हम निर्यात-गुणवत्ता वाले उत्पादों की एक सावधानी से चुनी गई श्रृंखला प्रदान करते हैं जिसमें प्राकृतिक गुड़, भारतीय मसाले और किराना आवश्यक वस्तुएं शामिल हैं।",
      storyLink: "हमारे निर्यात विभाग देखें →",
      // PRODUCTS
      productsLabel: "विशेष उत्पाद", productsTitle: "हमारा प्रीमियम निर्यात संग्रह",
      productsDesc: "हमारी निर्यात-गुणवत्ता उत्पादों की प्रीमियम श्रृंखला देखें जो सावधानी से प्राप्त, सुरक्षित रूप से पैक और दुनिया भर में वितरित की जाती है।",
      tabAgro: "कृषि-वस्तु विभाग", tabMachinery: "भारी मशीनरी विभाग",
      badgeFeatured: "विशेष उत्पाद",
      jaggeryLocal: "भारतीय गुड़ / शक्कर", jaggeryName: "प्रीमियम भारतीय गुड़",
      jaggeryDesc: "विरासत गन्ना खेतों से प्राप्त, प्राकृतिक विटामिन, आयरन सामग्री, समृद्ध गहरे सुनहरे रंग और पारंपरिक शुद्धता को संरक्षित करता है।",
      jaggeryB1: "समृद्ध सुगंध", jaggeryB2: "रसायन-मुक्त", jaggeryB3: "सख्त गुणवत्ता नियंत्रण",
      spicesLocal: "मसाला और जड़ी-बूटी", spicesName: "असली मसाले",
      spicesDesc: "समृद्ध आवश्यक तेल सामग्री, ताजी सुगंध और तीव्र स्वाद के लिए विशेष रूप से चुने गए। हम इलायची, हल्दी, लाल मिर्च, काली और हरी मिर्च, जीरा निर्यात करते हैं।",
      spicesB1: "उच्च सुगंध", spicesB2: "सही नमी", spicesB3: "पर्यावरण-अनुकूल पैकिंग",
      pulsesLocal: "किराना आवश्यक वस्तुएं", pulsesName: "आवश्यक दालें और अनाज",
      pulsesDesc: "प्रीमियम ग्रेड चना, दाल, चावल और किराना आवश्यक वस्तुएं वैश्विक खाद्य मानकों को पूरा करने के लिए संसाधित।",
      pulsesB1: "सॉर्टेक्स साफ", pulsesB2: "पोषक तत्व-घना", pulsesB3: "कस्टम मात्रा",
      machLocal: "भारी उपकरण", machName: "क्रॉलर एक्सकेवेटर",
      machDesc: "अंतर्राष्ट्रीय निर्माण, खनन और कृषि जल निकासी परियोजनाओं के लिए उच्च-प्रदर्शन, ईंधन-कुशल क्रॉलर एक्सकेवेटर।",
      machB1: "भारी शुल्क", machB2: "वैश्विक उत्सर्जन अनुपालन", machB3: "स्पेयर पार्ट्स समर्थन",
      // WHY CHOOSE US
      wcuLabel: "हमारी प्रक्रिया", wcuTitle: "खेत से निर्यात तक चार सरल चरणों में",
      wcuDesc: "हम प्रत्यक्ष किसान साझेदारी, कठोर गुणवत्ता नियंत्रण जांच और निर्यात-तैयार रसद को जोड़ते हैं।",
      step1Title: "किसान साझेदारी", step1Desc: "हम प्रीमियम कच्ची वस्तुओं और जैविक गुड़ को स्रोत पर प्राप्त करने के लिए प्रमाणित किसानों के साथ सीधे काम करते हैं।",
      step2Title: "गुणवत्ता निरीक्षण", step2Desc: "प्रत्येक कार्गो शिपमेंट नमी, शुद्धता और सुरक्षा के लिए बहु-चरणीय निरीक्षणों और प्रयोगशाला-परीक्षण से गुजरता है।",
      step3Title: "कस्टम पैकेजिंग", step3Desc: "बल्क निर्यात बैग से लेकर खुदरा पैकेज तक, हम प्रत्येक बैच को खाद्य-ग्रेड सामग्री का उपयोग करके पैक करते हैं।",
      step4Title: "निर्यात रसद", step4Desc: "हमारा व्यापार डेस्क कस्टम क्लीयरेंस, वैश्विक समुद्री माल लाइनें और फाइटोसैनिटरी प्रमाणपत्र संभालता है।",
      // LOGISTICS
      logisticsLabel: "विश्वभर में विश्वसनीय कृषि निर्यात",
      logisticsTitle: "आइए वैश्विक बाजारों को साथ जोड़ें",
      logisticsCTA: "आज अपनी पूछताछ भेजें",
      roadTitle: "सड़क माल", roadDesc: "सुरक्षित और विश्वसनीय जमीनी परिवहन।",
      oceanTitle: "समुद्री माल", oceanDesc: "सुरक्षित अंतर्राष्ट्रीय समुद्री कार्गो समाधान।",
      airTitle: "हवाई माल", airDesc: "तत्काल डिलीवरी के लिए तेज वैश्विक शिपिंग।",
      // PARTNER CTA
      partnerLabel: "साझेदारी के लिए तैयार?", partnerTitle: "एक मुफ्त नमूने से शुरू करें",
      partnerDesc: "चाहे आपको एक नमूना किट या एक पूरा कंटेनर चाहिए, हमारी टीम प्रतिस्पर्धी मूल्य निर्धारण के साथ सहायता करने के लिए तैयार है।",
      partnerBtn1: "मुफ्त नमूना मांगें", partnerBtn2: "सभी उत्पाद देखें",
      // INQUIRY
      inquiryLabel: "वैश्विक स्तर पर जुड़ें", inquiryTitle: "एक व्यापार पूछताछ शुरू करें",
      inquiryP1: "हमारे जैविक गुड़, भारतीय मसाले, आवश्यक दालें, या कस्टम मशीनरी खरीद में रुचि रखते हैं?",
      inquiryP2: "हमारा औपचारिक पूछताछ फ़ॉर्म भरें। एक क्षेत्रीय व्यापार समन्वयक 12 व्यावसायिक घंटों में आपसे संपर्क करेगा।",
      formNameLabel: "पूरा नाम *", formNamePlaceholder: "जैसे, राम कुमार",
      formCompanyLabel: "कंपनी / फर्म का नाम *", formCompanyPlaceholder: "जैसे, ग्लोबल फूड्स लि.",
      formEmailLabel: "कार्य ईमेल *", formEmailPlaceholder: "जैसे, buyer@company.com",
      formCategoryLabel: "रुचि का उत्पाद विभाग *", formCategoryDefault: "विभाग चुनें...",
      formOptJaggery: "प्रीमियम गुड़", formOptSpices: "भारतीय मसाले",
      formOptPulses: "आवश्यक अनाज/दालें", formOptExcavators: "क्रॉलर एक्सकेवेटर",
      formOptAll: "एकाधिक विभाग",
      formMsgLabel: "विस्तृत पूछताछ / सोर्सिंग मात्रा आवश्यकता *",
      formMsgPlaceholder: "अपने गंतव्य बंदरगाह, शिपिंग शर्तें (FOB/CIF) और पैकेजिंग आवश्यकताओं का वर्णन करें...",
      formSubmitBtn: "सोर्सिंग अनुरोध भेजें",
      // FOOTER
      footerTagline: "1937 से विश्वसनीय कृषि निर्यात, प्रीमियम जैविक गुड़ और वैश्विक व्यापार समाधान के लिए त्रिनेत्र एक्सपोर्ट्स के साथ साझेदारी करें।",
      footerCompany: "कंपनी",
      footerContact: "संपर्क करें",
      footerQuickInquiry: "त्वरित पूछताछ",
      footerNamePlaceholder: "आपका नाम", footerPhonePlaceholder: "आपका फ़ोन नंबर",
      footerSendBtn: "पूछताछ भेजें",
      footerHome: "» होम", footerStory: "» हमारी कहानी", footerPortfolios: "» उत्पाद",
      footerWCU: "» हमारा चयन क्यों", footerContact2: "» संपर्क",
      footerCopyright: "© 2026 त्रिनेत्र एक्सपोर्ट्स। सर्वाधिकार सुरक्षित। ❤ के साथ विकसित और डिज़ाइन किया गया"
    },
    es: {
      // NAV
      navHome: "Inicio", navStory: "Nuestra Historia", navPortfolios: "Portafolios",
      navWCU: "Por Qué Elegirnos", navInquiry: "Consulta", btnQuote: "Solicitar Presupuesto",
      // HERO
      heroBadge: "ESTABLECIDO DESDE 1937",
      heroTitle: "Conectando el <em>Patrimonio</em> Indio con Mercados Globales.",
      heroDesc: "En TRINETRA EXPORTS, llevamos el dulzor auténtico de la panela india premium, especias ricas y productos esenciales, junto con excavadoras industriales robustas, a clientes de todo el mundo. Origen con cuidado, exportado con integridad.",
      btnExplore: "Explorar Portafolio", btnLegacy: "Nuestro Legado",
      statLabel1: "Raíces Históricas", statLabel2: "Panela Orgánica", statLabel3: "Destinos Globales",
      // OUR STORY
      storyLabel: "Desde 1937",
      storyTitle: "Mejor Calidad, Servicio y Panela Orgánica Pura",
      storyP1: "En TRINETRA EXPORTS, llevamos la auténtica dulzura de la panela india premium a clientes de todo el mundo. Obtenida de granjas cuidadosamente seleccionadas y procesada con atención a la calidad, nuestra panela preserva su sabor natural, color rico y pureza tradicional.",
      storyP2: "Ofrecemos una gama cuidadosamente seleccionada de productos de calidad para exportación que incluyen panela natural, especias indias y artículos esenciales de abarrotes.",
      storyLink: "Explorar nuestras divisiones de exportación →",
      // PRODUCTS
      productsLabel: "Productos Destacados", productsTitle: "Nuestra Colección Premium de Exportación",
      productsDesc: "Explore nuestra gama premium de productos de calidad para exportación cuidadosamente obtenidos, empacados de forma segura y entregados en todo el mundo.",
      tabAgro: "División Agro-Commodities", tabMachinery: "División de Maquinaria Pesada",
      badgeFeatured: "Producto Destacado",
      jaggeryLocal: "Gur / Shakkar Indio", jaggeryName: "Panela India Premium",
      jaggeryDesc: "Obtenida de granjas de caña hereditarias, conserva vitaminas naturales, contenido de hierro, color dorado profundo y pureza tradicional. Completamente libre de químicos.",
      jaggeryB1: "Rico Aroma", jaggeryB2: "Sin Químicos", jaggeryB3: "Control de Calidad Estricto",
      spicesLocal: "Masala y Hierbas", spicesName: "Especias Auténticas",
      spicesDesc: "Seleccionadas específicamente por su rico contenido en aceites esenciales, aroma fresco y sabor intenso. Exportamos cardamomo, cúrcuma, chile rojo, pimienta, comino y mezclas de especias.",
      spicesB1: "Alto Aroma", spicesB2: "Humedad Perfecta", spicesB3: "Empaque Ecológico",
      pulsesLocal: "Productos Básicos", pulsesName: "Legumbres y Granos Esenciales",
      pulsesDesc: "Garbanzos, lentejas, arroz y productos básicos de primera calidad procesados para cumplir con los estándares alimentarios globales.",
      pulsesB1: "Limpieza Sortex", pulsesB2: "Rico en Nutrientes", pulsesB3: "Cantidades Personalizadas",
      machLocal: "Equipo Pesado", machName: "Excavadoras de Orugas",
      machDesc: "Excavadoras de orugas de alto rendimiento y eficiencia de combustible para proyectos internacionales de construcción, minería y drenaje agrícola.",
      machB1: "Servicio Pesado", machB2: "Cumplimiento Global de Emisiones", machB3: "Soporte de Repuestos",
      // WHY CHOOSE US
      wcuLabel: "Nuestro Proceso", wcuTitle: "Del Campo a la Exportación en Cuatro Pasos",
      wcuDesc: "Combinamos asociaciones directas con agricultores, rigurosos controles de calidad y logística lista para exportar.",
      step1Title: "Asociaciones con Agricultores", step1Desc: "Trabajamos directamente con agricultores certificados para obtener materias primas premium y panela orgánica en la fuente.",
      step2Title: "Inspección de Calidad", step2Desc: "Cada envío de carga se somete a inspecciones de múltiples etapas y pruebas de laboratorio para humedad, pureza y seguridad.",
      step3Title: "Empaque Personalizado", step3Desc: "Desde bolsas de exportación a granel hasta paquetes minoristas personalizados, empacamos cada lote con materiales de grado alimenticio.",
      step4Title: "Logística de Exportación", step4Desc: "Nuestro escritorio de comercio maneja despachos de aduana, líneas de flete marino global y certificaciones fitosanitarias.",
      // LOGISTICS
      logisticsLabel: "Exportaciones Agrícolas de Confianza en Todo el Mundo",
      logisticsTitle: "Conectemos los Mercados Globales Juntos",
      logisticsCTA: "Envíe su Consulta Hoy",
      roadTitle: "Flete Terrestre", roadDesc: "Transporte terrestre seguro y confiable.",
      oceanTitle: "Flete Marítimo", oceanDesc: "Soluciones seguras de carga marítima internacional.",
      airTitle: "Flete Aéreo", airDesc: "Envío global rápido para entregas urgentes.",
      // PARTNER CTA
      partnerLabel: "¿Listo para Asociarse?", partnerTitle: "Comience con una Muestra Gratuita",
      partnerDesc: "Ya sea que necesite un kit de muestra o un contenedor completo, nuestro equipo está listo para ayudar con precios competitivos.",
      partnerBtn1: "Solicitar Muestra Gratuita", partnerBtn2: "Ver Todos los Productos",
      // INQUIRY
      inquiryLabel: "Conectar Globalmente", inquiryTitle: "Iniciar una Consulta Comercial",
      inquiryP1: "¿Interesado en obtener nuestra panela orgánica, especias indias, legumbres esenciales o maquinaria personalizada?",
      inquiryP2: "Complete nuestra hoja de consulta formal. Un coordinador comercial regional se comunicará con usted en 12 horas hábiles.",
      formNameLabel: "Nombre Completo *", formNamePlaceholder: "ej., Juan García",
      formCompanyLabel: "Nombre de Empresa / Firma *", formCompanyPlaceholder: "ej., Global Foods Ltd",
      formEmailLabel: "Correo de Trabajo *", formEmailPlaceholder: "ej., comprador@empresa.com",
      formCategoryLabel: "División de Producto de Interés *", formCategoryDefault: "Seleccione una división...",
      formOptJaggery: "Panela Premium", formOptSpices: "Especias Indias",
      formOptPulses: "Granos/Legumbres Esenciales", formOptExcavators: "Excavadoras de Orugas",
      formOptAll: "Múltiples Divisiones",
      formMsgLabel: "Consulta Detallada / Requisito de Volumen *",
      formMsgPlaceholder: "Describa su puerto de destino, términos de envío (FOB/CIF) y requisitos de empaque/volumen...",
      formSubmitBtn: "Enviar Solicitud de Abastecimiento",
      // FOOTER
      footerTagline: "Asóciese con Trinetra Exports para exportaciones agrícolas confiables, panela orgánica premium y soluciones de comercio global desde 1937.",
      footerCompany: "Empresa",
      footerContact: "Contáctenos",
      footerQuickInquiry: "Consulta Rápida",
      footerNamePlaceholder: "Su Nombre", footerPhonePlaceholder: "Su Número de Teléfono",
      footerSendBtn: "Enviar Consulta",
      footerHome: "» Inicio", footerStory: "» Nuestra Historia", footerPortfolios: "» Portafolios",
      footerWCU: "» Por Qué Elegirnos", footerContact2: "» Contacto",
      footerCopyright: "© 2026 Trinetra Exports. Todos los derechos reservados. Desarrollado y diseñado con ❤"
    },
    de: {
      // NAV
      navHome: "Startseite", navStory: "Geschichte", navPortfolios: "Portfolios",
      navWCU: "Warum Wir", navInquiry: "Anfrage", btnQuote: "Angebot Anfordern",
      // HERO
      heroBadge: "GEGRÜNDET SEIT 1937",
      heroTitle: "Verbindung des indischen <em>Erbes</em> mit globalen Märkten.",
      heroDesc: "Bei TRINETRA EXPORTS bringen wir die authentische Süße von feinstem indischem Jaggery, aromatischen Gewürzen und Grundnahrungsmitteln sowie robusten Industrie-Baggern zu Kunden weltweit. Mit Sorgfalt bezogen, mit Integrität exportiert.",
      btnExplore: "Portfolio Erkunden", btnLegacy: "Unser Erbe",
      statLabel1: "Historische Wurzeln", statLabel2: "Bio-Jaggery", statLabel3: "Globale Ziele",
      // OUR STORY
      storyLabel: "Seit 1937",
      storyTitle: "Beste Qualität, Service & reiner Bio-Jaggery",
      storyP1: "Bei TRINETRA EXPORTS bringen wir die authentische Süße von hochwertigem indischen Jaggery zu Kunden auf der ganzen Welt. Aus sorgfältig ausgewählten Farmen bezogen und mit Aufmerksamkeit für Qualität verarbeitet, bewahrt unser Jaggery seinen natürlichen Geschmack, reiche Farbe und traditionelle Reinheit.",
      storyP2: "Wir bieten eine sorgfältig ausgewählte Palette exportqualität Produkte an, einschließlich natürlichem Jaggery, indischen Gewürzen und Lebensmittelgrundnahrungsmitteln.",
      storyLink: "Unsere Exportabteilungen erkunden →",
      // PRODUCTS
      productsLabel: "Ausgewählte Produkte", productsTitle: "Unsere Premium-Exportkollektion",
      productsDesc: "Erkunden Sie unsere Premium-Palette exportqualität Produkte, sorgfältig bezogen, sicher verpackt und weltweit geliefert.",
      tabAgro: "Agrar-Rohstoffe Abteilung", tabMachinery: "Schwermaschinenabteilung",
      badgeFeatured: "Ausgewähltes Produkt",
      jaggeryLocal: "Indischer Gur / Shakkar", jaggeryName: "Premium Indischer Jaggery",
      jaggeryDesc: "Aus traditionellen Zuckerrohrfarmen bezogen, bewahrt natürliche Vitamine, Eisengehalt, sattes Goldbraun und traditionelle Reinheit. Vollständig frei von Chemikalien.",
      jaggeryB1: "Reiches Aroma", jaggeryB2: "Chemikalienfrei", jaggeryB3: "Strenge Qualitätskontrolle",
      spicesLocal: "Masala & Kräuter", spicesName: "Authentische Gewürze",
      spicesDesc: "Speziell für reichen ätherischen Ölgehalt, frisches Aroma und intensiven Geschmack ausgewählt. Wir exportieren Kardamom, Kurkuma, roten Chili, schwarzen & grünen Pfeffer, Kreuzkümmel.",
      spicesB1: "Hohes Aroma", spicesB2: "Perfekte Feuchtigkeit", spicesB3: "Umweltfreundliche Verpackung",
      pulsesLocal: "Lebensmittelgrundlagen", pulsesName: "Wichtige Hülsenfrüchte & Getreide",
      pulsesDesc: "Kichererbsen, Linsen, Reis und Lebensmittelgrundlagen der Premiumklasse, verarbeitet nach globalen Lebensmittelstandards.",
      pulsesB1: "Sortex gereinigt", pulsesB2: "Nährstoffreich", pulsesB3: "Individuelle Mengen",
      machLocal: "Schwere Ausrüstung", machName: "Kettenbagger",
      machDesc: "Leistungsstarke, kraftstoffeffiziente Kettenbagger für internationale Bau-, Bergbau- und Entwässerungsprojekte.",
      machB1: "Schwerlast", machB2: "Globale Emissionskonformität", machB3: "Ersatzteilversorgung",
      // WHY CHOOSE US
      wcuLabel: "Unser Prozess", wcuTitle: "Vom Feld zum Export in Vier Einfachen Schritten",
      wcuDesc: "Wir kombinieren direkte Bauernpartnerschaften, strenge Qualitätskontrollen und exportfertige Logistik.",
      step1Title: "Bauernpartnerschaften", step1Desc: "Wir arbeiten direkt mit zertifizierten Landwirten zusammen, um Premium-Rohstoffe und Bio-Jaggery direkt an der Quelle zu beziehen.",
      step2Title: "Qualitätskontrolle", step2Desc: "Jede Sendung durchläuft mehrstufige Inspektionen und Labortests auf Feuchtigkeit, Reinheit und Sicherheit.",
      step3Title: "Individuelle Verpackung", step3Desc: "Von Großexporttüten bis zu maßgeschneiderten Einzelhandelspaketen packen wir jede Charge mit lebensmittelechten Materialien.",
      step4Title: "Exportlogistik", step4Desc: "Unser Handelsschalter bearbeitet Zollformalitäten, globale Seefrachtlinien und phytosanitäre Zertifizierungen.",
      // LOGISTICS
      logisticsLabel: "Vertrauenswürdige Agrarexporte Weltweit",
      logisticsTitle: "Lassen Sie uns Globale Märkte Gemeinsam Verbinden",
      logisticsCTA: "Senden Sie Ihre Anfrage Heute",
      roadTitle: "Straßenfracht", roadDesc: "Sicherer und zuverlässiger Landtransport.",
      oceanTitle: "Seefracht", oceanDesc: "Sichere internationale Seefrachttlösungen.",
      airTitle: "Luftfracht", airDesc: "Schneller globaler Versand für dringende Lieferungen.",
      // PARTNER CTA
      partnerLabel: "Bereit zur Partnerschaft?", partnerTitle: "Beginnen Sie mit einer Kostenlosen Probe",
      partnerDesc: "Ob Sie ein Musterkit oder einen vollen Container benötigen, unser Team ist bereit zu helfen.",
      partnerBtn1: "Kostenlose Probe Anfordern", partnerBtn2: "Alle Produkte Anzeigen",
      // INQUIRY
      inquiryLabel: "Global Verbinden", inquiryTitle: "Eine Handelsanfrage Starten",
      inquiryP1: "Interessiert an unserem Bio-Jaggery, indischen Gewürzen, wichtigen Hülsenfrüchten oder individuellem Maschinenkauf?",
      inquiryP2: "Füllen Sie unser formelles Anfrageformular aus. Ein regionaler Handelskoordinator wird sich innerhalb von 12 Geschäftsstunden bei Ihnen melden.",
      formNameLabel: "Vollständiger Name *", formNamePlaceholder: "z.B., Max Mustermann",
      formCompanyLabel: "Firmen- / Unternehmensname *", formCompanyPlaceholder: "z.B., Global Foods GmbH",
      formEmailLabel: "Geschäfts-E-Mail *", formEmailPlaceholder: "z.B., kaeufer@firma.com",
      formCategoryLabel: "Produktabteilung von Interesse *", formCategoryDefault: "Abteilung auswählen...",
      formOptJaggery: "Premium Jaggery", formOptSpices: "Indische Gewürze",
      formOptPulses: "Wichtige Getreide/Hülsenfrüchte", formOptExcavators: "Kettenbagger",
      formOptAll: "Mehrere Abteilungen",
      formMsgLabel: "Detaillierte Anfrage / Beschaffungsvolumen *",
      formMsgPlaceholder: "Beschreiben Sie Ihren Zielhafen, Versandbedingungen (FOB/CIF) und Verpackungsanforderungen...",
      formSubmitBtn: "Beschaffungsanfrage Senden",
      // FOOTER
      footerTagline: "Partnerschaft mit Trinetra Exports für vertrauenswürdige Agrarexporte, Bio-Jaggery und globale Handelslösungen seit 1937.",
      footerCompany: "Unternehmen",
      footerContact: "Kontakt",
      footerQuickInquiry: "Schnellanfrage",
      footerNamePlaceholder: "Ihr Name", footerPhonePlaceholder: "Ihre Telefonnummer",
      footerSendBtn: "Anfrage Senden",
      footerHome: "» Startseite", footerStory: "» Geschichte", footerPortfolios: "» Portfolios",
      footerWCU: "» Warum Wir", footerContact2: "» Kontakt",
      footerCopyright: "© 2026 Trinetra Exports. Alle Rechte vorbehalten. Entwickelt und gestaltet mit ❤"
    },

    // ── ARABIC ──
    ar: {
      navHome: "الرئيسية", navStory: "قصتنا", navPortfolios: "محافظنا",
      navWCU: "لماذا نحن", navInquiry: "استفسار", btnQuote: "طلب عرض سعر",
      heroBadge: "تأسست منذ 2010",
      heroTitle: "ربط <em>التراث</em> الهندي بالأسواق العالمية.",
      heroDesc: "في تريناتا إكسبورتس، نجلب حلاوة جاكيري الهندي الأصيل والبهارات والسلع الأساسية إلى عملاء حول العالم. مصادر بعناية، مُصدَّرة بنزاهة.",
      btnExplore: "استكشف المحفظة", btnLegacy: "إرثنا",
      statLabel1: "جذور تاريخية", statLabel2: "جاكيري عضوي", statLabel3: "وجهات عالمية",
      storyLabel: "منذ 2010",
      storyTitle: "أفضل جودة وخدمة وجاكيري عضوي خالص",
      storyP1: "في تريناتا إكسبورتس، نقدم حلاوة الجاكيري الهندي الممتاز للعملاء في جميع أنحاء العالم، محافظاً على طعمه الطبيعي ولونه الغني ونقاوته التقليدية.",
      storyP2: "نقدم مجموعة مختارة من منتجات التصدير عالية الجودة تشمل الجاكيري الطبيعي والبهارات الهندية والمواد الغذائية الأساسية.",
      storyLink: "استكشاف أقسام التصدير →",
      productsLabel: "المنتجات المميزة", productsTitle: "مجموعتنا الممتازة للتصدير",
      productsDesc: "استكشف مجموعتنا الممتازة من منتجات التصدير المختارة بعناية والمعبأة بأمان والمُسلَّمة في جميع أنحاء العالم.",
      tabAgro: "قسم السلع الزراعية", tabMachinery: "قسم الآلات الثقيلة",
      badgeFeatured: "منتج مميز",
      jaggeryLocal: "جور / شاكار هندي", jaggeryName: "جاكيري هندي ممتاز",
      jaggeryDesc: "مصدر من مزارع قصب السكر التراثية، يحافظ على الفيتامينات الطبيعية والحديد واللون الذهبي العميق والنقاوة التقليدية. خالٍ تماماً من المواد الكيميائية.",
      jaggeryB1: "عطر غني", jaggeryB2: "خالٍ من المواد الكيميائية", jaggeryB3: "رقابة صارمة على الجودة",
      spicesLocal: "مسالا وأعشاب", spicesName: "بهارات أصيلة",
      spicesDesc: "مختارة خصيصاً لمحتواها الغني من الزيوت العطرية وعطرها الطازج ونكهتها المكثفة. نصدر الهيل والكركم والفلفل الأحمر والكمون.",
      spicesB1: "عطر عالٍ", spicesB2: "رطوبة مثالية", spicesB3: "تغليف صديق للبيئة",
      pulsesLocal: "مواد غذائية أساسية", pulsesName: "بقوليات وحبوب أساسية",
      pulsesDesc: "حمص وعدس وأرز ومواد غذائية أساسية درجة أولى معالجة وفق المعايير الغذائية العالمية.",
      pulsesB1: "نظيف بالفرز", pulsesB2: "غني بالمغذيات", pulsesB3: "كميات مخصصة",
      machLocal: "معدات ثقيلة", machName: "حفارات زاحفة",
      machDesc: "حفارات زاحفة عالية الأداء وموفرة للوقود لمشاريع البناء والتعدين الدولية.",
      machB1: "للأعمال الشاقة", machB2: "امتثال انبعاثات عالمي", machB3: "دعم قطع الغيار",
      wcuLabel: "عمليتنا", wcuTitle: "من الحقل إلى التصدير في أربع خطوات",
      wcuDesc: "نجمع بين الشراكات المباشرة مع المزارعين ورقابة الجودة الصارمة واللوجستيات الجاهزة للتصدير.",
      step1Title: "شراكات المزارعين", step1Desc: "نعمل مباشرة مع المزارعين المعتمدين للحصول على المواد الخام الممتازة والجاكيري العضوي من المصدر.",
      step2Title: "فحص الجودة", step2Desc: "تخضع كل شحنة لعمليات تفتيش متعددة المراحل واختبارات مختبرية للرطوبة والنقاوة والسلامة.",
      step3Title: "تغليف مخصص", step3Desc: "من أكياس التصدير بالجملة إلى العبوات المخصصة، نعبئ كل دفعة بمواد غذائية المستوى.",
      step4Title: "لوجستيات التصدير", step4Desc: "يتولى مكتب التجارة لدينا الإجراءات الجمركية وخطوط الشحن البحري العالمية وشهادات الصحة النباتية.",
      logisticsLabel: "صادرات زراعية موثوقة في جميع أنحاء العالم",
      logisticsTitle: "دعونا نربط الأسواق العالمية معاً",
      logisticsCTA: "أرسل استفسارك اليوم",
      roadTitle: "الشحن البري", roadDesc: "نقل بري آمن وموثوق لمنتجاتك الزراعية.",
      oceanTitle: "الشحن البحري", oceanDesc: "حلول شحن بحري دولي آمنة وفعالة.",
      airTitle: "الشحن الجوي", airDesc: "شحن جوي سريع للتسليمات العاجلة.",
      partnerLabel: "هل أنت مستعد للشراكة؟", partnerTitle: "ابدأ بعينة مجانية",
      partnerDesc: "سواء كنت بحاجة إلى مجموعة عينات أو حاوية كاملة، فريقنا مستعد للمساعدة بأسعار تنافسية.",
      partnerBtn1: "طلب عينة مجانية", partnerBtn2: "عرض جميع المنتجات",
      inquiryLabel: "تواصل عالمياً", inquiryTitle: "ابدأ استفساراً تجارياً",
      inquiryP1: "مهتم بشراء جاكيري عضوي أو بهارات هندية أو بقوليات أساسية أو شراء آلات مخصصة؟",
      inquiryP2: "املأ نموذج الاستفسار الرسمي. سيتصل بك منسق تجاري إقليمي خلال 12 ساعة عمل.",
      formNameLabel: "الاسم الكامل *", formNamePlaceholder: "مثال: أحمد محمد",
      formCompanyLabel: "اسم الشركة / المؤسسة *", formCompanyPlaceholder: "مثال: Global Foods Ltd",
      formEmailLabel: "البريد الإلكتروني *", formEmailPlaceholder: "مثال: buyer@company.com",
      formCategoryLabel: "قسم المنتج المطلوب *", formCategoryDefault: "اختر قسماً...",
      formOptJaggery: "جاكيري ممتاز", formOptSpices: "بهارات هندية",
      formOptPulses: "حبوب / بقوليات", formOptExcavators: "حفارات زاحفة",
      formOptAll: "أقسام متعددة",
      formMsgLabel: "استفسار مفصل / متطلبات الكمية *",
      formMsgPlaceholder: "صف ميناء الوجهة وشروط الشحن (FOB/CIF) ومتطلبات التغليف...",
      formSubmitBtn: "إرسال طلب التوريد",
      footerTagline: "شارك تريناتا إكسبورتس لصادرات زراعية موثوقة وجاكيري عضوي ممتاز وحلول تجارية عالمية منذ 2010.",
      footerCompany: "الشركة", footerContact: "تواصل معنا", footerQuickInquiry: "استفسار سريع",
      footerNamePlaceholder: "اسمك", footerPhonePlaceholder: "رقم هاتفك",
      footerSendBtn: "إرسال الاستفسار",
      footerHome: "» الرئيسية", footerStory: "» قصتنا", footerPortfolios: "» المنتجات",
      footerWCU: "» لماذا نحن", footerContact2: "» تواصل",
      footerCopyright: "© 2026 تريناتا إكسبورتس. جميع الحقوق محفوظة. صُمِّم بـ ❤"
    },

    // ── FRENCH ──
    fr: {
      navHome: "Accueil", navStory: "Notre Histoire", navPortfolios: "Portfolios",
      navWCU: "Pourquoi Nous", navInquiry: "Demande", btnQuote: "Demander un Devis",
      heroBadge: "ÉTABLI DEPUIS 2010",
      heroTitle: "Relier le <em>Patrimoine</em> Indien aux Marchés Mondiaux.",
      heroDesc: "Chez TRINETRA EXPORTS, nous apportons la douceur authentique du jaggery indien premium, des épices riches et des produits de base à des clients du monde entier. Sourcé avec soin, exporté avec intégrité.",
      btnExplore: "Explorer le Portfolio", btnLegacy: "Notre Héritage",
      statLabel1: "Racines Historiques", statLabel2: "Jaggery Bio", statLabel3: "Destinations Mondiales",
      storyLabel: "Depuis 2010",
      storyTitle: "Meilleure Qualité, Service & Jaggery Bio Pur",
      storyP1: "Chez TRINETRA EXPORTS, nous apportons la douceur authentique du jaggery indien premium à des clients partout dans le monde. Sourcé de fermes soigneusement sélectionnées, notre jaggery préserve son goût naturel, sa couleur riche et sa pureté traditionnelle.",
      storyP2: "Nous offrons une gamme soigneusement sélectionnée de produits d'exportation de qualité incluant le jaggery naturel, les épices indiennes et les denrées alimentaires essentielles.",
      storyLink: "Explorer nos divisions d'exportation →",
      productsLabel: "Produits Vedettes", productsTitle: "Notre Collection Premium d'Exportation",
      productsDesc: "Explorez notre gamme premium de produits d'exportation soigneusement sourcés, emballés et livrés dans le monde entier.",
      tabAgro: "Division Agro-Commodités", tabMachinery: "Division Machines Lourdes",
      badgeFeatured: "Produit Vedette",
      jaggeryLocal: "Gur / Shakkar Indien", jaggeryName: "Jaggery Indien Premium",
      jaggeryDesc: "Sourcé de fermes de canne héritières, préservant les vitamines naturelles, la teneur en fer, la couleur dorée profonde et la pureté traditionnelle. Entièrement exempt de produits chimiques.",
      jaggeryB1: "Arôme Riche", jaggeryB2: "Sans Chimiques", jaggeryB3: "Contrôle Qualité Strict",
      spicesLocal: "Masala & Herbes", spicesName: "Épices Authentiques",
      spicesDesc: "Sélectionnées spécifiquement pour leur teneur en huiles essentielles, leur arôme frais et leur saveur intense. Nous exportons cardamome, curcuma, piment rouge, cumin.",
      spicesB1: "Arôme Élevé", spicesB2: "Humidité Parfaite", spicesB3: "Emballage Écologique",
      pulsesLocal: "Denrées de Base", pulsesName: "Légumineuses & Céréales Essentielles",
      pulsesDesc: "Pois chiches, lentilles, riz et denrées alimentaires de première qualité transformées selon les normes alimentaires mondiales.",
      pulsesB1: "Nettoyé Sortex", pulsesB2: "Riche en Nutriments", pulsesB3: "Quantités Personnalisées",
      machLocal: "Équipement Lourd", machName: "Excavateurs à Chenilles",
      machDesc: "Excavateurs à chenilles haute performance et économes en carburant pour les projets internationaux de construction et d'exploitation minière.",
      machB1: "Service Intensif", machB2: "Conformité Émissions Mondiale", machB3: "Support Pièces Détachées",
      wcuLabel: "Notre Processus", wcuTitle: "Du Champ à l'Export en Quatre Étapes",
      wcuDesc: "Nous combinons des partenariats directs avec les agriculteurs, des contrôles qualité rigoureux et une logistique prête à l'export.",
      step1Title: "Partenariats Agriculteurs", step1Desc: "Nous travaillons directement avec des agriculteurs certifiés pour sourcer des matières premières premium et du jaggery bio à la source.",
      step2Title: "Inspection Qualité", step2Desc: "Chaque expédition subit des inspections multi-étapes et des tests en laboratoire pour l'humidité, la pureté et la sécurité.",
      step3Title: "Emballage Personnalisé", step3Desc: "Des sacs d'exportation en vrac aux emballages retail sur mesure, nous emballons chaque lot avec des matériaux alimentaires.",
      step4Title: "Logistique d'Exportation", step4Desc: "Notre bureau commercial gère les dédouanements, les lignes de fret maritime mondial et les certifications phytosanitaires.",
      logisticsLabel: "Exportations Agricoles Fiables dans le Monde",
      logisticsTitle: "Connectons les Marchés Mondiaux Ensemble",
      logisticsCTA: "Envoyez Votre Demande Aujourd'hui",
      roadTitle: "Fret Routier", roadDesc: "Transport terrestre sûr et fiable.",
      oceanTitle: "Fret Maritime", oceanDesc: "Solutions de fret maritime international sécurisées.",
      airTitle: "Fret Aérien", airDesc: "Expédition mondiale rapide pour livraisons urgentes.",
      partnerLabel: "Prêt à Collaborer?", partnerTitle: "Commencez avec un Échantillon Gratuit",
      partnerDesc: "Que vous ayez besoin d'un kit d'échantillons ou d'un conteneur complet, notre équipe est prête à aider avec des prix compétitifs.",
      partnerBtn1: "Demander un Échantillon Gratuit", partnerBtn2: "Voir Tous les Produits",
      inquiryLabel: "Se Connecter Mondialement", inquiryTitle: "Initier une Demande Commerciale",
      inquiryP1: "Intéressé par notre jaggery bio, épices indiennes, légumineuses essentielles ou achat de machines personnalisées?",
      inquiryP2: "Remplissez notre fiche de demande formelle. Un coordinateur commercial régional vous contactera dans les 12 heures ouvrables.",
      formNameLabel: "Nom Complet *", formNamePlaceholder: "ex., Jean Dupont",
      formCompanyLabel: "Nom de Société / Entreprise *", formCompanyPlaceholder: "ex., Global Foods SA",
      formEmailLabel: "Email Professionnel *", formEmailPlaceholder: "ex., acheteur@societe.com",
      formCategoryLabel: "Division Produit d'Intérêt *", formCategoryDefault: "Sélectionner une division...",
      formOptJaggery: "Jaggery Premium", formOptSpices: "Épices Indiennes",
      formOptPulses: "Céréales / Légumineuses", formOptExcavators: "Excavateurs à Chenilles",
      formOptAll: "Plusieurs Divisions",
      formMsgLabel: "Demande Détaillée / Volume de Sourcing *",
      formMsgPlaceholder: "Décrivez votre port de destination, conditions d'expédition (FOB/CIF) et exigences d'emballage...",
      formSubmitBtn: "Envoyer la Demande de Sourcing",
      footerTagline: "Partenaire de Trinetra Exports pour des exportations agricoles fiables, du jaggery bio premium et des solutions commerciales mondiales depuis 2010.",
      footerCompany: "Entreprise", footerContact: "Nous Contacter", footerQuickInquiry: "Demande Rapide",
      footerNamePlaceholder: "Votre Nom", footerPhonePlaceholder: "Votre Numéro de Téléphone",
      footerSendBtn: "Envoyer la Demande",
      footerHome: "» Accueil", footerStory: "» Notre Histoire", footerPortfolios: "» Produits",
      footerWCU: "» Pourquoi Nous", footerContact2: "» Contact",
      footerCopyright: "© 2026 Trinetra Exports. Tous Droits Réservés. Développé avec ❤"
    },

    // ── PORTUGUESE ──
    pt: {
      navHome: "Início", navStory: "Nossa História", navPortfolios: "Portfólios",
      navWCU: "Por Que Nós", navInquiry: "Consulta", btnQuote: "Solicitar Cotação",
      heroBadge: "ESTABELECIDO DESDE 2010",
      heroTitle: "Conectando o <em>Patrimônio</em> Indiano aos Mercados Globais.",
      heroDesc: "Na TRINETRA EXPORTS, levamos a autêntica doçura do jaggery indiano premium, especiarias ricas e commodities essenciais a clientes em todo o mundo. Adquirido com cuidado, exportado com integridade.",
      btnExplore: "Explorar Portfólio", btnLegacy: "Nosso Legado",
      statLabel1: "Raízes Históricas", statLabel2: "Jaggery Orgânico", statLabel3: "Destinos Globais",
      storyLabel: "Desde 2010",
      storyTitle: "Melhor Qualidade, Serviço & Jaggery Orgânico Puro",
      storyP1: "Na TRINETRA EXPORTS, levamos a doçura autêntica do jaggery indiano premium a clientes em todo o mundo. Adquirido de fazendas cuidadosamente selecionadas, nosso jaggery preserva seu sabor natural, cor rica e pureza tradicional.",
      storyP2: "Oferecemos uma gama cuidadosamente selecionada de produtos de exportação de qualidade incluindo jaggery natural, especiarias indianas e itens essenciais.",
      storyLink: "Explorar nossas divisões de exportação →",
      productsLabel: "Produtos em Destaque", productsTitle: "Nossa Coleção Premium de Exportação",
      productsDesc: "Explore nossa gama premium de produtos de exportação cuidadosamente adquiridos, embalados com segurança e entregues em todo o mundo.",
      tabAgro: "Divisão Agro-Commodities", tabMachinery: "Divisão de Maquinário Pesado",
      badgeFeatured: "Produto em Destaque",
      jaggeryLocal: "Gur / Shakkar Indiano", jaggeryName: "Jaggery Indiano Premium",
      jaggeryDesc: "Adquirido de fazendas tradicionais de cana, preservando vitaminas naturais, teor de ferro, cor dourada profunda e pureza tradicional. Completamente livre de químicos.",
      jaggeryB1: "Aroma Rico", jaggeryB2: "Sem Químicos", jaggeryB3: "Controle de Qualidade Rigoroso",
      spicesLocal: "Masala & Ervas", spicesName: "Especiarias Autênticas",
      spicesDesc: "Selecionadas especificamente por seu rico teor de óleos essenciais, aroma fresco e sabor intenso. Exportamos cardamomo, cúrcuma, pimenta vermelha, cominho.",
      spicesB1: "Alto Aroma", spicesB2: "Umidade Perfeita", spicesB3: "Embalagem Ecológica",
      pulsesLocal: "Alimentos Básicos", pulsesName: "Leguminosas & Grãos Essenciais",
      pulsesDesc: "Grão-de-bico, lentilhas, arroz e alimentos básicos de primeira qualidade processados conforme padrões alimentares globais.",
      pulsesB1: "Limpo por Sortex", pulsesB2: "Rico em Nutrientes", pulsesB3: "Quantidades Personalizadas",
      machLocal: "Equipamento Pesado", machName: "Escavadeiras de Esteira",
      machDesc: "Escavadeiras de esteira de alto desempenho e eficiência de combustível para projetos internacionais de construção e mineração.",
      machB1: "Serviço Pesado", machB2: "Conformidade Global de Emissões", machB3: "Suporte de Peças",
      wcuLabel: "Nosso Processo", wcuTitle: "Do Campo à Exportação em Quatro Etapas",
      wcuDesc: "Combinamos parcerias diretas com agricultores, controles de qualidade rigorosos e logística pronta para exportação.",
      step1Title: "Parcerias com Agricultores", step1Desc: "Trabalhamos diretamente com agricultores certificados para adquirir matérias-primas premium e jaggery orgânico na fonte.",
      step2Title: "Inspeção de Qualidade", step2Desc: "Cada remessa passa por inspeções em múltiplos estágios e testes laboratoriais para umidade, pureza e segurança.",
      step3Title: "Embalagem Personalizada", step3Desc: "De sacas de exportação a granel a embalagens retail personalizadas, embalamos cada lote com materiais grau alimentício.",
      step4Title: "Logística de Exportação", step4Desc: "Nossa mesa de comércio cuida de desembaraços aduaneiros, linhas de frete marítimo global e certificações fitossanitárias.",
      logisticsLabel: "Exportações Agrícolas Confiáveis no Mundo Todo",
      logisticsTitle: "Vamos Conectar os Mercados Globais Juntos",
      logisticsCTA: "Envie Sua Consulta Hoje",
      roadTitle: "Frete Rodoviário", roadDesc: "Transporte terrestre seguro e confiável.",
      oceanTitle: "Frete Marítimo", oceanDesc: "Soluções de carga marítima internacional seguras.",
      airTitle: "Frete Aéreo", airDesc: "Envio global rápido para entregas urgentes.",
      partnerLabel: "Pronto para Parcerias?", partnerTitle: "Comece com uma Amostra Gratuita",
      partnerDesc: "Seja um kit de amostras ou um contêiner completo, nossa equipe está pronta para ajudar com preços competitivos.",
      partnerBtn1: "Solicitar Amostra Gratuita", partnerBtn2: "Ver Todos os Produtos",
      inquiryLabel: "Conectar Globalmente", inquiryTitle: "Iniciar uma Consulta Comercial",
      inquiryP1: "Interessado em adquirir nosso jaggery orgânico, especiarias indianas, leguminosas essenciais ou maquinário personalizado?",
      inquiryP2: "Preencha nossa ficha de consulta formal. Um coordenador comercial regional entrará em contato em 12 horas úteis.",
      formNameLabel: "Nome Completo *", formNamePlaceholder: "ex., João Silva",
      formCompanyLabel: "Nome da Empresa / Firma *", formCompanyPlaceholder: "ex., Global Foods Ltda",
      formEmailLabel: "Email Corporativo *", formEmailPlaceholder: "ex., comprador@empresa.com",
      formCategoryLabel: "Divisão de Produto de Interesse *", formCategoryDefault: "Selecionar uma divisão...",
      formOptJaggery: "Jaggery Premium", formOptSpices: "Especiarias Indianas",
      formOptPulses: "Grãos / Leguminosas", formOptExcavators: "Escavadeiras de Esteira",
      formOptAll: "Múltiplas Divisões",
      formMsgLabel: "Consulta Detalhada / Requisito de Volume *",
      formMsgPlaceholder: "Descreva seu porto de destino, termos de envio (FOB/CIF) e requisitos de embalagem...",
      formSubmitBtn: "Enviar Solicitação de Fornecimento",
      footerTagline: "Parceiro da Trinetra Exports para exportações agrícolas confiáveis, jaggery orgânico premium e soluções comerciais globais desde 2010.",
      footerCompany: "Empresa", footerContact: "Entre em Contato", footerQuickInquiry: "Consulta Rápida",
      footerNamePlaceholder: "Seu Nome", footerPhonePlaceholder: "Seu Número de Telefone",
      footerSendBtn: "Enviar Consulta",
      footerHome: "» Início", footerStory: "» Nossa História", footerPortfolios: "» Produtos",
      footerWCU: "» Por Que Nós", footerContact2: "» Contato",
      footerCopyright: "© 2026 Trinetra Exports. Todos os Direitos Reservados. Desenvolvido com ❤"
    },

    // ── CHINESE SIMPLIFIED ──
    zh: {
      navHome: "首页", navStory: "我们的故事", navPortfolios: "产品组合",
      navWCU: "为什么选择我们", navInquiry: "询盘", btnQuote: "请求报价",
      heroBadge: "成立于2010年",
      heroTitle: "连接印度<em>传承</em>与全球市场。",
      heroDesc: "在TRINETRA EXPORTS，我们将优质印度粗糖的纯正甜蜜、香料和基本商品带给全球客户。用心采购，诚信出口。",
      btnExplore: "探索产品组合", btnLegacy: "我们的传承",
      statLabel1: "历史根源", statLabel2: "有机粗糖", statLabel3: "全球目的地",
      storyLabel: "自2010年起",
      storyTitle: "最优品质、服务与纯正有机粗糖",
      storyP1: "在TRINETRA EXPORTS，我们将优质印度粗糖的纯正甜蜜带给全球客户。从精心挑选的农场采购，注重品质加工，我们的粗糖保留了其天然口味、丰富色泽和传统纯度。",
      storyP2: "我们提供精心挑选的出口品质产品系列，包括天然粗糖、印度香料和必需食品杂货。",
      storyLink: "探索我们的出口部门 →",
      productsLabel: "精选产品", productsTitle: "我们的优质出口系列",
      productsDesc: "探索我们精心采购、安全包装并向全球交付的优质出口产品系列。",
      tabAgro: "农业商品部门", tabMachinery: "重型机械部门",
      badgeFeatured: "精选产品",
      jaggeryLocal: "印度古尔/沙卡", jaggeryName: "优质印度粗糖",
      jaggeryDesc: "来自传统甘蔗农场，保留天然维生素、铁含量、深金色和传统纯度。完全不含化学品或合成漂白剂。",
      jaggeryB1: "浓郁香气", jaggeryB2: "无化学品", jaggeryB3: "严格质量控制",
      spicesLocal: "马萨拉和香草", spicesName: "正宗香料",
      spicesDesc: "专门挑选富含精油、新鲜香气和浓郁风味的香料。我们出口小豆蔻、姜黄、红辣椒、黑胡椒和孜然。",
      spicesB1: "高香气", spicesB2: "完美湿度", spicesB3: "环保包装",
      pulsesLocal: "基本食品", pulsesName: "必需豆类和谷物",
      pulsesDesc: "鹰嘴豆、扁豆、大米和优质基本食品，按全球食品标准加工。",
      pulsesB1: "色选清洁", pulsesB2: "营养丰富", pulsesB3: "定制数量",
      machLocal: "重型设备", machName: "履带式挖掘机",
      machDesc: "高性能、省油的履带式挖掘机，适用于国际建筑、采矿和农业排水项目。",
      machB1: "重型作业", machB2: "全球排放合规", machB3: "备件支持",
      wcuLabel: "我们的流程", wcuTitle: "从农场到出口四个简单步骤",
      wcuDesc: "我们将直接农民合作伙伴关系、严格质量控制检查和出口就绪物流相结合。",
      step1Title: "农民合作伙伴关系", step1Desc: "我们直接与认证种植者合作，在源头采购优质原材料和有机粗糖。",
      step2Title: "质量检验", step2Desc: "每批货物都经过多阶段检验和实验室测试，检测水分、纯度和安全性。",
      step3Title: "定制包装", step3Desc: "从散装出口袋到定制零售包装，我们使用食品级材料包装每批产品。",
      step4Title: "出口物流", step4Desc: "我们的贸易台处理海关清关、全球海运货运线路和植物检疫证书。",
      logisticsLabel: "全球值得信赖的农业出口",
      logisticsTitle: "让我们共同连接全球市场",
      logisticsCTA: "立即发送询盘",
      roadTitle: "公路货运", roadDesc: "安全可靠的地面运输服务。",
      oceanTitle: "海运货运", oceanDesc: "安全的国际海上货运解决方案。",
      airTitle: "空运货运", airDesc: "紧急交付的快速全球运输。",
      partnerLabel: "准备好合作了吗？", partnerTitle: "从免费样品开始",
      partnerDesc: "无论您需要样品套装还是整个集装箱，我们的团队随时准备以具竞争力的价格提供帮助。",
      partnerBtn1: "申请免费样品", partnerBtn2: "查看所有产品",
      inquiryLabel: "全球连接", inquiryTitle: "发起贸易询盘",
      inquiryP1: "有兴趣采购我们的有机粗糖、印度香料、基本豆类或定制机械？",
      inquiryP2: "填写我们的正式询盘表格。地区贸易协调员将在12个工作小时内与您联系。",
      formNameLabel: "全名 *", formNamePlaceholder: "例如，张三",
      formCompanyLabel: "公司/企业名称 *", formCompanyPlaceholder: "例如，Global Foods有限公司",
      formEmailLabel: "工作邮箱 *", formEmailPlaceholder: "例如，buyer@company.com",
      formCategoryLabel: "感兴趣的产品部门 *", formCategoryDefault: "选择部门...",
      formOptJaggery: "优质粗糖", formOptSpices: "印度香料",
      formOptPulses: "谷物/豆类", formOptExcavators: "履带式挖掘机",
      formOptAll: "多个部门",
      formMsgLabel: "详细询盘/采购量需求 *",
      formMsgPlaceholder: "请描述您的目的港、运输条款（FOB/CIF）和包装要求...",
      formSubmitBtn: "发送采购请求",
      footerTagline: "与Trinetra Exports合作，自2010年起提供可信的农业出口、优质有机粗糖和全球贸易解决方案。",
      footerCompany: "公司", footerContact: "联系我们", footerQuickInquiry: "快速询盘",
      footerNamePlaceholder: "您的姓名", footerPhonePlaceholder: "您的电话号码",
      footerSendBtn: "发送询盘",
      footerHome: "» 首页", footerStory: "» 我们的故事", footerPortfolios: "» 产品",
      footerWCU: "» 为什么选择我们", footerContact2: "» 联系",
      footerCopyright: "© 2026 Trinetra Exports. 保留所有权利。用 ❤ 开发设计"
    }
  };

  function switchLanguage(lang) {
    const dict = translations[lang] || translations.en;

    // ── NAV
    const desktopLinks = document.querySelectorAll('.nav-links a');
    if (desktopLinks[0]) desktopLinks[0].textContent = dict.navHome;
    if (desktopLinks[1]) desktopLinks[1].textContent = dict.navStory;
    if (desktopLinks[2]) desktopLinks[2].textContent = dict.navPortfolios;
    if (desktopLinks[3]) desktopLinks[3].textContent = dict.navWCU;
    if (desktopLinks[4]) desktopLinks[4].textContent = dict.navInquiry;
    const mobileNavLinks = document.querySelectorAll('.mobile-menu ul a');
    if (mobileNavLinks[0]) mobileNavLinks[0].textContent = dict.navHome;
    if (mobileNavLinks[1]) mobileNavLinks[1].textContent = dict.navStory;
    if (mobileNavLinks[2]) mobileNavLinks[2].textContent = dict.navPortfolios;
    if (mobileNavLinks[3]) mobileNavLinks[3].textContent = dict.navWCU;
    if (mobileNavLinks[4]) mobileNavLinks[4].textContent = dict.navInquiry;
    document.querySelectorAll('.header-cta, .mobile-menu-cta').forEach(el => el.textContent = dict.btnQuote);

    // ── HERO
    const heroBadgeSpan = document.querySelector('.hero-badge span:last-child');
    if (heroBadgeSpan) heroBadgeSpan.textContent = dict.heroBadge;
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) heroTitle.innerHTML = dict.heroTitle;
    const heroDesc = document.querySelector('.hero-desc');
    if (heroDesc) heroDesc.textContent = dict.heroDesc;
    const heroBtns = document.querySelectorAll('.hero-cta a');
    if (heroBtns[0]) heroBtns[0].textContent = dict.btnExplore;
    if (heroBtns[1]) heroBtns[1].textContent = dict.btnLegacy;
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels[0]) statLabels[0].textContent = dict.statLabel1;
    if (statLabels[1]) statLabels[1].textContent = dict.statLabel2;
    if (statLabels[2]) statLabels[2].textContent = dict.statLabel3;

    // ── OUR STORY
    const storyLabel = document.querySelector('#story .section-label');
    if (storyLabel) storyLabel.textContent = dict.storyLabel;
    const storyTitle = document.querySelector('#story .section-title');
    if (storyTitle) storyTitle.textContent = dict.storyTitle;
    const storyParas = document.querySelectorAll('#story .about-intro-text p');
    if (storyParas[0]) storyParas[0].textContent = dict.storyP1;
    if (storyParas[1]) storyParas[1].textContent = dict.storyP2;
    const storyLink = document.querySelector('#story .about-intro-text a');
    if (storyLink) storyLink.textContent = dict.storyLink;

    // ── PRODUCTS SECTION
    const productsLabel = document.querySelector('.psc-hero-text .section-label');
    if (productsLabel) productsLabel.textContent = dict.productsLabel;
    const productsTitle = document.querySelector('.psc-hero-text .section-title');
    if (productsTitle) productsTitle.textContent = dict.productsTitle;
    const productsDesc = document.querySelector('.psc-hero-text .section-desc');
    if (productsDesc) productsDesc.textContent = dict.productsDesc;
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns[0]) tabBtns[0].textContent = dict.tabAgro;
    if (tabBtns[1]) tabBtns[1].textContent = dict.tabMachinery;
    document.querySelectorAll('.psc-badge-strip').forEach(el => el.textContent = dict.badgeFeatured);
    // Jaggery
    const cards = document.querySelectorAll('#agro-grid .psc-card');
    if (cards[0]) {
      cards[0].querySelector('.psc-local').textContent = dict.jaggeryLocal;
      cards[0].querySelector('.psc-name').textContent = dict.jaggeryName;
      cards[0].querySelector('.psc-desc').textContent = dict.jaggeryDesc;
      const b = cards[0].querySelectorAll('.psc-benefits span');
      if (b[0]) b[0].textContent = dict.jaggeryB1;
      if (b[1]) b[1].textContent = dict.jaggeryB2;
      if (b[2]) b[2].textContent = dict.jaggeryB3;
    }
    if (cards[1]) {
      cards[1].querySelector('.psc-local').textContent = dict.spicesLocal;
      cards[1].querySelector('.psc-name').textContent = dict.spicesName;
      cards[1].querySelector('.psc-desc').textContent = dict.spicesDesc;
      const b = cards[1].querySelectorAll('.psc-benefits span');
      if (b[0]) b[0].textContent = dict.spicesB1;
      if (b[1]) b[1].textContent = dict.spicesB2;
      if (b[2]) b[2].textContent = dict.spicesB3;
    }
    if (cards[2]) {
      cards[2].querySelector('.psc-local').textContent = dict.pulsesLocal;
      cards[2].querySelector('.psc-name').textContent = dict.pulsesName;
      cards[2].querySelector('.psc-desc').textContent = dict.pulsesDesc;
      const b = cards[2].querySelectorAll('.psc-benefits span');
      if (b[0]) b[0].textContent = dict.pulsesB1;
      if (b[1]) b[1].textContent = dict.pulsesB2;
      if (b[2]) b[2].textContent = dict.pulsesB3;
    }
    const machCard = document.querySelector('#machinery-grid .psc-card');
    if (machCard) {
      machCard.querySelector('.psc-local').textContent = dict.machLocal;
      machCard.querySelector('.psc-name').textContent = dict.machName;
      machCard.querySelector('.psc-desc').textContent = dict.machDesc;
      const b = machCard.querySelectorAll('.psc-benefits span');
      if (b[0]) b[0].textContent = dict.machB1;
      if (b[1]) b[1].textContent = dict.machB2;
      if (b[2]) b[2].textContent = dict.machB3;
    }

    // ── WHY CHOOSE US
    const wcuLabel = document.querySelector('#why-choose-us .section-label');
    if (wcuLabel) wcuLabel.textContent = dict.wcuLabel;
    const wcuTitle = document.querySelector('#why-choose-us .section-title');
    if (wcuTitle) wcuTitle.textContent = dict.wcuTitle;
    const wcuDesc = document.querySelector('#why-choose-us .section-desc');
    if (wcuDesc) wcuDesc.textContent = dict.wcuDesc;
    const processCards = document.querySelectorAll('.process-card');
    const steps = [
      [dict.step1Title, dict.step1Desc],
      [dict.step2Title, dict.step2Desc],
      [dict.step3Title, dict.step3Desc],
      [dict.step4Title, dict.step4Desc],
    ];
    processCards.forEach((card, i) => {
      if (steps[i]) {
        const h3 = card.querySelector('h3');
        const p  = card.querySelector('p');
        if (h3) h3.textContent = steps[i][0];
        if (p)  p.textContent  = steps[i][1];
      }
    });

    // ── LOGISTICS
    const logLabel = document.querySelector('.logistics-banner .section-label-gold');
    if (logLabel) logLabel.textContent = dict.logisticsLabel;
    const logTitle = document.querySelector('.logistics-banner-title');
    if (logTitle) logTitle.textContent = dict.logisticsTitle;
    const logCTA = document.querySelector('.btn-terracotta');
    if (logCTA) logCTA.textContent = dict.logisticsCTA;
    const logCards = document.querySelectorAll('.logistics-card');
    const logData = [
      [dict.roadTitle, dict.roadDesc],
      [dict.oceanTitle, dict.oceanDesc],
      [dict.airTitle, dict.airDesc],
    ];
    logCards.forEach((card, i) => {
      if (logData[i]) {
        const h3 = card.querySelector('h3');
        const p  = card.querySelector('p');
        if (h3) h3.textContent = logData[i][0];
        if (p)  p.textContent  = logData[i][1];
      }
    });

    // ── PARTNER CTA
    const partnerLabel = document.querySelector('.partner-cta-inner .section-label');
    if (partnerLabel) partnerLabel.textContent = dict.partnerLabel;
    const partnerTitle = document.querySelector('.partner-cta-inner .section-title');
    if (partnerTitle) partnerTitle.textContent = dict.partnerTitle;
    const partnerDesc = document.querySelector('.partner-cta-inner .section-desc');
    if (partnerDesc) partnerDesc.textContent = dict.partnerDesc;
    const partnerBtns = document.querySelectorAll('.partner-cta-actions a');
    if (partnerBtns[0]) partnerBtns[0].textContent = dict.partnerBtn1;
    if (partnerBtns[1]) partnerBtns[1].textContent = dict.partnerBtn2;

    // ── INQUIRY SECTION
    const inqLabel = document.querySelector('#inquiry .section-label');
    if (inqLabel) inqLabel.textContent = dict.inquiryLabel;
    const inqTitle = document.querySelector('#inquiry .section-title');
    if (inqTitle) inqTitle.textContent = dict.inquiryTitle;
    const inqParas = document.querySelectorAll('.inquiry-info p');
    if (inqParas[0]) inqParas[0].textContent = dict.inquiryP1;
    if (inqParas[1]) inqParas[1].textContent = dict.inquiryP2;
    // Form labels
    const fNameLabel = document.querySelector('label[for="fullName"]');
    if (fNameLabel) fNameLabel.textContent = dict.formNameLabel;
    const fName = document.getElementById('fullName');
    if (fName) fName.placeholder = dict.formNamePlaceholder;
    const fCompanyLabel = document.querySelector('label[for="companyName"]');
    if (fCompanyLabel) fCompanyLabel.textContent = dict.formCompanyLabel;
    const fCompany = document.getElementById('companyName');
    if (fCompany) fCompany.placeholder = dict.formCompanyPlaceholder;
    const fEmailLabel = document.querySelector('label[for="email"]');
    if (fEmailLabel) fEmailLabel.textContent = dict.formEmailLabel;
    const fEmail = document.getElementById('email');
    if (fEmail) fEmail.placeholder = dict.formEmailPlaceholder;
    const fCatLabel = document.querySelector('label[for="productCategory"]');
    if (fCatLabel) fCatLabel.textContent = dict.formCategoryLabel;
    const fCatSel = document.getElementById('productCategory');
    if (fCatSel) {
      const opts = fCatSel.options;
      if (opts[0]) opts[0].textContent = dict.formCategoryDefault;
      if (opts[1]) opts[1].textContent = dict.formOptJaggery;
      if (opts[2]) opts[2].textContent = dict.formOptSpices;
      if (opts[3]) opts[3].textContent = dict.formOptPulses;
      if (opts[4]) opts[4].textContent = dict.formOptExcavators;
      if (opts[5]) opts[5].textContent = dict.formOptAll;
    }
    const fMsgLabel = document.querySelector('label[for="message"]');
    if (fMsgLabel) fMsgLabel.textContent = dict.formMsgLabel;
    const fMsg = document.getElementById('message');
    if (fMsg) fMsg.placeholder = dict.formMsgPlaceholder;
    const fSubmit = document.querySelector('.form-submit');
    if (fSubmit) fSubmit.textContent = dict.formSubmitBtn;

    // ── FOOTER
    const footerTagline = document.querySelector('.brand-tagline');
    if (footerTagline) footerTagline.textContent = dict.footerTagline;
    const footerColHeadings = document.querySelectorAll('.footer-col h3');
    if (footerColHeadings[0]) footerColHeadings[0].textContent = dict.footerCompany;
    if (footerColHeadings[1]) footerColHeadings[1].textContent = dict.footerContact;
    if (footerColHeadings[2]) footerColHeadings[2].textContent = dict.footerQuickInquiry;
    const footerNavLinks = document.querySelectorAll('.links-col ul li a');
    if (footerNavLinks[0]) footerNavLinks[0].textContent = dict.footerHome;
    if (footerNavLinks[1]) footerNavLinks[1].textContent = dict.footerStory;
    if (footerNavLinks[2]) footerNavLinks[2].textContent = dict.footerPortfolios;
    if (footerNavLinks[3]) footerNavLinks[3].textContent = dict.footerWCU;
    if (footerNavLinks[4]) footerNavLinks[4].textContent = dict.footerContact2;
    const footerNameInput = document.getElementById('footer-name');
    if (footerNameInput) footerNameInput.placeholder = dict.footerNamePlaceholder;
    const footerPhoneInput = document.getElementById('footer-phone');
    if (footerPhoneInput) footerPhoneInput.placeholder = dict.footerPhonePlaceholder;
    const footerSubmitBtn = document.querySelector('.footer-submit-btn');
    if (footerSubmitBtn) {
      const svg = footerSubmitBtn.querySelector('svg');
      footerSubmitBtn.textContent = dict.footerSendBtn;
      if (svg) footerSubmitBtn.prepend(svg);
    }
    const footerCopy = document.querySelector('.footer-bottom-inner p');
    if (footerCopy) footerCopy.textContent = dict.footerCopyright;
  }

  // ── INQUIRY FORM SUBMISSION (sends to trinetraexports7@gmail.com via Formspree) ──
  const inquiryForm = document.getElementById('inquiryForm');
  const formStatus = document.getElementById('formStatus');

  // ← Paste your Formspree endpoint URL here (from formspree.io/forms)
  const FORMSPREE_URL = 'https://formspree.io/f/xwvdwkjr';

  inquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = inquiryForm.querySelector('.form-submit');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Sending...';
    submitBtn.disabled = true;

    // Use FormData for 100% compatibility with Formspree
    const form = e.target;
    const data = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
      });
      
      const result = await res.json();

      if (res.ok) {
        formStatus.textContent = '✅ Thank you! Your sourcing inquiry has been sent to Trinetra Exports. A trade coordinator will contact you within 12 business hours.';
        formStatus.className = 'form-status success';
        inquiryForm.reset();
      } else {
        throw new Error(result?.errors?.[0]?.message || 'Submission failed');
      }
    } catch (err) {
      formStatus.textContent = '❌ Error sending inquiry. Please email directly: trinetraexports7@gmail.com';
      formStatus.className = 'form-status error';
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
      setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
      }, 10000);
    }
  });

  // ── FOOTER MINI INQUIRY FORM SUBMISSION ──
  const footerInquiryForm = document.getElementById('footer-inquiry-form');
  if (footerInquiryForm) {
    footerInquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = footerInquiryForm.querySelector('.footer-submit-btn');
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      const form = e.target;
      const data = new FormData(form);
      data.append('_subject', 'Quick Inquiry – Trinetra Exports Website');

      try {
        const res = await fetch(form.action, {
          method: form.method,
          body: data,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (res.ok) {
          submitBtn.innerHTML = originalBtnHTML;
          submitBtn.disabled = false;
          alert('✅ Inquiry received! Our team will call you shortly.');
          footerInquiryForm.reset();
        } else {
          throw new Error('Failed');
        }
      } catch (err) {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
        alert('❌ Error. Please call: +91 91045 44404');
      }
    });
  }


});

// ── INQUIRY POPUP MODAL ──
(function initInquiryPopup() {
  const overlay   = document.getElementById('inquiryPopup');
  const closeBtn  = document.getElementById('popupClose');
  const skipBtn   = document.getElementById('popupSkip');
  const form      = document.getElementById('popupInquiryForm');
  const status    = document.getElementById('popupFormStatus');

  if (!overlay) return;

  // Open popup after 1 second on every page load
  function openPopup() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Auto-open after 1s delay
  setTimeout(openPopup, 1000);

  // Close on X button
  if (closeBtn) closeBtn.addEventListener('click', closePopup);

  // Close on "skip" link
  if (skipBtn) skipBtn.addEventListener('click', closePopup);

  // Close on overlay background click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closePopup();
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePopup();
  });

  // Handle form submission
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const submitBtn = form.querySelector('.popup-submit-btn');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;

        status.textContent = '✅ Thank you! We will contact you within 24 hours.';
        status.className = 'popup-form-status success';
        form.reset();

        setTimeout(closePopup, 2500);
      }, 1200);
    });
  }
})();
