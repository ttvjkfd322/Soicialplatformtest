// ======= Globals =======
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = localStorage.getItem('currentUser') || null;
let posts = JSON.parse(localStorage.getItem('posts')) || [];

let isPlayerOne = false;
let gameState = { players: [], turn: null, gameType: null, gameData: {} };
let chatMessages = [];

// ======= DOM References =======
const signupUsernameInput = document.getElementById('signup-username');
const signupPasswordInput = document.getElementById('signup-password');
const signupBtn = document.getElementById('signup-btn');

const loginUsernameInput = document.getElementById('login-username');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');

const logoutBtn = document.getElementById('logout-btn');
const userInfoDiv = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');

const authSection = document.getElementById('auth-section');
const postCreationSection = document.getElementById('post-creation');
const feedSection = document.getElementById('feed-section');
const postTextInput = document.getElementById('post-text');
const postBtn = document.getElementById('post-btn');
const postsContainer = document.getElementById('posts-container');

const gameStatus = document.getElementById('game-status');
const joinGameBtn = document.getElementById('join-game-btn');
const singlePlayerBtn = document.getElementById('single-player-btn');

const chatMessagesDiv = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatSortSelect = document.getElementById('chat-sort');
const chatNotificationsCheckbox = document.getElementById('chat-notifications');

// ======= Save & Render =======
function saveData() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('posts', JSON.stringify(posts));
  if (currentUser) {
    localStorage.setItem('currentUser', currentUser);
  } else {
    localStorage.removeItem('currentUser');
  }
}

function renderUI() {
  if (currentUser) {
    authSection.classList.add('hidden');
    postCreationSection.classList.remove('hidden');
    feedSection.classList.remove('hidden');
    userInfoDiv.classList.remove('hidden');
    usernameDisplay.textContent = currentUser;
  } else {
    authSection.classList.remove('hidden');
    postCreationSection.classList.add('hidden');
    feedSection.classList.add('hidden');
    userInfoDiv.classList.add('hidden');
  }
  renderPosts();
  renderAdminDashboard();
}

function renderPosts() {
  postsContainer.innerHTML = '';
  const sorted = posts.slice().sort((a, b) => b.timestamp - a.timestamp);
  if (!sorted.length) {
    postsContainer.innerHTML = '<p>No posts yet.</p>';
    return;
  }
  sorted.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <strong>@${post.author}</strong><p>${post.text}</p>
      ❤️ ${post.likes.length}
    `;
    postsContainer.appendChild(div);
  });
}

function renderAdminDashboard() {
  const adminSection = document.getElementById('tab-admin');
  if (currentUser === 'admin') {
    adminSection.style.display = 'block';
    const userList = document.getElementById('admin-user-list');
    const postList = document.getElementById('admin-post-list');
    userList.innerHTML = '';
    postList.innerHTML = '';
    Object.keys(users).forEach(u => {
      const li = document.createElement('li');
      li.textContent = u;
      userList.appendChild(li);
    });
    posts.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `@${p.author}: ${p.text}`;
      postList.appendChild(li);
    });
  } else {
    adminSection.style.display = 'none';
  }
}

// ======= Auth =======
signupBtn.onclick = () => {
  const u = signupUsernameInput.value.trim();
  const p = signupPasswordInput.value.trim();
  if (!u || !p) return alert('Fill both fields!');
  if (users[u]) return alert('User exists.');
  users[u] = { password: btoa(p), following: [] };
  currentUser = u;
  saveData();
  renderUI();
};

loginBtn.onclick = () => {
  const u = loginUsernameInput.value.trim();
  const p = loginPasswordInput.value.trim();
  if (!users[u] || users[u].password !== btoa(p)) return alert('Wrong login.');
  currentUser = u;
  saveData();
  renderUI();
};

logoutBtn.onclick = () => {
  currentUser = null;
  saveData();
  renderUI();
};

// ======= Posting =======
postBtn.onclick = () => {
  const text = postTextInput.value.trim();
  if (!text || !currentUser) return;
  posts.push({
    id: Date.now(),
    author: currentUser,
    text,
    timestamp: Date.now(),
    likes: [],
    comments: []
  });
  postTextInput.value = '';
  saveData();
  renderPosts();
};

// ======= Tab Nav =======
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const target = document.getElementById(`tab-${btn.dataset.tab}`);
    if (target) target.classList.add('active');
    btn.classList.add('active');
  };
});

// ======= Coin / Dice / RPS =======
document.getElementById('flip-coin-btn').onclick = () => alert(`Coin: ${Math.random() < 0.5 ? 'Heads' : 'Tails'}`);
document.getElementById('roll-dice-btn').onclick = () => alert(`Dice: ${Math.floor(Math.random() * 6) + 1}`);
document.getElementById('rps-rock').onclick = () => playRPS('rock');
document.getElementById('rps-paper').onclick = () => playRPS('paper');
document.getElementById('rps-scissors').onclick = () => playRPS('scissors');

function playRPS(choice) {
  const c = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
  alert(`You: ${choice} | Bot: ${c}`);
}

// ======= Game Buttons =======
joinGameBtn.onclick = () => {
  alert('Joining game...');
};
singlePlayerBtn.onclick = () => {
  alert('Starting single player...');
};

// ======= AI =======
document.getElementById('ask-ai-btn').onclick = () => {
  const i = document.getElementById('ai-input').value.trim();
  const o = document.getElementById('ai-output');
  if (!i) return o.textContent = 'Enter a prompt.';
  o.textContent = `🤖 Fake AI: "${i}"`;
};

// ======= Livestream Chat =======
chatForm.onsubmit = e => {
  e.preventDefault();
  const txt = chatInput.value.trim();
  if (!txt) return;
  chatMessages.push({ text: txt, author: currentUser || 'Anon', timestamp: Date.now() });
  chatInput.value = '';
  renderChat();
};

chatSortSelect.onchange = renderChat;

function renderChat() {
  chatMessagesDiv.innerHTML = '';
  let msgs = [...chatMessages];
  if (chatSortSelect.value === 'newest') msgs.reverse();
  msgs.forEach(m => {
    const d = document.createElement('div');
    d.textContent = `[${new Date(m.timestamp).toLocaleTimeString()}] @${m.author}: ${m.text}`;
    chatMessagesDiv.appendChild(d);
  });
}

renderUI();
