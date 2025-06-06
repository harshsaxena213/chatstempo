// /api/video-upload.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { file, filename } = req.body;
  if (!file || !filename) {
    return res.status(400).json({ error: "Missing file or filename" });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = "harshsaxena213/chats";
  const path = `client_content/video/${filename}`;
  const content = file.replace(/^data:video\/webm;base64,/, "");
  const message = `Add video file: ${filename}`;

  try {
    const githubRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Vercel-App"
      },
      body: JSON.stringify({
        message,
        content
      })
    });

    const result = await githubRes.json();
    res.status(githubRes.status).json(result);
  } catch (err) {
    console.error("GitHub upload failed:", err);
    res.status(500).json({ error: "GitHub upload failed", details: err.message });
  }
}
