import { chromium } from "playwright";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(__dirname, "build");
const OUT = path.join(__dirname, "out");
const W = 1080;
const H = 1920;

fs.mkdirSync(BUILD, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

/** @type {Array<{
 *   id: string;
 *   image: string;
 *   headline: string;
 *   subline?: string;
 *   badge?: string;
 *   top?: string;
 *   imagePosition?: string;
 * }>} */
const SLIDES = [
  {
    id: "01-field",
    image: "field.png",
    headline: "How to become the best version of yourself.",
    top: "24%",
  },
  {
    id: "02-gym",
    image: "gym.png",
    headline: "1. Lift Heavy",
    subline: "at least three times a week",
    top: "44%",
    imagePosition: "center top",
  },
  {
    id: "03-food",
    image: "food.png",
    headline: "2. Fuel Your Body",
    subline: "Eat clean 80 to 90% of the time",
    top: "44%",
  },
  {
    id: "04-phone",
    image: "phone.png",
    headline: "3. See your potential",
    badge: "\u201cNewYou AI\u201d app",
    top: "20%",
  },
  {
    id: "05-sauna",
    image: "sauna.png",
    headline: "4. Prioritize Recovery",
    subline: "Rest, Sauna, and Sleep",
    top: "44%",
  },
  {
    id: "06-street",
    image: "street.png",
    headline: "5. Get 10,000 steps a day",
    top: "44%",
  },
];

const TEXT_SHADOW = `
  -2px -2px 0 #000,
  2px -2px 0 #000,
  -2px 2px 0 #000,
  2px 2px 0 #000,
  0 0 6px rgba(0,0,0,0.85)
`;

function html(slide) {
  const subline = slide.subline
    ? `<div class="subline">${slide.subline}</div>`
    : "";
  const badge = slide.badge
    ? `<div class="badge">${slide.badge}</div>`
    : "";

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${W}px; height: ${H}px; }
  .stage {
    position: relative;
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  }
  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: ${slide.imagePosition ?? "center center"};
    display: block;
  }
  .copy {
    position: absolute;
    left: 50%;
    top: ${slide.top ?? "42%"};
    transform: translate(-50%, -50%);
    width: 88%;
    text-align: center;
    z-index: 2;
  }
  .headline {
    color: #fff;
    font-size: 58px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.01em;
    text-shadow: ${TEXT_SHADOW};
  }
  .subline {
    margin-top: 14px;
    color: #fff;
    font-size: 50px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.01em;
    text-shadow: ${TEXT_SHADOW};
  }
  .badge {
    position: absolute;
    right: 7%;
    bottom: 16%;
    color: #fff;
    font-size: 46px;
    font-weight: 700;
    line-height: 1.1;
    text-shadow: ${TEXT_SHADOW};
    z-index: 2;
    text-align: right;
  }
  </style></head><body>
  <div class="stage">
    <img class="bg" src="../assets/${slide.image}" alt="">
    <div class="copy">
      <div class="headline">${slide.headline}</div>
      ${subline}
    </div>
    ${badge}
  </div>
  </body></html>`;
}

const browser = await chromium.launch();
try {
  for (const slide of SLIDES) {
    const file = path.join(BUILD, `${slide.id}.html`);
    fs.writeFileSync(file, html(slide));
    const context = await browser.newContext({
      viewport: { width: W, height: H },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`file://${file}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const raw = path.join(OUT, `${slide.id}-2x.png`);
    const final = path.join(OUT, `${slide.id}-1080x1920.png`);
    await page.screenshot({ path: raw, clip: { x: 0, y: 0, width: W, height: H } });
    execSync(`sips -Z 1920 "${raw}" --out "${final}"`, { stdio: "ignore" });
    fs.rmSync(raw);
    console.log("rendered", final);
    await context.close();
  }
} finally {
  await browser.close();
}
