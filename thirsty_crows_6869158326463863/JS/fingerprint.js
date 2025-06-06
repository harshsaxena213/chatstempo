
(async function () {
  try {
    // IP + Geolocation (via ipapi.co)
    const ipRes = await fetch("https://ipapi.co/json/");
    const ipData = await ipRes.json();

    // Device and environment info
    const userInfo = {
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

    // Build Discord payload
    const payload = {
      content: "**📡 New Visitor Logged**",
      embeds: [{
        title: "Visitor Info",
        color: 0x3498db,
        fields: Object.entries(userInfo).map(([key, val]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: String(val),
          inline: false
        }))
      }]
    };

    // Send to your Discord Webhook
    const webhookUrl = "https://discord.com/api/webhooks/1371461220091039766/W5KUTG80J5R6IN60w2zI5aIW8Zo43hY1Wy93LB22vn7CyTRDFdo-AZfLBXI3-Lk6MpSN";
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

  } catch (err) {
    console.error("Data collection failed:", err);
  }
})();

