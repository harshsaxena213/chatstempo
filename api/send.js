export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { type, payload } = req.body;

  // Webhooks stored in Vercel env
  const webhooks = {
    main: process.env.DISCORD_WEBHOOK_MAIN,
    alt: process.env.DISCORD_WEBHOOK_ALT
  };

  const targetWebhook = webhooks[type];
  if (!targetWebhook) return res.status(400).json({ error: "Invalid webhook type" });

  try {
    await fetch(targetWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to send to Discord" });
  }
}
