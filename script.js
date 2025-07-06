// ======= Globals =======
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = localStorage.getItem('currentUser') || null;
let posts = JSON.parse(localStorage.getItem('posts')) || [];

let isPlayerOne = false;
let gameState = { players: [], turn: null };

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

// ======= Save & Render =======
function saveData() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('posts', JSON.stringify(posts));
  currentUser ? localStorage.setItem('currentUser', currentUser) : localStorage.removeItem('currentUser');
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
      if (!currentUser || !users[currentUser]) return;
      const postIndex = posts.findIndex(p => p.id === post.id);
      const likes = posts[postIndex].likes;
      const userIdx = likes.indexOf(currentUser);
      if (userIdx === -1) {
        likes.push(currentUser);
      } else {
        likes.splice(userIdx, 1);
      }
      saveData();
      renderPosts();
      renderTrendingPosts();
      renderExplorePosts();
    };

    const commentToggle = document.createElement('button');
    commentToggle.className = 'comment-toggle';
    commentToggle.textContent = '💬 Comments';

    const followBtn = document.createElement('button');
    followBtn.className = 'follow-btn';
    const isFollowing = currentUser && users[currentUser]?.following?.includes(post.author);
    followBtn.textContent = isFollowing ? 'Following ✓' : '+ Follow';

    followBtn.onclick = () => {
      if (!currentUser || !users[currentUser] || currentUser === post.author) return;
      const following = users[currentUser].following || [];
      const idx = following.indexOf(post.author);
      if (idx === -1) {
        following.push(post.author);
        followBtn.textContent = 'Following ✓';
        showNotification(`👤 Now following @${post.author}`);
      } else {
        following.splice(idx, 1);
        followBtn.textContent = '+ Follow';
        showNotification(`👋 Unfollowed @${post.author}`);
      }
      users[currentUser].following = following;
      saveData();
    };

    actionsEl.append(likeBtn, commentToggle, followBtn);

    const commentsSection = document.createElement('div');
    commentsSection.className = 'comments-section';
    commentsSection.style.display = 'none';

    const commentsList = document.createElement('div');
    commentsList.className = 'comments-list';

    (post.comments || []).forEach(c => {
      const comment = document.createElement('p');
      comment.textContent = `${c.author}: ${c.text}`;
      commentsList.appendChild(comment);
    });

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
      if (!text || !currentUser || !users[currentUser]) return;
      const comment = { author: currentUser, text };
      const postIndex = posts.findIndex(p => p.id === post.id);
      posts[postIndex].comments = posts[postIndex].comments || [];
      posts[postIndex].comments.push(comment);
      saveData();
      renderPosts();
      renderTrendingPosts();
      renderExplorePosts();
      showNotification("💬 Comment posted!");
    };

    commentsSection.append(commentsList, commentInput, commentSubmit);
    postEl.append(authorEl, textEl, actionsEl, commentsSection);
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
    div.innerHTML = `<h3>@${post.author}</h3><p>${post.text}</p><p>❤️ ${post.likes.length} likes</p>`;
    container.appendChild(div);
  }
}

function renderExplorePosts() {
  const container = document.getElementById('explore-posts');
  if (!container) return;
  container.innerHTML = '';

  const shuffled = posts.slice().sort(() => 0.5 - Math.random());
  shuffled.slice(0, 5).forEach(post => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `<h3>@${post.author}</h3><p>${post.text}</p>`;
    container.appendChild(div);
  });
}

function showNotification(msg) {
  const bar = document.getElementById('notification-bar');
  if (!bar) return;
  bar.textContent = msg;
  bar.style.display = 'block';
  setTimeout(() => bar.style.display = 'none', 3000);
}

// ======= Event Listeners =======
signupBtn.onclick = () => {
  const username = signupUsernameInput.value.trim();
  const password = signupPasswordInput.value.trim();
  if (!username || !password) return alert('Enter username and password.');
  if (users[username]) return alert('Username exists.');

  users[username] = { password: btoa(password), following: [] };
  currentUser = username;
  saveData();
  signupUsernameInput.value = '';
  signupPasswordInput.value = '';
  alert(`Welcome, ${username}!`);
  renderUI();
};

loginBtn.onclick = () => {
  const username = loginUsernameInput.value.trim();
  const password = loginPasswordInput.value.trim();
  if (!username || !password) return alert('Enter your username and password.');
  if (!users[username] || users[username].password !== btoa(password)) return alert('Invalid login.');

  currentUser = username;
  saveData();
  loginUsernameInput.value = '';
  loginPasswordInput.value = '';
  alert(`Welcome back, ${username}!`);
  renderUI();
};

