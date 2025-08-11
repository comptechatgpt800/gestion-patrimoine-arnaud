/*
 * Script principal pour gérer les investissements d'Arnaud.
 * Utilise le stockage local du navigateur pour persister les données.
 * Affiche la liste des investissements, un résumé global et un graphique.
 */

// clé de stockage locale
const STORAGE_KEY = "investissements_arnaud";

// récupère les investissements du stockage local
function loadInvestments() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// sauvegarde les investissements dans le stockage local
function saveInvestments(investments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
}

// calcule le résumé et met à jour le tableau et le graphique
function updateDisplay() {
  const investments = loadInvestments();
  const tbody = document.getElementById("investments-body");
  tbody.innerHTML = "";

  let totalInitialValue = 0;
  let totalCurrentValue = 0;
  const distribution = {};
  investments.forEach((inv, index) => {
    const initialValue = inv.quantity * inv.purchasePrice;
    const currentValue = inv.currentPrice
      ? inv.quantity * inv.currentPrice
      : initialValue;
    totalInitialValue += initialValue;
    totalCurrentValue += currentValue;
    // Distribution par actif pour le graphique
    const key = inv.asset;
    distribution[key] = (distribution[key] || 0) + currentValue;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${inv.asset}</td>
      <td>${inv.quantity}</td>
      <td>${inv.purchasePrice.toFixed(2)}</td>
      <td>${inv.currentPrice ? inv.currentPrice.toFixed(2) : "-"}</td>
      <td>${inv.purchaseDate}</td>
      <td>${initialValue.toFixed(2)}</td>
      <td>${currentValue.toFixed(2)}</td>
      <td class="action-buttons">
        <button class="edit-btn" data-index="${index}">Modifier</button>
        <button class="delete-btn" data-index="${index}">Supprimer</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // affichage résumé
  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML =
    `<p>Valeur initiale totale: ${totalInitialValue.toFixed(2)} €</p>` +
    `<p>Valeur actuelle totale: ${totalCurrentValue.toFixed(2)} €</p>` +
    `<p>Nombre d'investissements: ${investments.length}</p>`;

  // dessiner le graphique circulaire sans dépendre d'une bibliothèque externe
  drawPieChart("portfolioChart", distribution);

  // ajouter gestionnaires d'événements pour les boutons
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"), 10);
      deleteInvestment(idx);
    });
  });
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"), 10);
      editInvestment(idx);
    });
  });
}

// génère une couleur aléatoire
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// supprime un investissement
function deleteInvestment(index) {
  const investments = loadInvestments();
  investments.splice(index, 1);
  saveInvestments(investments);
  updateDisplay();
}

// modifie un investissement (ouvre une fenêtre modale simple)
function editInvestment(index) {
  const investments = loadInvestments();
  const inv = investments[index];
  const newAsset = prompt("Actif:", inv.asset);
  if (newAsset === null) return; // annuler
  const newQuantity = parseFloat(prompt("Quantité:", inv.quantity));
  if (isNaN(newQuantity)) return;
  const newPurchasePrice = parseFloat(
    prompt("Prix d'achat (€):", inv.purchasePrice)
  );
  if (isNaN(newPurchasePrice)) return;
  const newCurrentPriceInput = prompt(
    "Prix actuel (€) (laisser vide si inchangé):",
    inv.currentPrice !== null && inv.currentPrice !== undefined
      ? inv.currentPrice
      : ""
  );
  const newCurrentPrice = newCurrentPriceInput
    ? parseFloat(newCurrentPriceInput)
    : null;
  const newDate = prompt("Date d'achat (YYYY-MM-DD):", inv.purchaseDate);
  if (!newDate) return;
  // mettre à jour
  investments[index] = {
    asset: newAsset,
    quantity: newQuantity,
    purchasePrice: newPurchasePrice,
    currentPrice: newCurrentPrice,
    purchaseDate: newDate,
  };
  saveInvestments(investments);
  updateDisplay();
}

// gestion du formulaire d'ajout
document.getElementById("investment-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const asset = document.getElementById("asset").value.trim();
  const quantity = parseFloat(document.getElementById("quantity").value);
  const purchasePrice = parseFloat(
    document.getElementById("purchasePrice").value
  );
  const currentPriceInput = document
    .getElementById("currentPrice")
    .value.trim();
  const currentPrice = currentPriceInput ? parseFloat(currentPriceInput) : null;
  const purchaseDate = document.getElementById("purchaseDate").value;
  if (!asset || isNaN(quantity) || isNaN(purchasePrice) || !purchaseDate) {
    alert("Veuillez remplir correctement tous les champs obligatoires.");
    return;
  }
  const investments = loadInvestments();
  investments.push({
    asset: asset,
    quantity: quantity,
    purchasePrice: purchasePrice,
    currentPrice: currentPrice,
    purchaseDate: purchaseDate,
  });
  saveInvestments(investments);
  // réinitialiser le formulaire
  e.target.reset();
  updateDisplay();
});

// initialisation du contenu
document.addEventListener("DOMContentLoaded", () => {
  updateDisplay();
});

// Dessine un diagramme circulaire basique dans le canvas spécifié.
// distribution: objet {nomActif: valeur}
function drawPieChart(canvasId, distribution) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  // ajuster le canvas
  const width = canvas.width;
  const height = canvas.height;
  const radius = Math.min(width, height) / 2 - 10;
  ctx.clearRect(0, 0, width, height);
  let startAngle = -Math.PI / 2; // démarrer en haut
  const colors = [];
  Object.keys(distribution).forEach((key, idx) => {
    const val = distribution[key];
    const sliceAngle = (val / total) * 2 * Math.PI;
    const color = getRandomColor();
    colors.push({ key, color, value: val });
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2);
    ctx.arc(width / 2, height / 2, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    startAngle += sliceAngle;
  });
  // Dessiner la légende sur le côté droit
  const legendX = width - 150;
  let legendY = 20;
  ctx.font = "14px Arial";
  colors.forEach((item) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = "#333";
    const percent = ((item.value / total) * 100).toFixed(1);
    ctx.fillText(
      `${item.key} (${percent}%)`,
      legendX + 20,
      legendY + 10
    );
    legendY += 18;
  });
}
