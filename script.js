// ======= Globals =======
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = localStorage.getItem('currentUser') || null;
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// ======= DOM Elements =======
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

// ======= Helper Functions =======

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
    renderPosts();
  } else {
    authSection.classList.remove('hidden');
    postCreationSection.classList.add('hidden');
    feedSection.classList.add('hidden');
    userInfoDiv.classList.add('hidden');
  }
}

function renderPosts() {
  postsContainer.innerHTML = '';

  const sortedPosts = posts.slice().sort((a, b) => b.timestamp - a.timestamp);

  if (sortedPosts.length === 0) {
    postsContainer.innerHTML = '<p>No posts yet. Be the first!</p>';
    return;
  }

  for (const post of sortedPosts) {
    const postEl = document.createElement('div');
    postEl.className = 'post';

    const authorEl = document.createElement('div');
    authorEl.className = 'post-author';
    authorEl.textContent = `@${post.author}`;

    const textEl = document.createElement('div');
    textEl.className = 'post-text';
    textEl.textContent = post.text;

    const actionsEl = document.createElement('div');
    actionsEl.className = 'post-actions';

    const likeBtn = document.createElement('button');
    likeBtn.className = 'like-btn';
    likeBtn.innerHTML = `❤️ <span class="like-count">${post.likes.length}</span>`;
    likeBtn.disabled = !currentUser;

    likeBtn.onclick = () => {
      if (!currentUser) return;
      const userIndex = post.likes.indexOf(currentUser);
      if (userIndex === -1) {
        post.likes.push(currentUser);
      } else {
        post.likes.splice(userIndex, 1);
      }
      saveData();
      renderPosts();
      renderTrendingPosts();
    };

    const commentToggle = document.createElement('button');
    commentToggle.className = 'comment-toggle';
    commentToggle.textContent = '💬 Comments';

    const followBtn = document.createElement('button');
    followBtn.className = 'follow-btn';
    followBtn.textContent = '+ Follow';

    actionsEl.appendChild(likeBtn);
    actionsEl.appendChild(commentToggle);
    actionsEl.appendChild(followBtn);

    const commentsSection = document.createElement('div');
    commentsSection.className = 'comments-section';
    commentsSection.style.display = 'none';

    const commentsList = document.createElement('div');
    commentsList.className = 'comments-list';

    const commentInput = document.createElement('input');
    commentInput.className = 'comment-input';
    commentInput.placeholder = 'Write a comment...';

    const commentSubmit = document.createElement('button');
    commentSubmit.className = 'comment-submit';
    commentSubmit.textContent = 'Post';

    commentToggle.onclick = () => {
      commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    };

    commentSubmit.onclick = () => {
      const text = commentInput.value.trim();
      if (text) {
        const comment = document.createElement('p');
        comment.textContent = `You: ${text}`;
        commentsList.appendChild(comment);
        commentInput.value = '';
        showNotification("💬 Comment posted!");
      }
    };

    followBtn.onclick = () => {
      const following = followBtn.textContent === "+ Follow";
      followBtn.textContent = following ? "Following ✓" : "+ Follow";
      showNotification(following ? "👤 You're now following this user!" : "👋 Unfollowed user.");
    };

    commentsSection.appendChild(commentsList);
    commentsSection.appendChild(commentInput);
    commentsSection.appendChild(commentSubmit);

    postEl.appendChild(authorEl);
    postEl.appendChild(textEl);
    postEl.appendChild(actionsEl);
    postEl.appendChild(commentsSection);

    postsContainer.appendChild(postEl);
  }
}

