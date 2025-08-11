/*
 * Script pour le simulateur de patrimoine.
 * Calcule l'évolution de la valeur en supposant des versements mensuels et un taux annuel constant.
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("simulator-form");
  const resultSection = document.getElementById("result-section");
  const finalValueEl = document.getElementById("finalValue");
  const canvas = document.getElementById("simulationChart");
  let hasDrawn = false;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const initialAmount = parseFloat(
      document.getElementById("initialAmount").value
    );
    const monthlyContribution = parseFloat(
      document.getElementById("monthlyContribution").value
    );
    const annualRate = parseFloat(
      document.getElementById("annualRate").value
    );
    const durationYears = parseInt(
      document.getElementById("duration").value,
      10
    );
    if (
      isNaN(initialAmount) ||
      isNaN(monthlyContribution) ||
      isNaN(annualRate) ||
      isNaN(durationYears)
    ) {
      alert("Veuillez remplir correctement tous les champs.");
      return;
    }
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = durationYears * 12;
    const labels = [];
    const values = [];
    let capital = initialAmount;
    for (let month = 1; month <= totalMonths; month++) {
      capital += monthlyContribution;
      capital *= 1 + monthlyRate;
      labels.push(month);
      values.push(parseFloat(capital.toFixed(2)));
    }
    const finalVal = values[values.length - 1];
    finalValueEl.textContent =
      "Valeur finale estimée après " +
      durationYears +
      " ans : " +
      finalVal.toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
      });
    resultSection.style.display = "block";
    // dessiner notre propre graphique linéaire
    drawLineChart(canvas, labels, values, durationYears);
  });
});

// Dessine un graphique linéaire simple avec axes et libellés sur un canvas.
function drawLineChart(canvas, labels, data, durationYears) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  // marges pour les axes
  const margin = 50;
  const chartWidth = width - 2 * margin;
  const chartHeight = height - 2 * margin;
  // valeurs max et min
  const maxY = Math.max(...data) * 1.1;
  const minY = 0;
  // effacer
  ctx.clearRect(0, 0, width, height);
  ctx.font = "12px Arial";
  ctx.fillStyle = "#333";
  ctx.strokeStyle = "#333";
  // axes
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, margin + chartHeight);
  ctx.lineTo(margin + chartWidth, margin + chartHeight);
  ctx.stroke();
  // y-axis ticks
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const y = margin + chartHeight - (i / yTicks) * chartHeight;
    const value = minY + ((maxY - minY) * i) / yTicks;
    ctx.beginPath();
    ctx.moveTo(margin - 5, y);
    ctx.lineTo(margin, y);
    ctx.stroke();
    ctx.fillText(value.toFixed(0), 5, y + 4);
  }
  // marques de graduation pour l'axe des X (en années)
  const years = durationYears;
  for (let i = 0; i <= years; i++) {
    const x = margin + (i / years) * chartWidth;
    ctx.beginPath();
    ctx.moveTo(x, margin + chartHeight);
    ctx.lineTo(x, margin + chartHeight + 5);
    ctx.stroke();
    ctx.fillText(i.toString(), x - 4, margin + chartHeight + 18);
  }
  // line
  ctx.beginPath();
  data.forEach((val, index) => {
    const x = margin + (index / (data.length - 1)) * chartWidth;
    const y = margin + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = "#007bff";
  ctx.lineWidth = 2;
  ctx.stroke();
  // points
  ctx.fillStyle = "#007bff";
  data.forEach((val, index) => {
    const x = margin + (index / (data.length - 1)) * chartWidth;
    const y = margin + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
  // titre
  ctx.fillStyle = "#333";
  ctx.font = "14px Arial";
  ctx.fillText(
    "Projection mensuelle sur " + durationYears + " ans",
    margin,
    margin - 20
  );
  // labels d'axes
  ctx.font = "12px Arial";
  ctx.save();
  // y-axis label
  ctx.translate(10, margin + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Montant (€)", 0, 0);
  ctx.restore();
  // x-axis label
  ctx.fillText(
    "Années",
    margin + chartWidth / 2 - 20,
    margin + chartHeight + 35
  );
}
