const gamesContainer = document.getElementById("gamesContainer");
const categoryFilters = document.getElementById("categoryFilters");
const gameFrame = document.getElementById("gameFrame");

// Theme customization
document.getElementById("bgColor").addEventListener("input", e => document.body.style.backgroundColor = e.target.value);
document.getElementById("btnColor").addEventListener("input", e => {
  document.querySelectorAll(".game-card, .category-filters button").forEach(el => el.style.backgroundColor = e.target.value);
});
document.getElementById("textColor").addEventListener("input", e => {
  document.querySelectorAll(".game-card h2, .category-filters button").forEach(el => el.style.color = e.target.value);
});

// Get unique categories
const categories = [...new Set(games.map(g => g.category))];

// Create category buttons
const allBtn = document.createElement("button");
allBtn.textContent = "All";
allBtn.addEventListener("click", () => displayGames(games));
categoryFilters.appendChild(allBtn);

categories.forEach(cat => {
  const btn = document.createElement("button");
  btn.textContent = cat;
  btn.addEventListener("click", () => displayGames(games.filter(g => g.category === cat)));
  categoryFilters.appendChild(btn);
});

// Display games
function displayGames(list) {
  gamesContainer.innerHTML = "";
  list.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `<img src="${game.thumbnail}" alt="${game.name}"><h2>${game.name}</h2>`;
    card.addEventListener("click", () => {
      gameFrame.src = game.link;
    });
    gamesContainer.appendChild(card);
  });
}

// Initial display
displayGames(games);
