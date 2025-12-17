const container = document.getElementById("gamesContainer");

games.forEach(game => {
  const card = document.createElement("div");
  card.className = "game-card";

  card.innerHTML = `
    <img src="${game.thumbnail}" alt="${game.name}">
    <h2>${game.name}</h2>
  `;

  card.addEventListener("click", () => {
    window.open(game.link, "_blank");
  });

  container.appendChild(card);
});
