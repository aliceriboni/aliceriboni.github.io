document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CUSTOM CURSOR MANAGEMENT (Versione "Scia") ---

    const NUM_FOLLOWERS = 10; // Numero di punti nella scia
    const EASE_FACTOR = 0.4; // Fattore di "elasticità"

    const followers = []; // Array per i div della scia (elementi DOM)
    const followerPos = []; // Array per le posizioni {x, y}

    let mouseX = 0;
    let mouseY = 0;

    // --- Inizializzazione della Scia ---
    function setupCursorTrail() {
        for (let i = 0; i < NUM_FOLLOWERS; i++) {
            const follower = document.createElement('div');
            follower.className = 'cursor-follower';
            document.body.appendChild(follower);
            
            // Imposta l'opacità (per l'effetto sfumato)
            follower.style.opacity = (NUM_FOLLOWERS - i) / NUM_FOLLOWERS;
            
            followers.push(follower);
            followerPos.push({ x: 0, y: 0 });
        }
    }

    // --- Loop di Animazione ---
    function animateCursorTrail() {
        let leaderX = mouseX;
        let leaderY = mouseY;

        followers.forEach((follower, index) => {
            const pos = followerPos[index];
            const dx = leaderX - pos.x;
            const dy = leaderY - pos.y;

            // Calcola la nuova posizione usando l'easing (lerp)
            pos.x += dx * EASE_FACTOR;
            pos.y += dy * EASE_FACTOR;

            // Applica la nuova posizione al div
            follower.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;

            // Aggiorna il "leader" per la prossima iterazione
            leaderX = pos.x;
            leaderY = pos.y;
        });

        requestAnimationFrame(animateCursorTrail);
    }

    // --- Event Listener (Mouse Move) ---
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // --- Event Listener (Hover su Link) ---
    // La lista include ora i nuovi link .project-list a
    const interactiveElements = document.querySelectorAll(
        'a, button, .cta-button, .timeline-item, .contact-link-item, .project-list a'
    );
    
    interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hovered');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hovered');
        });
    });

    // --- Avvia il cursore ---
    setupCursorTrail();
    animateCursorTrail();


    // --- 2. FADE-IN ON SCROLL MANAGEMENT (Invariato) ---
    const fadeElements = document.querySelectorAll('.fade-in');
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    fadeElements.forEach(el => {
        scrollObserver.observe(el);
    });

    
    // --- 3. "SINUOUS" WAVE ANIMATION (Invariato) ---
    
    if (typeof SimplexNoise === 'undefined') {
        console.error("SimplexNoise library not loaded.");
        return;
    }

    const canvas = document.getElementById('wave-canvas');
    const ctx = canvas.getContext('2d');
    const simplex = new SimplexNoise(); 

    const numLines = 15;
    const amplitude = 50;
    const frequency = 0.005;
    const evolveSpeed = 0.0002; 
    const driftSpeed = 0.0015;  
    const driftRandomness = 0.5;
    const spacing = window.innerHeight / numLines;
    let frame = 0; 

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function drawWaves() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = getComputedStyle(document.documentElement)
                            .getPropertyValue('--line-color')
                            .trim() || 'rgba(170,170,170,0.5)';
        ctx.lineWidth = 1;

        const evolveTime = frame * evolveSpeed;
        const baseDriftTime = frame * driftSpeed;

        for (let i = 0; i < numLines; i++) {
            ctx.beginPath();
            
            const yBase = (i + 1) * spacing - (amplitude / 2);
            ctx.moveTo(0, yBase);

            const lineRandomDrift = simplex.noise2D(i * 0.1, evolveTime) * driftRandomness;
            const currentDriftTime = baseDriftTime + lineRandomDrift;

            for (let x = 0; x < canvas.width; x++) {
                const noiseVal = simplex.noise3D(
                    (x * frequency) + currentDriftTime, 
                    i * 0.1,                      
                    evolveTime                    
                );
                const y = yBase + noiseVal * amplitude;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        frame++;
        requestAnimationFrame(drawWaves);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawWaves();
});