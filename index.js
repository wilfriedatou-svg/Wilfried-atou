const { spawn } = require("child_process");

function startBot() {
  const child = spawn("node", ["main.js"], {
    stdio: "inherit",
    shell: true
  });

  child.on("close", (code) => {
    console.log("🔁 Bot arrêté avec code:", code);

    // ❌ empêche boucle infinie
    if (code === 0) {
      console.log("✅ Arrêt normal");
      return;
    }

    // ✅ redémarrage intelligent (delay)
    setTimeout(() => {
      console.log("♻️ Redémarrage du bot...");
      startBot();
    }, 5000);
  });

  child.on("error", (err) => {
    console.error("❌ Erreur lancement :", err);
  });
}

startBot();
