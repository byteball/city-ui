import fs from "node:fs/promises";
import { chromium } from "playwright";

const ASSETS_FOLDER = "search_bot_assets";
const URL = "http://localhost:8080"; // your local dev server

const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

(async () => {
  console.error("Starting bot view...");

  // Launch Chromium in headless mode
  const browser = await chromium.launch({ headless: false });

  // Create new browser context with bot-like settings
  const context = await browser.newContext({
    userAgent: GOOGLEBOT_UA,
    viewport: { width: 1366, height: 768 },
    javaScriptEnabled: true, // set false to see how it looks without JS
  });

  const page = await context.newPage();

  await fs.mkdir(`${ASSETS_FOLDER}/render`, { recursive: true });
  
  // Go to your page and wait until network is idle
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${ASSETS_FOLDER}/main-page.png`, fullPage: true });
  const mainRender = await page.content();
  await fs.writeFile(`${ASSETS_FOLDER}/render/main.html`, mainRender, "utf8");

  await page.goto(URL + `?house=1`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${ASSETS_FOLDER}/house-1.png`, fullPage: true });
  const houseRender = await page.content();
  await fs.writeFile(`${ASSETS_FOLDER}/render/house-1.html`, houseRender, "utf8");

  await page.goto(URL + `/market`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${ASSETS_FOLDER}/market.png`, fullPage: true });
  const marketRender = await page.content();
  await fs.writeFile(`${ASSETS_FOLDER}/render/market.html`, marketRender, "utf8");

  await page.goto(URL + `/governance`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${ASSETS_FOLDER}/governance.png`, fullPage: true });
  const governanceRender = await page.content();
  await fs.writeFile(`${ASSETS_FOLDER}/render/governance.html`, governanceRender, "utf8");

  await page.goto(URL + `/leaderboard`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${ASSETS_FOLDER}/leaderboard.png`, fullPage: true });
  const leaderboardRender = await page.content();
  await fs.writeFile(`${ASSETS_FOLDER}/render/leaderboard.html`, leaderboardRender, "utf8");

  await page.goto(URL + `/faq`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${ASSETS_FOLDER}/faq.png`, fullPage: true });
  const faqRender = await page.content();
  await fs.writeFile(`${ASSETS_FOLDER}/render/faq.html`, faqRender, "utf8");

  console.log("Saved assets");

  await browser.close();
})();