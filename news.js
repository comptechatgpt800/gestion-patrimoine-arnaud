// news.js
// Script pour récupérer et afficher le prix de l'ETF IE0002XZSHO1 et les
// dernières actualités boursières. Les données sont obtenues via le
// proxy CORS "allorigins" qui permet d'effectuer des requêtes sur des
// sites externes depuis le navigateur sans politique de même origine.

async function fetchETFPrice() {
  const statusEl = document.getElementById('etf-status');
  const infoEl = document.getElementById('etf-info');
  try {
    // URL de l'ETF sur Stooq avec sélection des colonnes : symbol, date, heure, open, high, low, close, volume, name
    const stooqUrl = encodeURIComponent(
      'https://stooq.com/q/l/?s=ie0002xzsho1&f=sd2t2ohlcvn&e=csv'
    );
    const proxyUrl = `https://api.allorigins.win/raw?url=${stooqUrl}`;
    const response = await fetch(proxyUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Erreur réseau');
    const text = await response.text();
    const lines = text.trim().split('\n');
    // La première ligne contient les en-têtes ; la deuxième ligne contient les valeurs
    if (lines.length >= 2) {
      const fields = lines[1].split(',');
      // Les champs : symbol (0), date (1), heure (2), open (3), high (4), low (5), close (6), volume (7), name (8)
      const price = parseFloat(fields[6]);
      const date = fields[1] || '';
      const time = fields[2] || '';
      if (!isNaN(price)) {
        document.getElementById('etf-price').textContent = price.toFixed(2);
        document.getElementById('etf-date').textContent = `${date} ${time} UTC`;
        statusEl.style.display = 'none';
        infoEl.style.display = 'block';
      } else {
        throw new Error('Données non valides');
      }
    } else {
      throw new Error('Aucune donnée CSV');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du prix ETF:', error);
    statusEl.textContent =
      "Impossible de récupérer le prix en direct. Veuillez réessayer plus tard.";
    infoEl.style.display = 'none';
  }
}

async function fetchNews() {
  const newsStatus = document.getElementById('news-status');
  const newsList = document.getElementById('news-list');
  try {
    const feedUrl = encodeURIComponent('https://www.bfmtv.com/rss/news-24-7/');
    const proxyUrl = `https://api.allorigins.win/raw?url=${feedUrl}`;
    const response = await fetch(proxyUrl, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Erreur réseau lors du chargement du flux');
    const xmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const items = doc.querySelectorAll('item');
    // Nettoyage de la liste actuelle
    newsList.innerHTML = '';
    let count = 0;
    items.forEach((item) => {
      if (count >= 5) return; // limiter à 5 articles récents
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      // Création d'un conteneur d'article
      const articleDiv = document.createElement('div');
      articleDiv.className = 'news-item';
      // Titre avec lien
      const h3 = document.createElement('h3');
      const a = document.createElement('a');
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = title;
      h3.appendChild(a);
      // Date de publication (formatée simplement)
      const p = document.createElement('p');
      p.textContent = pubDate;
      articleDiv.appendChild(h3);
      articleDiv.appendChild(p);
      newsList.appendChild(articleDiv);
      count++;
    });
    newsStatus.style.display = 'none';
    newsList.style.display = 'block';
  } catch (error) {
    console.error('Erreur lors du chargement des actualités:', error);
    newsStatus.textContent =
      "Impossible de charger les actualités. Veuillez réessayer plus tard.";
    newsList.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchETFPrice();
  fetchNews();
  // Actualisation du prix toutes les 60 secondes
  setInterval(fetchETFPrice, 60 * 1000);
});
