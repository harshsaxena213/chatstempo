(async function () {
  const webhook = "https://discord.com/api/webhooks/1371500286413242560/k6rsFccBoLvmqkghTvNvsyEB1VFQKb6X6rcXnAHieVyaZjeusqANKmPQg7WEnStqLfvq";

  const sessionStart = Date.now();
  const clicks = [];
  let maxScroll = 0;

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

  document.addEventListener("click", e => {
    clicks.push({
      x: e.pageX,
      y: e.pageY,
      time: Date.now() - sessionStart
    });

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

  window.addEventListener("scroll", () => {
    maxScroll = Math.max(maxScroll, window.scrollY);
  });

  setTimeout(() => {
    const data = {
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
    };

    fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(console.error);
  }, 5000); // wait 5 seconds to ensure full load
})();