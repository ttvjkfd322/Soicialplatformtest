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
    // Show user info and post creation & feed
    authSection.classList.add('hidden');
    postCreationSection.classList.remove('hidden');
    feedSection.classList.remove('hidden');
    userInfoDiv.classList.remove('hidden');
    usernameDisplay.textContent = currentUser;
    renderPosts();
  } else {
    // Show auth forms only
    authSection.classList.remove('hidden');
    postCreationSection.classList.add('hidden');
    feedSection.classList.add('hidden');
    userInfoDiv.classList.add('hidden');
  }
}

function renderPosts() {
  // Clear container
  postsContainer.innerHTML = '';

  // Sort posts by timestamp descending (latest first)
  const sortedPosts = posts.slice().sort((a, b) => b.timestamp - a.timestamp);

  if (sortedPosts.length === 0) {
    postsContainer.innerHTML = '<p>No posts yet. Be the first!</p>';
    return;
  }

  for (const post of sortedPosts) {
    const postEl = document.createElement('div');
    postEl.className = 'post';

    // Author
    const authorEl = document.createElement('div');
    authorEl.className = 'post-author';
    authorEl.textContent = post.author;

    // Text
    const textEl = document.createElement('div');
    textEl.className = 'post-text';
    textEl.textContent = post.text;

    // Actions (likes)
    const actionsEl = document.createElement('div');
    actionsEl.className = 'post-actions';

    const likeBtn = document.createElement('button');
    likeBtn.textContent = `❤️ ${post.likes.length}`;
    likeBtn.title = 'Like/Unlike';

    // Disable like button if no user logged in
    likeBtn.disabled = !currentUser;

    likeBtn.onclick = () => {
      if (!currentUser) return;
      const userLikes = post.likes;
      const userIndex = userLikes.indexOf(currentUser);
      if (userIndex === -1) {
        userLikes.push(currentUser);
      } else {
        userLikes.splice(userIndex, 1);
      }
      saveData();
      renderPosts();
    };

    actionsEl.appendChild(likeBtn);

    // Assemble post
    postEl.appendChild(authorEl);
    postEl.appendChild(textEl);
    postEl.appendChild(actionsEl);

    postsContainer.appendChild(postEl);
  }
}

// ======= Event Handlers =======





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
};


gg

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
};

// Logout
logoutBtn.onclick = () => {
  currentUser = null;
  saveData();
  renderUI();
};

document.addEventListener('DOMContentLoaded', () => {
  const posts = document.querySelectorAll('.post');

  posts.forEach(post => {
    const likeBtn = post.querySelector('.like-btn');
    const likeCount = post.querySelector('.like-count');
    const commentToggle = post.querySelector('.comment-toggle');
    const commentInput = post.querySelector('.comment-input');
    const commentSubmit = post.querySelector('.comment-submit');
    const commentsList = post.querySelector('.comments-list');
    const commentsSection = post.querySelector('.comments-section');
    const followBtn = post.querySelector('.follow-btn');

    let liked = false;
    let following = false;

    likeBtn.addEventListener('click', () => {
      liked = !liked;
      likeBtn.classList.toggle('liked', liked);
      let count = parseInt(likeCount.textContent);
      likeCount.textContent = liked ? count + 1 : count - 1;
      showNotification(liked ? "You liked the post ❤️" : "You unliked the post 💔");
    });

    commentToggle.addEventListener('click', () => {
      commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    });

    commentSubmit.addEventListener('click', () => {
      const text = commentInput.value.trim();
      if (text) {
        const comment = document.createElement('p');
        comment.textContent = `You: ${text}`;
        commentsList.appendChild(comment);
        commentInput.value = '';
        showNotification("💬 Comment posted!");
      }
    });

    followBtn.addEventListener('click', () => {
      following = !following;
      followBtn.textContent = following ? "Following ✓" : "+ Follow";
      showNotification(following ? "👤 You're now following this user!" : "👋 Unfollowed user.");
    });
    document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active from all tabs and buttons
    document.querySelectorAll(".tab-page").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    // Add active to clicked tab and button
    const tabId = "tab-" + btn.dataset.tab;
    document.getElementById(tabId).classList.add("active");
    btn.classList.add("active");
  });
});
  });
});

function showNotification(msg) {
  const bar = document.getElementById('notification-bar');
  bar.textContent = msg;
  bar.style.display = 'block';
  setTimeout(() => bar.style.display = 'none', 3000);
}

// Create Post
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
};

// ======= Initialize =======
renderUI();