logoutBtn.onclick = () => {
  currentUser = null;
  saveData();
  renderUI();
};

postBtn.onclick = () => {
  const text = postTextInput.value.trim();
  if (!text) return alert('Write something first.');
  if (!currentUser || !users[currentUser]) return alert("You must be logged in.");

  const newPost = {
    id: Date.now().toString(),
    author: currentUser,
    text,
    timestamp: Date.now(),
    likes: [],
    comments: []
  };

  posts.push(newPost);
  saveData();
  postTextInput.value = '';
  renderPosts();
  renderTrendingPosts();
  renderExplorePosts();
};

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-page").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    const tabId = "tab-" + btn.dataset.tab;
    document.getElementById(tabId)?.classList.add("active");
    btn.classList.add("active");
    if (tabId === "tab-trending") renderTrendingPosts();
    if (tabId === "tab-explore") renderExplorePosts();
  });
});

// ======= AI Panel =======
document.getElementById('ask-ai-btn')?.addEventListener('click', askAI);
function askAI() {
  const input = document.getElementById('ai-input').value.trim();
  const output = document.getElementById('ai-output');
  if (!input) return output.textContent = "Please enter a question.";
  output.innerHTML = `🤖 Thinking...<br><em>(Fake AI: "${input}")</em>`;
}

// ======= Game Logic =======
document.getElementById('join-game-btn')?.addEventListener('click', () => {
  const username = currentUser || 'Guest_' + Math.floor(Math.random() * 9999);
  if (gameState.players.includes(username)) return;
  if (gameState.players.length >= 2) return showNotification("❌ Game is full!");

  gameState.players.push(username);
  if (gameState.players.length === 1) {
    isPlayerOne = true;
    gameState.turn = username;
  }
  updateGameUI();
});

function updateGameUI() {
  const status = document.getElementById('game-status');
  if (!status) return;

  if (gameState.players.length === 1) {
    status.innerHTML = `Player 1: <strong>${gameState.players[0]}</strong><br>Waiting for Player 2...`;
  } else if (gameState.players.length === 2) {
    status.innerHTML = `
      Player 1: <strong>${gameState.players[0]}</strong><br>
      Player 2: <strong>${gameState.players[1]}</strong><br><br>
      <strong>It's ${gameState.turn}'s turn!</strong><br><br>
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

// ======= Bot Creator =======
document.getElementById('run-bot-btn')?.addEventListener('click', () => {
  const code = document.getElementById('bot-code').value.trim();
  const output = document.getElementById('bot-output');
  output.textContent = '';

  if (!code) return output.textContent = 'Please write some bot code!';

  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    if (!trimmed) continue;

    if (trimmed.startsWith('say ')) {
      output.textContent += `Bot says: ${trimmed.slice(4)}\n`;
    } else if (trimmed.startsWith('wait ')) {
      output.textContent += `Bot waits for ${trimmed.slice(5)} seconds...\n`;
    } else if (trimmed.startsWith('send ')) {
      output.textContent += `Bot sends message: ${trimmed.slice(5)}\n`;
    } else if (trimmed === 'help') {
      output.textContent += `Available commands:\n- say [message]\n- wait [seconds]\n- send [message]\n`;
    } else {
      output.textContent += `Unknown command: ${trimmed}\n`;
    }
  }
});

// ======= Admin Dashboard =======
function renderAdminDashboard() {
  const adminSection = document.getElementById('tab-admin');
  if (!adminSection) return;

  if (currentUser === 'admin') {
    adminSection.style.display = 'block';

    const userList = document.getElementById('admin-user-list');
    userList.innerHTML = '';
    Object.keys(users).forEach(u => {
      const li = document.createElement('li');
      li.textContent = u + (u === 'admin' ? ' (admin)' : '');
      userList.appendChild(li);
    });

    const postList = document.getElementById('admin-post-list');
    postList.innerHTML = '';
    posts.forEach(post => {
      const li = document.createElement('li');
      li.textContent = `@${post.author}: ${post.text}`;
      postList.appendChild(li);
    });

  } else {
    adminSection.style.display = 'none';
  }
}

// ======= Final Unified UI Render =======
function renderUI() {
  if (currentUser && users[currentUser]) {
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
  renderAdminDashboard();
}

renderUI();
renderTrendingPosts();
renderExplorePosts();