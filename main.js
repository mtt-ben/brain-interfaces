const CONFIG = {
    'home': { x: -100, y: 0, path: './pages/home.html' },
    'selection': { x: -100, y: -100, path: './pages/selection.html' },
    'listen-left': { x: 0, y: -200, path: './pages/listen.html' },
    'talk-right': { x: -200, y: -200, path: './pages/talk.html' },
    'loop-middle': { x: -100, y: -200, path: './pages/loop.html' }
};

// Définition manuelle des neurones
const MANUAL_POINTS = [
    { id: 'listen', x: 120, y: 140, cp: { x: -500, y: 500 } },
    { id: 'loop', x: 150, y: 165, cp: { x: 0, y: 200 } },
    { id: 'talk', x: 180, y: 140, cp: { x: 500, y: 500 } },
    // Loop nodes
    { id: 'lt1', x: 165, y: 285, cp: { x: 0, y: -100 } },
    { id: 'lt2', x: 135, y: 265, cp: { x: 0, y: -100 } },
    { id: 'lt3', x: 180, y: 235, cp: { x: 0, y: -100 } },
    { id: 'lt4', x: 120, y: 220, cp: { x: 0, y: -100 } },
    // Listen nodes
    { id: 'l1', x: 10, y: 230, cp: { x: 0, y: -500 } },
    { id: 'l2', x: 25, y: 220, cp: { x: 300, y: -500 } },
    { id: 'l3', x: 36, y: 260, cp: { x: 0, y: -500 } },
    { id: 'l4', x: 48, y: 240, cp: { x: 300, y: -500 } },
    { id: 'l5', x: 63, y: 275, cp: { x: 0, y: -500 } },
    { id: 'l6', x: 71, y: 255, cp: { x: 300, y: -500 } },
    { id: 'l7', x: 85, y: 285, cp: { x: 0, y: -500 } },
    // Talk nodes
    { id: 't1', x: 216, y: 285, cp: { x: 0, y: -800 } },
    { id: 't2', x: 220, y: 260, cp: { x: -300, y: -500 } },
    { id: 't3', x: 232, y: 280, cp: { x: 0, y: -800 } },
    { id: 't4', x: 240, y: 252, cp: { x: -300, y: -500 } },
    { id: 't5', x: 248, y: 273, cp: { x: 0, y: -800 } },
    { id: 't6', x: 260, y: 238, cp: { x: -300, y: -500 } },
    { id: 't7', x: 266, y: 262, cp: { x: 0, y: -1000 } },
    { id: 't8', x: 280, y: 220, cp: { x: -300, y: -500 } },  
];

// Définition des connexions
const MANUAL_CONNECTIONS = [
    // Loop connections
    { from: 'loop', to: 'lt1', speed: 0.001, mode: 'ping-pong', size: 10 },
    { from: 'loop', to: 'lt2', speed: 0.001, mode: 'ping-pong', size: 10 },
    { from: 'loop', to: 'lt3', speed: 0.001, mode: 'ping-pong', size: 10 },
    { from: 'loop', to: 'lt4', speed: 0.001, mode: 'ping-pong', size: 10 },
    // Listen connections
    { from: 'listen', to: 'l1', speed: 0.001, mode: 'backward', size: 10 },
    { from: 'listen', to: 'l2', speed: 0.001, mode: 'backward', size: 10 },
    { from: 'listen', to: 'l3', speed: 0.001, mode: 'backward', size: 10 },
    { from: 'listen', to: 'l4', speed: 0.001, mode: 'backward', size: 10 },
    { from: 'listen', to: 'l5', speed: 0.001, mode: 'backward', size: 10 },
    { from: 'listen', to: 'l6', speed: 0.001, mode: 'backward', size: 10 },
    { from: 'listen', to: 'l7', speed: 0.001, mode: 'backward', size: 10 },
    // Talk connections
    { from: 'talk', to: 't1', speed: 0.001, mode: 'forward', size: 10 },
    { from: 'talk', to: 't2', speed: 0.001, mode: 'forward', size: 10 },
    { from: 'talk', to: 't3', speed: 0.001, mode: 'forward', size: 10 },
    { from: 'talk', to: 't4', speed: 0.001, mode: 'forward', size: 10 },
    { from: 'talk', to: 't5', speed: 0.001, mode: 'forward', size: 10 },
    { from: 'talk', to: 't6', speed: 0.001, mode: 'forward', size: 10 },
    { from: 'talk', to: 't7', speed: 0.001, mode: 'forward', size: 10 },
    { from: 'talk', to: 't8', speed: 0.001, mode: 'forward', size: 10 },
];

