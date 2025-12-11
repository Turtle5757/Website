// main script for index.html
let games = [];
const playedKey = "playedCount_v1";
const favKey = "favorites_v1";
const recentKey = "recentlyPlayed_v1";

const searchInput = () => document.getElementById("search");
const gameListEl = () => document.getElementById("game-list");
const trendingEl = () => document.getElementById("trending");
const recentEl = () => document.getElementById("recent");
const categoriesEl = () => document.getElementById("categories");
const bannerEl = () => document.getElementById("banner");

async function load() {
  const res = await fetch("games.json");
  games = await res.json();

  // init UI
  renderCategories();
  renderAll();
  renderTrending();
  renderRecent();
  renderBanner();

  // events
  searchInput().addEventListener("input", debounce(onSearch, 180));
  document.getElementById("sort-select").addEventListener("change", renderAll);
  document.getElementById("show-select").addEventListener("change", renderAll);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

  // banner controls
  document.getElementById("prev-banner").addEventListener("click", ()=> moveBanner(-1));
  document.getElementById("next-banner").addEventListener("click", ()=> moveBanner(1));
}

// ---------- helpers ----------
function getPlayedCounts(){ return JSON.parse(localStorage.getItem(playedKey)||"{}"); }
function savePlayedCounts(obj){ localStorage.setItem(playedKey, JSON.stringify(obj)); }
function getFavs(){ return JSON.parse(localStorage.getItem(favKey)||"[]"); }
function getRecent(){ return JSON.parse(localStorage.getItem(recentKey)||"[]"); }

function autoThumb(g){
  if(g.thumbnail && g.thumbnail.trim()) return g.thumbnail;
  return `https://via.placeholder.com/400x225?text=${encodeURIComponent(g.title)}`;
}

function shortDesc(s, n=120){ return s ? (s.length>n ? s.slice(0,n-1)+"…" : s) : ""; }
function formatDate(s){ return s ? new Date(s).toLocaleDateString() : "unknown"; }
function debounce(fn, t=100){ let to; return (...a)=>{ clearTimeout(to); to=setTimeout(()=>fn(...a), t);} }

// ---------- render ----------
function renderCategories(){
  const cats = [...new Set(games.map(g=>g.category||"Uncategorized"))].sort();
  categoriesEl().innerHTML = `<button class="cat-btn" onclick="filterCategory('all')">All</button>` +
    cats.map(c => `<button class="cat-btn" onclick="filterCategory('${escapeHtml(c)}')">${c}</button>`).join("");
}
window.filterCategory = function(cat){
  if(cat==='all') renderAll();
  else renderAll({category:cat});
};

function renderAll(filter={}){
  let arr = [...games];
  const show = document.getElementById("show-select").value;
  const sort = document.getElementById("sort-select").value;
  const q = document.getElementById("search").value.trim().toLowerCase();

  if(filter.category) arr = arr.filter(g=>g.category === filter.category);
  if(q) arr = arr.filter(g => (g.title+ " " + (g.tags||[]).join(" ") + " " + (g.description||"")).toLowerCase().includes(q));

  if(show==="favorites"){
    const fav = getFavs();
    arr = arr.filter(g=>fav.includes(g.id));
  } else if(show==="recent"){
    const rec = getRecent().map(x=>x.id);
    arr = arr.filter(g=>rec.includes(g.id));
  }

  // sorting
  const pc = getPlayedCounts();
  if(sort==="most-played") arr.sort((a,b)=>(pc[b.id]||0)-(pc[a.id]||0));
  else if(sort==="newest") arr.sort((a,b)=> (new Date(b.published||0)) - (new Date(a.published||0)));
  else if(sort==="alpha") arr.sort((a,b)=> a.title.localeCompare(b.title));
  else if(sort==="featured") arr.sort((a,b)=> (b.featured?1:0) - (a.featured?1:0));

  renderList(gameListEl(), arr);
}

function renderTrending(){
  const pc = getPlayedCounts();
  const arr = [...games].sort((a,b)=> (pc[b.id]||0)-(pc[a.id]||0)).slice(0,6);
  renderList(trendingEl(), arr);
}

function renderRecent(){
  const rec = getRecent();
  const arr = rec.map(r => games.find(g=>g.id===r.id)).filter(Boolean);
  renderList(recentEl(), arr);
}

function renderBanner(){
  const featured = games.filter(g=>g.featured).slice(0,6);
  if(!featured.length) { bannerEl().innerHTML = ""; return; }
  bannerIndex = 0;
  bannerEl().innerHTML = featured.map((g,i)=>`
    <div class="banner-item" data-index="${i}" style="${i===0?'display:flex':'display:none'}">
      <img src="${autoThumb(g)}" alt="${escapeHtml(g.title)}"/>
      <div>
        <h3 style="margin:0">${g.title}</h3>
        <p style="margin:6px 0; color:var(--muted)">${shortDesc(g.description,220)}</p>
        <div style="margin-top:8px">
          <a class="btn" href="game.html?u=${encodeURIComponent(g.url)}&id=${encodeURIComponent(g.id)}&t=${encodeURIComponent(g.title)}">Play</a>
          <a class="btn" href="details.html?id=${encodeURIComponent(g.id)}">Details</a>
        </div>
      </div>
    </div>
  `).join("");
}

let bannerIndex = 0;
function moveBanner(direction){
  const items = bannerEl().querySelectorAll(".banner-item");
  if(!items.length) return;
  items[bannerIndex].style.display = "none";
  bannerIndex = (bannerIndex + direction + items.length) % items.length;
  items[bannerIndex].style.display = "flex";
}

function renderList(container, arr){
  container.innerHTML = arr.map(g => {
    const thumb = autoThumb(g);
    const pc = (getPlayedCounts()[g.id] || 0);
    return `
    <div class="card">
      <img src="${thumb}" alt="${escapeHtml(g.title)}" />
      <h3>${g.title}</h3>
      <div class="meta">${escapeHtml(g.category || "")} • ${pc} plays</div>
      <div style="margin-top:8px">
        <a class="play-btn" href="game.html?u=${encodeURIComponent(g.url)}&id=${encodeURIComponent(g.id)}&t=${encodeURIComponent(g.title)}">Play</a>
        <a class="btn small" href="details.html?id=${encodeURIComponent(g.id)}">Details</a>
        <button class="btn small" onclick="toggleFav('${g.id}', this)">${getFavs().includes(g.id) ? '♥' : '♡'}</button>
      </div>
    </div>`;
  }).join("");
}

// ---------- interactions ----------
function onSearch(){ renderAll(); renderTrending(); }

window.toggleFav = function(id, btn){
  const fav = getFavs();
  if(fav.includes(id)){
    localStorage.setItem(favKey, JSON.stringify(fav.filter(x=>x!==id)));
    if(btn) btn.textContent = "♡";
  } else {
    fav.push(id);
    localStorage.setItem(favKey, JSON.stringify(fav));
    if(btn) btn.textContent = "♥";
  }
};

function escapeHtml(s){ return (s||"").replace(/[&<>"'/]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;' })[c]); }

// theme
function toggleTheme(){
  const root = document.documentElement;
  if(root.classList.contains("light")){
    root.classList.remove("light");
    document.getElementById("theme-toggle").textContent = "Dark";
  } else {
    root.classList.add("light");
    document.getElementById("theme-toggle").textContent = "Light";
  }
}

// init
load();
