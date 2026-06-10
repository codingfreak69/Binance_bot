// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = 3e3;
  app.use(express.json());
  const apiKey = process.env.GEMINI_API_KEY;
  let ai = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      console.log("Server-side GoogleGenAI successfully initialized.");
    } catch (err) {
      console.error("Error initializing GoogleGenAI:", err);
    }
  } else {
    console.warn("GEMINI_API_KEY is not defined in process.env. AI consulting features will run in mock demonstration mode.");
  }
  app.post("/api/consultant", async (req, res) => {
    const { message, fileContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message payload is required." });
    }
    if (!ai) {
      return res.json({
        text: `[Sandbox Demonstration Mode] Setup successful! However, to speak with the real Gemini model, please configure your GEMINI_API_KEY in the Settings Secrets.

Here is a simulated guidance based on your request:
- Make sure you run 'pip install -r requirements.txt' inside your python environment first.
- The Python CLI bot supports placing limit, market, and stop-limit orders using 'python cli.py'.
- For a LIMIT BUY of BTCUSDT, run: 'python cli.py --symbol BTCUSDT --side BUY --order-type LIMIT --quantity 0.001 --price 42000'
- Your logs are saved in 'logs/bot.log' in standard 'YYYY-MM-DD HH:MM:SS | LEVEL | Message' format.`
      });
    }
    try {
      const systemInstruction = `You are an elite cryptocurrency algorithmic trading consultant.
You specialize in the python-binance library, Binance USDT-M Futures APIs, and CLI bot development in Python 3.9+.

The user is exploring a Python CLI Trading Bot they wrote, which has the following components:
1. bot/client.py - A Binance client wrapper targeting 'https://testnet.binancefuture.com'
2. bot/orders.py - Place MARKET, LIMIT, or STOP (stop-limit) orders
3. bot/validators.py - Alphanumeric symbol regex, side check (BUY/SELL), quantity/price range checks
4. bot/logging_config.py - Logs to logs/bot.log in format: YYYY-MM-DD HH:MM:SS | LEVEL | Message
5. cli.py - User-facing terminal engine parsing arguments: --symbol, --side, --order-type, --quantity, --price, --stop-price

${fileContext ? `The user is currently inspecting the file "${fileContext.name}" which starts with:
\`\`\`
${fileContext.content.slice(0, 500)}...
\`\`\`` : ""}

Provide advice, code extensions, or explain concepts precisely. Keep the tone friendly, objective, helpful, and highly technical. Use Markdown formatting. Always refer directly to the user's specific request.`;
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let lastError = null;
      let response = null;
      for (const selectedModel of modelsToTry) {
        const maxRetries = 2;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`[Gemini API] Querying model: "${selectedModel}" (Attempt ${attempt}/${maxRetries})...`);
            response = await ai.models.generateContent({
              model: selectedModel,
              contents: message,
              config: {
                systemInstruction,
                temperature: 0.7
              }
            });
            break;
          } catch (err) {
            lastError = err;
            console.warn(`[Gemini API] Error using "${selectedModel}" (Attempt ${attempt}/${maxRetries}):`, err.message || err);
            if (attempt < maxRetries) {
              const backoffMs = attempt * 800;
              console.log(`[Gemini API] Backing off ${backoffMs}ms...`);
              await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }
          }
        }
        if (response) {
          break;
        }
        console.warn(`[Gemini API] Model "${selectedModel}" failed all retries. Proceeding to fallback model if available.`);
      }
      if (!response) {
        throw lastError || new Error("All configured models failed to generate content.");
      }
      res.json({ text: response.text });
    } catch (err) {
      console.error("Error invoking Gemini:", err);
      res.status(500).json({ error: "Failed to query AI helper. " + (err.message || "Upstream service is currently under heavy load. Please try again in a few moments.") });
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: (/* @__PURE__ */ new Date()).toISOString() });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted as Express middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production build files from /dist.");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
================================================================`);
    console.log(`\u26A1  Dashboard Server successfully started and listening!`);
    console.log(`\u{1F4E1}  Active Ports: 3000 (Local Dev & Container Interface)`);
    console.log(`
\u{1F449}  LOCAL ENVIRONMENT (Windows, macOS, Linux):`);
    console.log(`    Open your browser to: \x1B[36mhttp://localhost:${PORT}\x1B[0m  or  \x1B[36mhttp://127.0.0.1:${PORT}\x1B[0m`);
    console.log(`
\u{1F449}  AI Studio Sandbox / Cloud Environment:`);
    console.log(`    Listening on address: http://0.0.0.0:${PORT}`);
    console.log(`================================================================
`);
  });
}
startServer().catch((err) => {
  console.error("Error during backend startup sequence:", err);
});
