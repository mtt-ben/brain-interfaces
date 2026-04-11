const CONFIG = {
    'home': { x: -100, y: 0, path: './pages/home.html' },
    'selection': { x: -100, y: -100, path: './pages/selection.html' },
    'listen-left': { x: 0, y: -200, path: './pages/listen.html' },
    'talk-right': { x: -200, y: -200, path: './pages/talk.html' },
    'loop-middle': { x: -100, y: -200, path: './pages/loop.html' }
};

// Définition manuelle des neurones
const MANUAL_POINTS = [
    { id: 'p1', x: 175, y: 125, cp: { x: 200, y: 200 } },
    { id: 'p2', x: 125, y: 125, cp: { x: 0, y: 0  } },
    { id: 'p3', x: 150, y: 175, cp: { x: 0, y: 0 } }
];

// Définition des connexions
const MANUAL_CONNECTIONS = [
    { from: 'p1', to: 'p2', speed: 0.01, mode: 'forward', size: 7}, // Aller
    { from: 'p2', to: 'p3', speed: 0.001, mode: 'backward', size: 10}, // Retour
    { from: 'p3', to: 'p1', speed: 0.001, mode: 'ping-pong', size: 10} // Aller-Retour
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
    document.getElementById('modal-body').innerHTML = `<h1>${data.title}</h1><p>${data.content}</p>`;
    document.getElementById('info-window').classList.add('active');
}

function closeModal() {
    document.getElementById('info-window').classList.remove('active');
}

function createPoint(id, x, y) {
    const container = document.querySelector('.grid-container');
    if (!container || !zoneData[id]) return;

    const data = zoneData[id];
    const item = document.createElement('div');
    
    item.className = 'grid-item dynamic-point';
    item.style.left = `${x}%`;
    item.style.top = `${y}%`;

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