let zoneData = {};

// 1. Initial Load
window.addEventListener('DOMContentLoaded', async () => {
    initNeuro();
    const resp = await fetch('./data.json');
    zoneData = await resp.json();
    handleRoute();
});

// 2. Navigation
async function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const state = CONFIG[hash];
    
    // Move Background
    document.getElementById('world').style.transform = `translate3d(${state.x}vw, ${state.y}vh, 0)`;
    
    // Fade and Swap Content
    const ui = document.getElementById('app-interface');
    ui.style.opacity = 0;
    
    const html = await fetch(state.path).then(r => r.text());
    setTimeout(() => {
        ui.innerHTML = html;
        ui.style.opacity = 1;
        const scripts = ui.querySelectorAll("script");
        scripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            newScript.text = oldScript.text;
            document.head.appendChild(newScript).parentNode.removeChild(newScript);
        });
    }, 500);
}

window.addEventListener('hashchange', handleRoute);

// 3. Modal Controls
function openModal(key) {
    const data = zoneData[key];
    if (!data) return;

    const infoWindow = document.getElementById('info-window');
    const modalBody = document.getElementById('modal-body');

    infoWindow.scrollTop = 0;
    
    // Construction d'une interface riche
    let html = `
        <div class="modal-header">
            <div class="badge">${data.category || 'Interface'}</div>
            <h1>${data.title_in}</h1>
            <p class="subtitle">${data.direction || ''}</p>

            <div class="illustration-container">
                <div class="illus-card">
                    <img src="${data.img_left?.url || 'https://placehold.co/404'}" alt="Illustration gauche">
                    <div class="illus-info">
                        <h5>${data.img_left?.title || 'Concept'}</h5>
                        <p>${data.img_left?.desc || ''}</p>
                    </div>
                </div>
                <div class="illus-card">
                    <img src="${data.img_right?.url || 'https://placehold.co/404'}" alt="Illustration droite">
                    <div class="illus-info">
                        <h5>${data.img_right?.title || 'Application'}</h5>
                        <p>${data.img_right?.desc || ''}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal-grid">
            <div class="main-info">
                <section>
                    <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> How it works</h3>
                    <p>${data.mechanism || data.content}</p>
                </section>
                
                <section>
                    <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Use Cases</h3>
                    <ul>
                        ${data.use_cases ? data.use_cases.map(u => `<li>${u}</li>`).join('') : ''}
                    </ul>
                </section>

                <div class="warning-box">
                    <strong>Tradeoff :</strong> ${data.trade_off || ''}
                </div>
            </div>

            <div class="side-specs">
                <div class="spec-card">
                    <h4>Performances</h4>
                    <div class="spec-item"><span>Spatial Res.</span> <strong>${data.specs?.resolution_spatial || '-'}</strong></div>
                    <div class="spec-item"><span>Temporal Res.</span> <strong>${data.specs?.resolution_temporal || '-'}</strong></div>
                    <div class="spec-item"><span>Channels</span> <strong>${data.specs?.channels || '-'}</strong></div>
                    <div class="spec-item"><span>Latency</span> <strong>${data.specs?.latency || '-'}</strong></div>
                </div>

                <div class="spec-card">
                    <h4>Reglementation</h4>
                    <div class="spec-item"><span>Class</span> <strong>${data.regulatory?.class || '-'}</strong></div>
                    <div class="spec-item"><span>Phase</span> <strong>${data.regulatory?.phase || '-'}</strong></div>
                </div>
            </div>
        </div>
    `;

    modalBody.innerHTML = html;
    infoWindow.classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    // Retire la fenêtre d'information
    document.getElementById('info-window').classList.remove('active');
    
    // Retire l'overlay et l'effet de flou
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function createPoint(id, x, y) {
    const container = document.querySelector('.grid-container');
    if (!container || !zoneData[id]) return;

    const data = zoneData[id];
    const item = document.createElement('div');
    
    item.className = 'grid-item dynamic-point';
    item.style.left = `${x}%`;
    item.style.top = `${y}%`;

    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.alignItems = 'center';

    item.onclick = () => openModal(id);

    item.innerHTML = `
        <div class="zone-point"></div>
        <span style="display: block; color: white; margin-top: 5px; font-size: 0.8rem; pointer-events: none;">
            ${data.title}
        </span>
    `;
    
    container.appendChild(item);
}

const canvas = document.getElementById('neuro-canvas');
const ctx = canvas.getContext('2d');
let points = [];
let impulses = [];

function initNeuro() {
    canvas.width = window.innerWidth * 3;
    canvas.height = window.innerHeight * 3;
    
    // 1. On crée les points réels à l'échelle du canvas
    // On utilise une map pour indexer par ID pour faciliter la recherche
    const nodesById = {};
    MANUAL_POINTS.forEach(p => {
        const newNode = {
            x: (p.x / 300) * canvas.width,
            y: (p.y / 300) * canvas.height,
            cp: { x: p.cp.x, y: p.cp.y }
        };
        nodesById[p.id] = newNode;
        points.push(newNode);
    });

    // 2. On crée les connexions en utilisant les points RECALCULÉS
    impulses = MANUAL_CONNECTIONS.map(conn => {
        const startNode = nodesById[conn.from];
        const endNode = nodesById[conn.to];
        
        if (startNode && endNode) {
            return new Impulse(startNode, endNode, conn.speed, conn.mode, conn.size);
        }
        return null;
    }).filter(imp => imp !== null);

    requestAnimationFrame(animateNeuro);
}

// Réutilisation de votre classe Impulse avec sécurité Negative Radius
class Impulse {
    constructor(p1, p2, speed, mode, size) {
        this.p1 = p1;
        this.p2 = p2;
        this.speed = speed;
        this.mode = mode;
        this.size = size;
        this.t = Math.random(); 
        this.direction = 1;

        if (this.mode === 'backward') {
            this.direction = -1;
        }
    }

    update() {
        this.t += this.speed * this.direction;

        if (this.mode === 'ping-pong') {
            if (this.t > 1 || this.t < 0) {
                this.direction *= -1;
                this.t = Math.max(0, Math.min(1, this.t));
            }
        } else if (this.mode === 'forward') {
            if (this.t > 1) this.t = 0;
        } else if (this.mode === 'backward') {
            if (this.t < 0) this.t = 1;
        }
    }

    // Calcul de la trajectoire partagé par la ligne et la particule
    getPosition(t) {
        const invT = 1 - t;
        const c1x = this.p1.x + (this.p1.cp ? this.p1.cp.x : 0);
        const c1y = this.p1.y + (this.p1.cp ? this.p1.cp.y : 0);
        const c2x = this.p2.x + (this.p2.cp ? this.p2.cp.x : 0);
        const c2y = this.p2.y + (this.p2.cp ? this.p2.cp.y : 0);

        const x = Math.pow(invT, 3) * this.p1.x + 3 * Math.pow(invT, 2) * t * c1x + 3 * invT * Math.pow(t, 2) * c2x + Math.pow(t, 3) * this.p2.x;
        const y = Math.pow(invT, 3) * this.p1.y + 3 * Math.pow(invT, 2) * t * c1y + 3 * invT * Math.pow(t, 2) * c2y + Math.pow(t, 3) * this.p2.y;
        return {x, y};
    }

    // On dessine d'abord la ligne structurelle (l'axone)
    drawConnector() {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        const c1x = this.p1.x + (this.p1.cp ? this.p1.cp.x : 0);
        const c1y = this.p1.y + (this.p1.cp ? this.p1.cp.y : 0);
        const c2x = this.p2.x + (this.p2.cp ? this.p2.cp.x : 0);
        const c2y = this.p2.y + (this.p2.cp ? this.p2.cp.y : 0);
        
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, this.p2.x, this.p2.y);
        
        ctx.shadowBlur = 0; // Pas de lueur sur la ligne pour ne pas saturer
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'; // Bleu translucide
        ctx.lineWidth = 10;
        ctx.stroke();
    }

    // On dessine ensuite la particule (l'influx)
    drawImpulse() {
        this.update(); // CRUCIAL : On appelle update ici pour gérer le sens
        
        const pos = this.getPosition(this.t);
        const flicker = Math.random() > 0.4 ? 1.2 : 0.8;
        
        ctx.save();
        ctx.shadowBlur = 5 * flicker;
        ctx.shadowColor = '#7dd3fc';
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, Math.max(0.1, this.size * flicker), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function animateNeuro() {
    // Fond avec traînée légère
    ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 1. Dessiner toutes les lignes d'abord (couche inférieure)
    impulses.forEach(imp => imp.drawConnector());
    
    // 2. Dessiner les particules par-dessus
    impulses.forEach(imp => imp.drawImpulse());
    
    // 3. Dessiner les somas (les points de connexion)
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    requestAnimationFrame(animateNeuro);
}