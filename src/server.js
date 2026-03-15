const app = require("./app");
const { startBrowser } = require("./browser/browserManager");
const { PORT } = require("./config/env");

const server = app.listen(PORT, async () => {
  console.log("Server running on port", PORT);

  try {
    await startBrowser();
  } catch (err) {
    console.log("Browser launch failed:", err);
  }
});

async function shutdown() {
  console.log("Shutting down server...");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = server;