function renderTrendingPosts() {
  const container = document.getElementById('trending-posts');
  if (!container) return;

  container.innerHTML = '';

  const sorted = posts.slice().sort((a, b) => b.likes.length - a.likes.length);

  if (sorted.length === 0) {
    container.innerHTML = '<p>No trending posts yet!</p>';
    return;
  }

  for (const post of sorted.slice(0, 5)) {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <h3>@${post.author}</h3>
      <p>${post.text}</p>
      <p>❤️ ${post.likes.length} likes</p>
    `;
    container.appendChild(div);
  }
}

function showNotification(msg) {
  const bar = document.getElementById('notification-bar');
  if (!bar) return;
  bar.textContent = msg;
  bar.style.display = 'block';
  setTimeout(() => bar.style.display = 'none', 3000);
}

// ======= Event Listeners =======

// Signup
signupBtn.onclick = () => {
  const username = signupUsernameInput.value.trim();
  const password = signupPasswordInput.value.trim();

  if (!username || !password) {
    alert('Please enter a username and password.');
    return;
  }

  if (users[username]) {
    alert('Username already exists. Please choose another.');
    return;
  }

  users[username] = { password };
  currentUser = username;
  saveData();
  signupUsernameInput.value = '';
  signupPasswordInput.value = '';
  alert(`Welcome, ${username}! You are now signed up and logged in.`);
  renderUI();
  renderTrendingPosts();
};

// Login
loginBtn.onclick = () => {
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!username || !password) {
    alert('Please enter your username and password.');
    return;
  }

  if (!users[username] || users[username].password !== password) {
    alert('Invalid username or password.');
    return;
  }

  currentUser = username;
  saveData();
  loginUsernameInput.value = '';
  loginPasswordInput.value = '';
  alert(`Welcome back, ${username}!`);
  renderUI();
  renderTrendingPosts();
};

// Logout
logoutBtn.onclick = () => {
  currentUser = null;
  saveData();
  renderUI();
  renderTrendingPosts();
};

// Post
postBtn.onclick = () => {
  const text = postTextInput.value.trim();

  if (!text) {
    alert('Please write something before posting.');
    return;
  }

  const newPost = {
    id: Date.now().toString(),
    author: currentUser,
    text,
    timestamp: Date.now(),
    likes: [],
  };

  posts.push(newPost);
  saveData();
  postTextInput.value = '';
  renderPosts();
  renderTrendingPosts();
};

// Tabs
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-page").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    const tabId = "tab-" + btn.dataset.tab;
    document.getElementById(tabId).classList.add("active");
    btn.classList.add("active");

    // If switching to trending, re-render it
    if (tabId === "tab-trending") {
      renderTrendingPosts();
    }
  });
});

// AI Panels
function askAI() {
  const input = document.getElementById('ai-input').value.trim();
  const output = document.getElementById('ai-output');

  if (!input) {
    output.textContent = "Please enter a question.";
    return;
  }

  output.textContent = "🤖 Thinking... (AI connection coming soon)";
}

function refreshInsights() {
  const div = document.getElementById('ai-insights');
  div.innerHTML = "<p>Re-analyzing site behavior... (AI engine placeholder)</p>";
}

// ======= Init =======
renderUI();
renderTrendingPosts();

// === Multiplayer Mini Game ===
let isPlayerOne = false;
let gameState = {
  players: [],
  turn: null,
};

document.getElementById('join-game-btn').addEventListener('click', () => {
  const username = currentUser || 'Guest_' + Math.floor(Math.random() * 9999);

  if (!gameState.players.includes(username)) {
    gameState.players.push(username);
    if (gameState.players.length === 1) {
      isPlayerOne = true;
      gameState.turn = username;
    }
    updateGameUI();
  }
});

function updateGameUI() {
  const status = document.getElementById('game-status');
  if (gameState.players.length === 1) {
    status.innerHTML = `Player 1 joined: <strong>${gameState.players[0]}</strong><br>Waiting for Player 2...`;
  } else if (gameState.players.length === 2) {
    status.innerHTML = `
      Player 1: <strong>${gameState.players[0]}</strong><br>
      Player 2: <strong>${gameState.players[1]}</strong><br><br>
      <strong>It's ${gameState.turn}'s turn!</strong>
      <br><br>
      <button onclick="makeMove()">Make Move</button>
    `;
  }
}

function makeMove() {
  const currentIndex = gameState.players.indexOf(gameState.turn);
  const nextIndex = (currentIndex + 1) % gameState.players.length;
  gameState.turn = gameState.players[nextIndex];
  showNotification(`${gameState.turn}'s turn!`);
  updateGameUI();
}
// === Discord Bot Creator ===
document.getElementById('run-bot-btn').addEventListener('click', () => {
  const code = document.getElementById('bot-code').value.trim();
  const output = document.getElementById('bot-output');
  output.textContent = '';

  if (!code) {
    output.textContent = 'Please write some bot code!';
    return;
  }

  // Simple bot scripting language interpreter
  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue; // skip empty lines

    const cmd = trimmed.toLowerCase();

    if (cmd.startsWith('say ')) {
      output.textContent += `Bot says: ${trimmed.slice(4)}\n`;
    } else if (cmd.startsWith('wait ')) {
      output.textContent += `Bot waits for ${trimmed.slice(5)} seconds...\n`;
    } else if (cmd.startsWith('send ')) {
      output.textContent += `Bot sends message: ${trimmed.slice(5)}\n`;
    } else if (cmd.startsWith('help')) {
      output.textContent += `Available commands:\n- say [message]\n- wait [seconds]\n- send [message]\n`;
    } else {
      output.textContent += `Unknown command: ${trimmed}\n`;
    }
  }
});