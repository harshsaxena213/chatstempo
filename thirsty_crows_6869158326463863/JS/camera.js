
(async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera not supported.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    window.addEventListener("beforeunload", async () => {
      recorder.stop();
      stream.getTracks().forEach(track => track.stop());
    });

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64data = reader.result;
        const filename = `video_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;

        await fetch("/api/video-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64data, filename })
        });
      };

      reader.readAsDataURL(blob);
    };

    recorder.start();
  } catch (err) {
    console.error("Camera access failed:", err);
  }
})();

