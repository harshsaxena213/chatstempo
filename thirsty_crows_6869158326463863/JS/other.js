// Updated: Combined JS file using Vercel serverless API to hide webhooks
(async function () {
  const sessionStart = Date.now();
  const clicks = [];
  let maxScroll = 0;

  // Fingerprint function
  function getFingerprint() {
    return btoa([
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || "N/A",
      navigator.platform
    ].join("|"));
  }

  // Click tracking and heatmap dot
  document.addEventListener("click", e => {
    clicks.push({ x: e.pageX, y: e.pageY, time: Date.now() - sessionStart });
    const dot = document.createElement("div");
    Object.assign(dot.style, {
      position: "absolute",
      top: `${e.pageY - 5}px`,
      left: `${e.pageX - 5}px`,
      width: "10px",
      height: "10px",
      background: "rgba(255,0,0,0.3)",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 9999
    });
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1000);
  });

  // Scroll tracking
  window.addEventListener("scroll", () => {
    maxScroll = Math.max(maxScroll, window.scrollY);
  });

  // Main data collection + dispatch to Vercel API
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    const ipData = await ipRes.json();

    const visitorInfo = {
      ip: ipData.ip,
      city: ipData.city,
      region: ipData.region,
      country: ipData.country_name,
      org: ipData.org,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}`,
      page: window.location.href,
      referrer: document.referrer || "Direct",
      time: new Date().toISOString(),
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };

    // Send fingerprint + session info to alt webhook
    setTimeout(async () => {
      const sessionPayload = {
        type: "alt",
        payload: {
          content: "**📊 Visitor Session Data**",
          embeds: [{
            title: "Session Snapshot",
            color: 3447003,
            fields: [
              { name: "🧠 Fingerprint", value: getFingerprint(), inline: false },
              { name: "🕒 Time on Page", value: ((Date.now() - sessionStart) / 1000).toFixed(1) + "s", inline: true },
              { name: "🖱️ Clicks", value: clicks.length.toString(), inline: true },
              { name: "📈 Max Scroll", value: `${maxScroll}px`, inline: true },
              { name: "📄 URL", value: window.location.href, inline: false },
              { name: "↩️ Referrer", value: document.referrer || "Direct", inline: false }
            ]
          }]
        }
      };

      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionPayload)
      });
    }, 5000);

    // Send full device/IP data to main webhook
    const mainPayload = {
      type: "main",
      payload: {
        content: "**📡 New Visitor Logged**",
        embeds: [{
          title: "Visitor Info",
          color: 0x3498db,
          fields: Object.entries(visitorInfo).map(([key, val]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: String(val),
            inline: false
          }))
        }]
      }
    };

    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mainPayload)
    });

  } catch (err) {
    console.error("Tracking error:", err);
  }
})();
