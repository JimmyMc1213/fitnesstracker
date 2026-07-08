import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "assets");
const SRC = "/Users/jimmymccarthy/NewYouAI Content/Instagram Promo Posts";
const PHONE = path.join(__dirname, "../../tiktok/assets/phone.png");

fs.mkdirSync(ASSETS, { recursive: true });

const MAP = {
  "ref-01.jpg": "Pintrest Reference Guys/012905f778e2a6abe3d9d2c65e67affb.jpg",
  "ref-02.jpg": "Pintrest Reference Guys/14172ecfebadd7718e7150f1ae8e8635.jpg",
  "ref-03.jpg": "Pintrest Reference Guys/261f13d856bd23bd7e8051bc50311b90.jpg",
  "ref-04.jpg": "Pintrest Reference Guys/3a045e5657c47da1ae1bb719555f9606.jpg",
  "ref-05.jpg": "Pintrest Reference Guys/c3dd11930761351dac69397346d7880b.jpg",
  "ref-06.jpg": "Pintrest Reference Guys/d0578e06d20e77c95a22f7fb0f840792.jpg",
  "ref-07.jpg": "Pintrest Reference Guys/f58b90f6c2d0c2e9cdd4bd5122b342aa.jpg",
  "ref-08.png": "Pintrest Reference Guys/recreation-01.png",
  "gym-01.jpg": "Pintrest Guy Working Out/6d48fb538a5d43c111d0ec23358ae82e.jpg",
  "gym-02.jpg": "Pintrest Guy Working Out/dc1fbfd0210b6ca22d70bfc031d291e5.jpg",
  "gym-03.jpg": "Pintrest Guy Working Out/f1b5883caff589941f420db635305ca2.jpg",
  "food-01.jpg": "Pintrest Healthy Food/be818e90ba1c75a44f511ed5c0f0e462.jpg",
  "food-02.jpg": "Pintrest Healthy Food/2f68a1a7ea4fc771550f20b1a79825da.jpg",
  "food-03.jpg": "Pintrest Healthy Food/783612c230f21bd52a2a459bde3ee822.jpg",
  "sauna-01.jpg": "Pintrest Guy Sauna/de8fe3b5daa2a8a4588157328c478c16.jpg",
  "sauna-02.jpg": "Pintrest Guy Sauna/645a4441b53d70f7a228c6e16392353b.jpg",
  "walk-01.jpg": "Pintrest Men Walking/1059bee51723a239d07a65bbda26ae7c.jpg",
  "walk-02.jpg": "Pintrest Men Walking/2d55e63fc224007bac66318f9155e8b9.jpg",
  "phone.png": null,
};

for (const [dest, rel] of Object.entries(MAP)) {
  const out = path.join(ASSETS, dest);
  if (rel === null) {
    fs.copyFileSync(PHONE, out);
  } else {
    fs.copyFileSync(path.join(SRC, rel), out);
  }
}

console.log(`copied ${Object.keys(MAP).length} assets to ${ASSETS}`);
