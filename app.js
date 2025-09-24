let posts = [];
const currentUser = "Michel";

// Guardar posts
function savePosts() {
  localStorage.setItem("miniMuakPosts", JSON.stringify(posts));
}

// Cargar posts
function loadPosts() {
  const data = localStorage.getItem("miniMuakPosts");
  if (data) posts = JSON.parse(data);
}

// Crear post
function createPost() {
  const text = document.getElementById('postText').value.trim();
  const community = document.getElementById('community').value;
  if (text === '') return alert("Escribe algo antes de publicar");

  const now = new Date();
  posts.unshift({ 
    user: currentUser, 
    text, 
    community, 
    likes: 0, 
    hearts: 0, 
    likedBy: [], 
    heartedBy: [], 
    comments: [], 
    createdAt: now.toISOString() 
  });

  document.getElementById('postText').value = '';
  savePosts();
  renderPosts();
}

// Dar like
function addLike(index) {
  const post = posts[index];
  if (!post.likedBy.includes(currentUser)) {
    post.likes++;
    post.likedBy.push(currentUser);
    savePosts();
    renderPosts();
  } else {
    alert("Ya diste 👍 a este Muak 😉");
  }
}

// Dar love
function addHeart(index) {
  const post = posts[index];
  if (!post.heartedBy.includes(currentUser)) {
    post.hearts++;
    post.heartedBy.push(currentUser);
    savePosts();
    renderPosts();
  } else {
    alert("Ya diste ❤️ a este Muak");
  }
}

// Comentar
function addComment(index) {
  const input = document.getElementById(`commentInput-${index}`);
  const commentText = input.value.trim();
  if (commentText === '') return;

  posts[index].comments.push({ user: currentUser, text: commentText });
  input.value = '';
  savePosts();
  renderPosts();
}

// Editar comentario
function editComment(postIndex, commentIndex) {
  const comment = posts[postIndex].comments[commentIndex];
  if (comment.user === currentUser) {
    const newText = prompt("Edita tu comentario:", comment.text);
    if (newText !== null && newText.trim() !== "") {
      posts[postIndex].comments[commentIndex].text = newText.trim();
      savePosts();
      renderPosts();
    }
  }
}

// Eliminar comentario
function deleteComment(postIndex, commentIndex) {
  const comment = posts[postIndex].comments[commentIndex];
  if (comment.user === currentUser) {
    if (confirm("¿Seguro que quieres eliminar este comentario?")) {
      posts[postIndex].comments.splice(commentIndex, 1);
      savePosts();
      renderPosts();
    }
  }
}

// Eliminar post
function deletePost(index) {
  if (posts[index].user === currentUser) {
    const feed = document.getElementById('feed');
    const postElement = feed.children[index];

    postElement.classList.add("fade-out");

    setTimeout(() => {
      posts.splice(index, 1);
      savePosts();
      renderPosts();
    }, 400);
  }
}

// Editar post
function editPost(index) {
  const newText = prompt("Edita tu Muak:", posts[index].text);
  if (newText !== null && newText.trim() !== "") {
    posts[index].text = newText.trim();
    savePosts();
    renderPosts();
  }
}

// Reiniciar app
function resetApp() {
  if (confirm("¿Seguro que quieres reiniciar Mini-Muak?")) {
    posts = [];
    localStorage.removeItem("miniMuakPosts");
    renderPosts();
  }
}

// Avatar
function getAvatar(user) {
  const initial = user.charAt(0).toUpperCase();
  return `<div class="avatar">${initial}</div>`;
}

// Texto largo con ver más
function formatPostText(text, index) {
  const maxLength = 150;
  if (text.length > maxLength) {
    const shortText = text.substring(0, maxLength) + "...";
    return `
      <span id="postText-${index}">${shortText}</span>
      <button class="see-more" onclick="toggleText(${index}, '${text}')">Ver más</button>
    `;
  }
  return text;
}

function toggleText(index, fullText) {
  const span = document.getElementById(`postText-${index}`);
  const btn = span.nextElementSibling;

  if (btn.innerText === "Ver más") {
    span.innerText = fullText;
    btn.innerText = "Ver menos";
  } else {
    span.innerText = fullText.substring(0, 150) + "...";
    btn.innerText = "Ver más";
  }
}

// Perfil
function updateMiniProfile() {
  const profile = document.getElementById('miniProfile');
  const userPosts = posts.filter(p => p.user === currentUser).length;
  const likesGiven = posts.reduce((t, p) => t + (p.likedBy.includes(currentUser) ? 1 : 0), 0);
  const heartsGiven = posts.reduce((t, p) => t + (p.heartedBy.includes(currentUser) ? 1 : 0), 0);

  profile.innerHTML = `
    <div class="profile-card">
      ${getAvatar(currentUser)}
      <div class="profile-info">
        <h3>${currentUser}</h3>
        <p>Muaks publicados: ${userPosts}</p>
        <p>👍 Likes dados: ${likesGiven}</p>
        <p>❤️ Loves dados: ${heartsGiven}</p>
      </div>
    </div>
  `;
}

// Renderizar posts
function renderPosts() {
  const feed = document.getElementById('feed');
  const postCountElem = document.getElementById('postCount');

  feed.innerHTML = '';

  const filter = document.getElementById('filterCommunity').value;
  const sort = document.getElementById('sortBy').value;

  let filteredPosts = posts;
  if (filter !== 'Todas') filteredPosts = posts.filter(p => p.community === filter);

  if (sort === "recientes") {
    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === "populares") {
    filteredPosts.sort((a, b) => (b.likes + b.hearts) - (a.likes + a.hearts));
  }

  postCountElem.textContent = `Total de Muaks: ${posts.length}`;

  filteredPosts.forEach((post, i) => {
    const div = document.createElement('div');
    div.className = 'post';

    div.innerHTML = `
      <div class="post-header">
        ${getAvatar(post.user)}
        <div>
          <p><b>${post.user}</b> · [${post.community}]</p>
          <small class="post-date">${new Date(post.createdAt).toLocaleString()}</small>
          <p>${formatPostText(post.text, i)}</p>
        </div>
      </div>
      <div class="actions">
        <button onclick="addLike(${i})">👍 Like</button> ${post.likes}
        <button onclick="addHeart(${i})">❤️ Love</button> ${post.hearts}
        ${post.user === currentUser ? `<button onclick="editPost(${i})">✏️ Editar</button>` : ""}
        ${post.user === currentUser ? `<button onclick="deletePost(${i})">🗑 Eliminar</button>` : ""}
      </div>
      <div class="comments">
        <h4>Comentarios (${post.comments.length}) 💬</h4>
        ${post.comments.map((c, ci) => `
          <div class="comment">
            <b>${c.user}:</b> ${c.text}
            ${c.user === currentUser ? `
              <button onclick="editComment(${i}, ${ci})">✏️</button>
              <button onclick="deleteComment(${i}, ${ci})">🗑</button>
            ` : ""}
          </div>
        `).join('')}
        <input type="text" id="commentInput-${i}" placeholder="Escribe un comentario...">
        <button onclick="addComment(${i})">Comentar</button>
      </div>
    `;
    feed.appendChild(div);
  });

  updateMiniProfile();
}

// Inicializar
loadPosts();
renderPosts();
