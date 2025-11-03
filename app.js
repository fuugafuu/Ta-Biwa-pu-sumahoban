// Register SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.warn);
  });
}

const player = document.getElementById('player');
const input = document.getElementById('projectInput');
const loadUrlBtn = document.getElementById('loadUrlBtn');
const fileInput = document.getElementById('fileInput');
const fps = document.getElementById('fps');
const turbo = document.getElementById('turbo');
const hqpen = document.getElementById('hqpen');
const addons = document.getElementById('addons');
const stageonly = document.getElementById('stageonly');
const installBtn = document.getElementById('installBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const wakeBtn = document.getElementById('wakeBtn');

// Build TurboWarp embed URL
function buildURL(projectUrlOrId){
  let base = 'https://turbowarp.org/embed.html';
  const p = new URLSearchParams();
  // Accept plain numeric Scratch ID
  if (/^\d{3,}$/.test(projectUrlOrId.trim())) {
    p.set('id', projectUrlOrId.trim());
  } else {
    p.set('project_url', projectUrlOrId.trim());
  }
  if (fps.value) p.set('fps', String(fps.value));
  if (turbo.checked) p.set('turbo', '1');
  if (hqpen.checked) p.set('hqpen', '1');
  if (addons.value.trim()) p.set('addons', addons.value.trim());
  if (stageonly.checked) p.set('stage', '1');
  // quality flags
  p.set('interpolate', '1');
  p.set('limitless', '1');
  return base + '#' + p.toString();
}

function loadProject(v){
  if(!v) return;
  player.src = buildURL(v);
  // Scroll player into view on mobile
  player.scrollIntoView({behavior:'smooth', block:'start'});
}

// URL/ID load
loadUrlBtn.addEventListener('click', () => loadProject(input.value));

// File load (.sb3/.zip hosted locally). We create an object URL and
// warn that TurboWarp may not accept blob: URLs; we try via ?project_url=
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if(!file) return;
  const blobURL = URL.createObjectURL(file);
  // Some browsers block blob: across iframes on other origins.
  // Recommend serving your file from same origin for best results.
  loadProject(blobURL);
});

// PWA install prompt
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.disabled = false;
});
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

// Fullscreen
fullscreenBtn.addEventListener('click', async () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    await el.requestFullscreen().catch(()=>{});
  } else {
    await document.exitFullscreen().catch(()=>{});
  }
});

// Keep-awake (screen lock)
let wakeLock = null;
async function toggleWakeLock(){
  try{
    if (!wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeBtn.textContent = 'スリープ解除中';
      wakeLock.addEventListener('release', () => { wakeBtn.textContent = 'スリープ防止'; wakeLock = null; });
    } else {
      await wakeLock.release();
      wakeLock = null;
      wakeBtn.textContent = 'スリープ防止';
    }
  }catch(e){
    console.warn(e);
  }
}
wakeBtn.addEventListener('click', toggleWakeLock);

// Load a nice default demo (Scratch ID) on first visit
window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.slice(1);
  if(!hash){
    input.value = '10128407'; // example public Scratch project ID (Pong-style)
  }
});
