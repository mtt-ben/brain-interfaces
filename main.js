const CONFIG = {
    'home': { x: 0, y: 0, path: './pages/home.html' },
    'selection': { x: 0, y: -33, path: './pages/selection.html' },
    'listen': { x: 0, y: -66, path: './pages/listen.html' },
    'talk': { x: 33, y: -66, path: './pages/talk.html' },
    'loop': { x: -33, y: -66, path: './pages/loop.html' }
};

let zoneData = {};

// 1. Initial Load
window.addEventListener('DOMContentLoaded', async () => {
    const resp = await fetch('./data.json');
    zoneData = await resp.json();
    handleRoute();
});

// 2. Navigation
async function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const state = CONFIG[hash];
    
    // Move Background
    document.getElementById('world').style.transform = `translate3d(${state.x}%, ${state.y}%, 0)`;
    
    // Fade and Swap Content
    const ui = document.getElementById('app-interface');
    ui.style.opacity = 0;
    
    const html = await fetch(state.path).then(r => r.text());
    setTimeout(() => {
        ui.innerHTML = html;
        ui.style.opacity = 1;
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