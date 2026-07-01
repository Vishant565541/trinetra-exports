// ── 3D GLOBE ANIMATION ──
(function initHeroGlobe() {
  const canvas = document.getElementById('hero-globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const hero = canvas.parentElement;
  const W = hero.offsetWidth;
  const H = hero.offsetHeight || window.innerHeight;
  canvas.width  = W;
  canvas.height = H;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
  camera.position.set(0, 0, 3.2);

  const group = new THREE.Group();
  scene.add(group);

  // --- Wireframe globe ---
  const globeGeo = new THREE.SphereGeometry(1, 48, 48);
  const globeMat = new THREE.MeshBasicMaterial({ color: 0x1E4D2B, wireframe: true, transparent: true, opacity: 0.18 });
  group.add(new THREE.Mesh(globeGeo, globeMat));

  // --- Inner dark sphere ---
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x0b150e, transparent: true, opacity: 0.55 });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.98, 32, 32), innerMat));

  // --- Outer halo ---
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x2D6A3F, transparent: true, opacity: 0.06, side: THREE.BackSide });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(1.14, 32, 32), haloMat));

  // --- Surface dots ---
  const dotPos = [];
  for (let i = 0; i < 600; i++) {
    const phi   = Math.acos(-1 + (2 * i) / 600);
    const theta = Math.sqrt(600 * Math.PI) * phi;
    dotPos.push(Math.sin(phi)*Math.cos(theta), Math.sin(phi)*Math.sin(theta), Math.cos(phi));
  }
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPos, 3));
  group.add(new THREE.Points(dotsGeo, new THREE.PointsMaterial({ color: 0x4A8F5F, size: 0.012, transparent: true, opacity: 0.8 })));

  // --- Trade route arcs ---
  function latLngToVec3(lat, lng, r) {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(-r * Math.sin(phi)*Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi)*Math.sin(theta));
  }

  const ROUTES = [
    { to: [51.5072, -0.1276],   color: 0xB8955A },
    { to: [35.6762, 139.6503],  color: 0x4A8F5F },
    { to: [-33.8688, 151.2093], color: 0xB8955A },
    { to: [40.7128, -74.0060],  color: 0x2D6A3F },
    { to: [-23.5505, -46.6333], color: 0xB8955A },
    { to: [25.2769, 55.2962],   color: 0x4A8F5F },
    { to: [37.5665, 126.9780],  color: 0xB8955A },
  ];

  const FROM = [20.5937, 78.9629];
  const arcs = [];

  ROUTES.forEach(({ to, color }) => {
    const start  = latLngToVec3(FROM[0], FROM[1], 1.01);
    const end    = latLngToVec3(to[0],   to[1],   1.01);
    const mid    = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.4);
    const curve  = new THREE.QuadraticBezierCurve3(start, mid, end);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(60));
    const arcMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 });
    const arc    = new THREE.Line(arcGeo, arcMat);
    group.add(arc);
    arcs.push(arc);

    // Destination marker
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), new THREE.MeshBasicMaterial({ color }));
    marker.position.copy(latLngToVec3(to[0], to[1], 1.02));
    group.add(marker);
  });

  // --- Origin marker (India) pulsing ---
  const origin = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), new THREE.MeshBasicMaterial({ color: 0xB8955A }));
  origin.position.copy(latLngToVec3(FROM[0], FROM[1], 1.02));
  group.add(origin);

  // --- Ring around origin ---
  const ringGeo = new THREE.RingGeometry(0.038, 0.048, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xB8955A, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const ring    = new THREE.Mesh(ringGeo, ringMat);
  ring.position.copy(origin.position);
  ring.lookAt(new THREE.Vector3(0, 0, 0));
  group.add(ring);

  // Rotate to have India face viewer
  group.rotation.y = -1.37;

  // --- Mouse drag ---
  let isDragging = false, prevMouse = { x: 0, y: 0 }, rotVelY = 0, rotVelX = 0;
  hero.style.cursor = 'grab';
  hero.addEventListener('mousedown', e => {
    isDragging = true; prevMouse = { x: e.clientX, y: e.clientY };
    hero.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', () => { isDragging = false; hero.style.cursor = 'grab'; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    rotVelY = (e.clientX - prevMouse.x) * 0.003;
    rotVelX = (e.clientY - prevMouse.y) * 0.003;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  // --- Render loop ---
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;

    if (!isDragging) {
      rotVelY *= 0.96;
      rotVelX *= 0.92;
      group.rotation.y += 0.0015 + rotVelY;
      group.rotation.x += rotVelX;
    } else {
      group.rotation.y += rotVelY;
      group.rotation.x += rotVelX;
    }

    // Pulse origin
    const s = 1 + 0.35 * Math.sin(frame * 0.07);
    origin.scale.setScalar(s);
    ring.scale.setScalar(1 + 0.5 * Math.sin(frame * 0.05));
    ring.material.opacity = 0.3 + 0.3 * Math.sin(frame * 0.05);

    // Pulse arcs
    arcs.forEach((a, i) => {
      a.material.opacity = 0.3 + 0.4 * Math.sin(frame * 0.04 + i * 0.9);
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const nW = hero.offsetWidth, nH = hero.offsetHeight || window.innerHeight;
    renderer.setSize(nW, nH);
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
  });
})();

// ── FLOATING PARTICLES ──
(function initParticles() {
  const canvas = document.getElementById('hero-particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width  = canvas.parentElement.offsetWidth;
  let H = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;

  const COLS = ['rgba(184,149,90,', 'rgba(74,143,95,', 'rgba(45,106,63,'];
  const pts  = Array.from({ length: 50 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: 1 + Math.random() * 2,
    dx: (Math.random() - 0.5) * 0.3,
    dy: -(0.12 + Math.random() * 0.38),
    o:  0.15 + Math.random() * 0.5,
    c:  COLS[Math.floor(Math.random() * COLS.length)]
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + p.o + ')';
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
    });
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    W = canvas.width  = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
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
      heroBadge: "ESTABLISHED SINCE 1937",
      heroTitle: "Bridging Indian <em>Heritage</em> with Global Markets.",
      heroDesc: "At TRINETRA EXPORTS, we bring the authentic sweetness of premium Indian jaggery, rich spices, and essential commodities, alongside robust industrial excavators, to clients worldwide. Sourced with care, exported with integrity.",
      btnExplore: "Explore Portfolio",
      btnLegacy: "Our Legacy",
      navHome: "Home",
      navStory: "Our Story",
      navPortfolios: "Portfolios",
      navWCU: "Why Choose Us",
      navInquiry: "Inquiry",
      btnQuote: "Request Quote"
    },
    hi: {
      heroBadge: "1937 से स्थापित",
      heroTitle: "भारतीय <em>धरोहर</em> को वैश्विक बाजारों से जोड़ना।",
      heroDesc: "त्रिनेत्र एक्सपोर्ट्स में, हम दुनिया भर के ग्राहकों के लिए प्रीमियम भारतीय गुड़ की असली मिठास, समृद्ध मसाले और आवश्यक खाद्य वस्तुएं, तथा मजबूत औद्योगिक उत्खनन (excavators) प्रदान करते हैं। सावधानीपूर्वक स्रोत और ईमानदारी से निर्यात।",
      btnExplore: "पोर्टफोलियो देखें",
      btnLegacy: "हमारी विरासत",
      navHome: "होम",
      navStory: "हमारी कहानी",
      navPortfolios: "उत्पाद",
      navWCU: "हमारा चयन क्यों",
      navInquiry: "पूछताछ",
      btnQuote: "कोटेशन मांगें"
    },
    es: {
      heroBadge: "ESTABLECIDO DESDE 1937",
      heroTitle: "Conectando el <em>Patrimonio</em> Indio con Mercados Globales.",
      heroDesc: "En TRINETRA EXPORTS, llevamos el dulzor auténtico de la panela (jaggery) india premium, especias ricas y productos esenciales, junto con excavadoras industriales robustas, a clientes de todo el mundo. Origen con cuidado, exportado con integridad.",
      btnExplore: "Explorar Portafolio",
      btnLegacy: "Legado",
      navHome: "Inicio",
      navStory: "Nuestra Historia",
      navPortfolios: "Portafolios",
      navWCU: "Por Qué Elegirnos",
      navInquiry: "Consulta",
      btnQuote: "Solicitar Presupuesto"
    },
    de: {
      heroBadge: "GEGRÜNDET SEIT 1937",
      heroTitle: "Verbindung des indischen <em>Erbes</em> mit globalen Märkten.",
      heroDesc: "Bei TRINETRA EXPORTS bringen wir die authentische Süße von feinstem indischem Jaggery, aromatischen Gewürzen und Grundnahrungsmitteln sowie robusten Industrie-Baggern zu Kunden weltweit. Mit Sorgfalt bezogen, mit Integrität exportiert.",
      btnExplore: "Portfolio Erkunden",
      btnLegacy: "Unser Erbe",
      navHome: "Startseite",
      navStory: "Geschichte",
      navPortfolios: "Portfolios",
      navWCU: "Warum Wir",
      navInquiry: "Anfrage",
      btnQuote: "Angebot Anfordern"
    }
  };

  function switchLanguage(lang) {
    const dict = translations[lang] || translations.en;

    // Translate Hero Elements
    document.querySelector('.hero-badge span:last-child').textContent = dict.heroBadge;
    document.querySelector('.hero-title').innerHTML = dict.heroTitle;
    document.querySelector('.hero-desc').textContent = dict.heroDesc;
    document.querySelector('.hero-cta .btn-primary').textContent = dict.btnExplore;
    document.querySelector('.hero-cta .btn-outline').textContent = dict.btnLegacy;

    // Translate Navbar Links (Desktop)
    const desktopLinks = document.querySelectorAll('.nav-links a');
    desktopLinks[0].textContent = dict.navHome;
    desktopLinks[1].textContent = dict.navStory;
    desktopLinks[2].textContent = dict.navPortfolios;
    desktopLinks[3].textContent = dict.navWCU;
    desktopLinks[4].textContent = dict.navInquiry;

    // Translate Navbar Links (Mobile)
    const mobileLinks = document.querySelectorAll('.mobile-menu ul a');
    mobileLinks[0].textContent = dict.navHome;
    mobileLinks[1].textContent = dict.navStory;
    mobileLinks[2].textContent = dict.navPortfolios;
    mobileLinks[3].textContent = dict.navWCU;
    mobileLinks[4].textContent = dict.navInquiry;

    // Translate Header & Mobile Menu CTAs
    document.querySelector('.header-cta').textContent = dict.btnQuote;
    document.querySelector('.mobile-menu-cta').textContent = dict.btnQuote;
  }

  // ── INQUIRY FORM SUBMISSION ──
  const inquiryForm = document.getElementById('inquiryForm');
  const formStatus = document.getElementById('formStatus');

  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Disable submit button during processing
    const submitBtn = inquiryForm.querySelector('.form-submit');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Processing request...';
    submitBtn.disabled = true;

    // Simulate API request call
    setTimeout(() => {
      // Re-enable submit button
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;

      // Display beautiful success status message
      formStatus.textContent = 'Thank you! Your sourcing inquiry has been successfully sent. A regional coordinator will contact you shortly.';
      formStatus.className = 'form-status success';

      // Clear input fields
      inquiryForm.reset();

      // Clear success banner after 8 seconds
      setTimeout(() => {
        formStatus.textContent = '';
        formStatus.className = 'form-status';
      }, 8000);

    }, 1500);
  });

  // ── FOOTER MINI INQUIRY FORM SUBMISSION ──
  const footerInquiryForm = document.getElementById('footer-inquiry-form');
  if (footerInquiryForm) {
    footerInquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = footerInquiryForm.querySelector('.footer-submit-btn');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

        alert('Thank you! Your trade inquiry has been received. Our team will contact you shortly.');
        footerInquiryForm.reset();
      }, 1200);
    });
  }
});
