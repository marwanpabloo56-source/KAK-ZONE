import fs from 'fs';
import path from 'path';
import { chromium } from '/usr/local/share/bun-global/node_modules/playwright-core/index.mjs';

const SHEET1 = 'public/assets/aistudio/WhatsApp_Image_2026-11-25_at_12.56.07_AM_ab941334.jpeg';
const SHEET2 = 'public/assets/aistudio/WhatsApp_Image_2026-11-25_at_12.56.07_AM__1__5838837a.jpeg';
const OUT_DIR = 'public/assets/menu';

// Calibrated directly from cyan 50px coordinate grids (dbg_s1_r1l, dbg_s1_old, dbg_s1_r2, dbg_s1_row3, dbg_s2_bowls)
const BURGERS = [
  // Row 1
  {
    file: 'burger_old_school.webp',
    rect: [1342, 26, 244, 150],
    cupPoly: [[1356, 94], [1422, 92], [1420, 172], [1370, 172]],
    friesZones: [[1354, 34, 68, 58]],
    healZones: [[1396, 28, 180, 68]],
    wipeZones: [],
    bunDome: [1491, 94, 62, 30],
    captionCutY: 173,
  },
  {
    file: 'burger_smoke_house.webp',
    rect: [1100, 34, 242, 166],
    cupPoly: [[1112, 102], [1180, 100], [1178, 194], [1128, 194]],
    friesZones: [[1112, 54, 64, 48]],
    healZones: [[1165, 52, 172, 78]],
    wipeZones: [[1100, 34, 62, 54], [1100, 34, 18, 76]],
    bunDome: [1254, 118, 62, 30],
    captionCutY: 196,
  },
  {
    file: 'burger_fire_house.webp',
    rect: [782, 34, 254, 174],
    cupPoly: [[796, 106], [866, 102], [864, 198], [814, 198]],
    friesZones: [[794, 58, 66, 46]],
    healZones: [[856, 44, 172, 88]],
    wipeZones: [[782, 34, 254, 54], [858, 66, 24, 42]],
    bunDome: [945, 136, 62, 34],
    captionCutY: 204,
  },
  {
    file: 'burger_chicken_kak.webp',
    rect: [524, 42, 234, 172],
    cupPoly: [[536, 122], [602, 118], [602, 202], [552, 202]],
    friesZones: [[534, 76, 68, 44]],
    healZones: [[556, 56, 172, 86]],
    wipeZones: [[524, 42, 106, 42], [690, 42, 68, 54]],
    bunDome: [660, 140, 64, 31],
    captionCutY: 208,
  },
  {
    file: 'burger_chicken_kak_turkey.webp',
    rect: [268, 46, 228, 168],
    cupPoly: [[278, 126], [344, 122], [344, 204], [296, 204]],
    friesZones: [[276, 82, 66, 44]],
    healZones: [[276, 58, 212, 86]],
    cupHealZones: [[276, 130, 70, 24]],
    wipeZones: [[462, 46, 34, 56]],
    bunDome: [404, 142, 62, 28],
    captionCutY: 209,
  },
  {
    file: 'burger_mozzarella_chicken_kak.webp',
    rect: [8, 8, 234, 166],
    cupPoly: [[18, 82], [90, 78], [90, 164], [38, 164]],
    friesZones: [[16, 40, 72, 42]],
    healZones: [[12, 8, 224, 74]],
    wipeZones: [],
    bunDome: [148, 82, 64, 28],
    captionCutY: 169,
  },

  // Row 2
  {
    file: 'burger_secret_smash.webp',
    rect: [1362, 304, 230, 154],
    cupPoly: [[1374, 374], [1442, 370], [1440, 452], [1392, 452]],
    friesZones: [[1372, 328, 68, 44]],
    healZones: [[1408, 304, 180, 78]],
    wipeZones: [],
    bunDome: [1501, 382, 61, 29],
  },
  {
    file: 'burger_caramel_night.webp',
    rect: [1102, 304, 250, 166],
    cupPoly: [[1112, 376], [1182, 372], [1180, 458], [1134, 458]],
    friesZones: [[1112, 326, 70, 48]],
    healZones: [[1154, 304, 186, 80]],
    darkHealZones: [[1278, 412, 74, 52]],
    wipeZones: [[1314, 410, 38, 56]],
    bunDome: [1246, 384, 60, 29],
    captionCutY: 465,
  },
  {
    file: 'burger_onion_strike.webp',
    rect: [782, 298, 276, 190],
    cupPoly: [[794, 388], [866, 384], [864, 478], [814, 478]],
    friesZones: [[794, 332, 72, 52]],
    healZones: [[840, 298, 200, 88]],
    darkHealZones: [[992, 422, 66, 60]],
    wipeZones: [[1022, 418, 36, 66]],
    bunDome: [947, 388, 61, 30],
    captionCutY: 482,
  },
  {
    file: 'burger_big_chicken_kak.webp',
    rect: [524, 304, 252, 188],
    cupPoly: [[536, 396], [608, 392], [606, 480], [552, 480]],
    friesZones: [[534, 336, 74, 56]],
    healZones: [[544, 304, 216, 92]],
    wipeZones: [],
    bunDome: [678, 394, 61, 29],
    captionCutY: 486,
  },
  {
    file: 'burger_chicken_sweet_chili.webp',
    rect: [272, 302, 240, 168],
    cupPoly: [[280, 382], [350, 378], [348, 460], [300, 460]],
    friesZones: [[280, 336, 70, 44]],
    healZones: [[272, 302, 222, 82]],
    darkHealZones: [[438, 402, 74, 60]],
    wipeZones: [[468, 402, 44, 64]],
    bunDome: [408, 388, 62, 29],
    captionCutY: 465,
  },
  {
    file: 'burger_mozzarella_sweet_chili.webp',
    rect: [10, 300, 250, 156],
    cupPoly: [[22, 372], [92, 368], [90, 450], [40, 450]],
    friesZones: [[18, 328, 70, 42]],
    healZones: [[12, 300, 238, 76]],
    darkHealZones: [[190, 400, 70, 52]],
    wipeZones: [[222, 398, 38, 56]],
    bunDome: [154, 380, 62, 28],
    captionCutY: 451,
  },

  // Row 3 (exact bun & crown from dbg_s1_row3.png)
  {
    file: 'burger_kak_turbo_plus.webp',
    rect: [1284, 566, 304, 214],
    cupPoly: [[1302, 672], [1392, 666], [1390, 774], [1328, 774]],
    friesZones: [[1304, 622, 84, 48]],
    healZones: [[1296, 566, 256, 98]],
    wipeZones: [],
    bunDome: [1490, 656, 65, 32],
    topCrown: [1500, 614, 32, 14],
    captionCutY: 777,
  },
  {
    file: 'burger_chicken_creamy_mushroom.webp',
    rect: [984, 584, 282, 214],
    cupPoly: [[998, 684], [1072, 680], [1070, 784], [1018, 784]],
    friesZones: [[996, 634, 74, 48]],
    healZones: [[992, 584, 254, 96]],
    darkHealZones: [[1170, 628, 92, 60]],
    wipeZones: [[1170, 626, 92, 32]],
    bunDome: [1150, 684, 69, 34],
    captionCutY: 792,
  },
  {
    file: 'burger_kak_zone.webp',
    rect: [622, 562, 304, 232],
    cupPoly: [[634, 668], [730, 664], [728, 786], [662, 786]],
    friesZones: [[636, 622, 84, 46]],
    healZones: [[664, 562, 204, 96]],
    wipeZones: [[622, 562, 110, 68], [875, 562, 55, 52]],
    bunDome: [785, 646, 68, 32],
    topCrown: [792, 602, 32, 14],
    captionCutY: 786,
  },
  {
    file: 'burger_smash_mushroom.webp',
    rect: [330, 594, 270, 208],
    cupPoly: [[340, 690], [412, 686], [410, 790], [360, 790]],
    friesZones: [[340, 638, 72, 50]],
    healZones: [[330, 594, 186, 86]],
    darkHealZones: [[496, 628, 102, 60]],
    wipeZones: [[504, 620, 96, 36]],
    bunDome: [494, 688, 68, 36],
    captionCutY: 797,
  },
  {
    file: 'burger_kak_volt_plus.webp',
    rect: [6, 562, 302, 224],
    cupPoly: [[18, 674], [110, 668], [108, 782], [46, 782]],
    friesZones: [[20, 618, 84, 54]],
    healZones: [[20, 562, 270, 98]],
    wipeZones: [],
    bunDome: [194, 658, 66, 33],
    topCrown: [204, 614, 34, 14],
    captionCutY: 783,
  },
];

// Wide studio-framed elliptical vignette for Wings dishes:
const WINGS_STUDIO = [
  {
    file: 'wings_bbq.webp',
    rect: [34, 912, 388, 212],
    bowlEllipse: [300, 1026, 98, 74],
    priceRect: [224, 1068, 106, 50],
    newZone: [334, 916, 88, 72],
  },
  {
    file: 'wings_cheese.webp',
    rect: [410, 912, 370, 212],
    bowlEllipse: [643, 1026, 98, 74],
    priceRect: [580, 1068, 104, 50],
    newZone: [712, 916, 68, 72],
  },
  {
    file: 'wings_sweet_chili.webp',
    rect: [788, 912, 386, 212],
    bowlEllipse: [1038, 1026, 98, 74],
    priceRect: [974, 1068, 104, 50],
    newZone: [1110, 916, 64, 72],
  },
  {
    file: 'wings_creamy_ranch.webp',
    rect: [1180, 912, 398, 212],
    bowlEllipse: [1450, 1026, 98, 74],
    priceRect: [1386, 1068, 104, 50],
    newZone: [1504, 914, 74, 74],
  },
];

// Exact bowl geometry from dbg_s2_bowls.png (prices start at y=972, lcy=941, ery=55)
const BOWLS_SHEET2 = [
  {
    file: 'sides_onion_rings.webp',
    rect: [16, 864, 200, 152],
    bowlEllipse: [116, 941, 89, 55],
    priceRect: [82, 972, 64, 42],
    priceDilate: 5,
    healZones: [[16, 864, 198, 56]],
    darkHealZones: [[144, 870, 68, 50]],
    maxDist: 1.00,
  },
  {
    file: 'sides_mozzarella_sticks.webp',
    rect: [234, 864, 200, 152],
    bowlEllipse: [334, 941, 89, 55],
    priceRect: [302, 972, 64, 42],
    priceDilate: 5,
    healZones: [[234, 864, 198, 56]],
    darkHealZones: [[364, 870, 68, 50]],
    maxDist: 1.00,
  },
  {
    file: 'fries_cheddar_ranch.webp',
    rect: [484, 868, 200, 148],
    bowlEllipse: [584, 941, 89, 55],
    priceRect: [550, 972, 64, 42],
    priceDilate: 5,
    healZones: [[484, 868, 120, 32]],
    maxDist: 1.00,
  },
  {
    file: 'fries_turkey_strips.webp',
    rect: [740, 856, 200, 160],
    bowlEllipse: [840, 941, 89, 55],
    priceRect: [806, 972, 64, 42],
    priceDilate: 5,
    healZones: [[740, 856, 134, 42]],
    maxDist: 1.24,
  },
  {
    file: 'fries_smash.webp',
    rect: [998, 864, 200, 152],
    bowlEllipse: [1098, 941, 89, 55],
    priceRect: [1064, 972, 64, 42],
    priceDilate: 5,
    healZones: [[998, 864, 198, 50]],
    darkHealZones: [[1128, 872, 68, 46]],
    maxDist: 1.00,
  },
  {
    file: 'fries_classic.webp',
    rect: [1248, 868, 200, 148],
    bowlEllipse: [1348, 941, 89, 55],
    priceRect: [1314, 972, 64, 42],
    priceDilate: 5,
    healZones: [[1248, 868, 120, 32]],
    maxDist: 1.00,
  },
];

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const img1Src = 'data:image/jpeg;base64,' + fs.readFileSync(SHEET1).toString('base64');
  const img2Src = 'data:image/jpeg;base64,' + fs.readFileSync(SHEET2).toString('base64');

  const results = await page.evaluate(async ({ img1Src, img2Src, BURGERS, WINGS_STUDIO, BOWLS_SHEET2 }) => {
    function loadImg(src) {
      return new Promise((res) => {
        const i = new Image(); i.onload = () => res(i); i.src = src;
      });
    }
    const [s1, s2] = await Promise.all([loadImg(img1Src), loadImg(img2Src)]);
    function getSheetCanvas(img) {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      return { c, ctx };
    }
    const S1 = getSheetCanvas(s1);
    const S2 = getSheetCanvas(s2);

    function pointInPoly(x, y, poly) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi) {
          inside = !inside;
        }
      }
      return inside;
    }

    function isPosterRed(r, g, b) {
      const mx = Math.max(g, b);
      return (
        (r > 110 && (r - mx) > 64 && g < 74 && b < 74 && Math.abs(g - b) < 38) ||
        (r > 52 && (r - mx) > 34 && g < 30 && b < 30)
      );
    }

    function isWhiteGlyph(r, g, b) {
      const mn = Math.min(r, g, b);
      const mx = Math.max(r, g, b);
      return mn > 162 && (mx - mn) < 52;
    }

    function isBlackStroke(r, g, b) {
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      return mx < 85 && (mx - mn) < 32;
    }

    function isMatteInk(r, g, b) {
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      return mx < 46 && (mx - mn) < 16;
    }

    function keepLargestComponentOnly(isBg, rw, rh) {
      const visited = new Uint8Array(rw * rh);
      let bestComp = null;
      for (let i = 0; i < rw * rh; i++) {
        if (!isBg[i] && !visited[i]) {
          const comp = [];
          const cq = [i];
          visited[i] = 1;
          let head = 0;
          while (head < cq.length) {
            const u = cq[head++];
            comp.push(u);
            const ux = u % rw, uy = (u / rw) | 0;
            for (const [nx, ny] of [[ux+1,uy],[ux-1,uy],[ux,uy+1],[ux,uy-1]]) {
              if (nx >= 0 && nx < rw && ny >= 0 && ny < rh) {
                const ni = ny * rw + nx;
                if (!isBg[ni] && !visited[ni]) {
                  visited[ni] = 1;
                  cq.push(ni);
                }
              }
            }
          }
          if (!bestComp || comp.length > bestComp.length) {
            if (bestComp) {
              for (const old of bestComp) isBg[old] = 1;
            }
            bestComp = comp;
          } else {
            for (const cur of comp) isBg[cur] = 1;
          }
        }
      }
    }

    function trimAndCenter(srcCanvas, targetW = 560, targetH = 420, pad = 18) {
      const w = srcCanvas.width, h = srcCanvas.height;
      const ctx = srcCanvas.getContext('2d');
      const d = ctx.getImageData(0, 0, w, h).data;
      let minX = w, minY = h, maxX = -1, maxY = -1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (d[(y * w + x) * 4 + 3] > 20) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < minX) return srcCanvas.toDataURL('image/webp', 0.94).split(',')[1];
      const cw = maxX - minX + 1, ch = maxY - minY + 1;
      const out = document.createElement('canvas');
      out.width = targetW; out.height = targetH;
      const octx = out.getContext('2d');
      const scale = Math.min((targetW - pad * 2) / cw, (targetH - pad * 2) / ch);
      const dw = cw * scale, dh = ch * scale;
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = 'high';
      octx.drawImage(srcCanvas, minX, minY, cw, ch, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
      return out.toDataURL('image/webp', 0.94).split(',')[1];
    }

    function cleanBowlBottomPrice(d, orig, rw, rh, lcx, lpx, lpy, pw, ph, dilateR = 7) {
      const whitePrice = new Uint8Array(rw * rh);
      for (let y = lpy; y < Math.min(rh, lpy + ph); y++) {
        for (let x = lpx; x < Math.min(rw, lpx + pw); x++) {
          const i = (y * rw + x) * 4;
          if (isWhiteGlyph(orig[i], orig[i + 1], orig[i + 2])) {
            whitePrice[y * rw + x] = 1;
          }
        }
      }

      const isBlackBowlWall = (sx, sy) => {
        if (sx < 0 || sx >= rw || sy < 0 || sy >= rh) return false;
        const i = (sy * rw + sx) * 4;
        if (whitePrice[sy * rw + sx]) return false;
        if (isPosterRed(orig[i], orig[i + 1], orig[i + 2])) return false;
        const mx = Math.max(orig[i], orig[i + 1], orig[i + 2]);
        const mn = Math.min(orig[i], orig[i + 1], orig[i + 2]);
        return mx < 92 && (mx - mn) < 24;
      };

      const dR2 = dilateR * dilateR + 1;
      const safeR = Math.max(3, dilateR - 2);
      for (let y = lpy; y < Math.min(rh, lpy + ph); y++) {
        for (let x = lpx; x < Math.min(rw, lpx + pw); x++) {
          let nearDigit = false;
          for (let dy = -dilateR; dy <= dilateR && !nearDigit; dy++) {
            for (let dx = -dilateR; dx <= dilateR; dx++) {
              if (dx * dx + dy * dy > dR2) continue;
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < rw && ny >= 0 && ny < rh && whitePrice[ny * rw + nx]) {
                nearDigit = true; break;
              }
            }
          }
          if (!nearDigit) continue;
          let leftIdx = -1, rightIdx = -1;
          for (let step = safeR; step <= 68; step++) {
            if (leftIdx < 0 && x - step >= 0 && isBlackBowlWall(x - step, y)) {
              let safe = true;
              for (let oy = -safeR; oy <= safeR && safe; oy++) {
                for (let ox = -safeR; ox <= safeR; ox++) {
                  const cx2 = x - step + ox, cy2 = y + oy;
                  if (cx2 >= 0 && cx2 < rw && cy2 >= 0 && cy2 < rh && whitePrice[cy2 * rw + cx2]) safe = false;
                }
              }
              if (safe) leftIdx = y * rw + (x - step);
            }
            if (rightIdx < 0 && x + step < rw && isBlackBowlWall(x + step, y)) {
              let safe = true;
              for (let oy = -safeR; oy <= safeR && safe; oy++) {
                for (let ox = -safeR; ox <= safeR; ox++) {
                  const cx2 = x + step + ox, cy2 = y + oy;
                  if (cx2 >= 0 && cx2 < rw && cy2 >= 0 && cy2 < rh && whitePrice[cy2 * rw + cx2]) safe = false;
                }
              }
              if (safe) rightIdx = y * rw + (x + step);
            }
            if (leftIdx >= 0 && rightIdx >= 0) break;
          }
          const dp = (y * rw + x) * 4;
          // Sample ribbed vertical bowl texture 12px above to preserve real plastic bowl flutes!
          let vertIdx = -1;
          const vy = y - 14;
          if (vy >= 0 && isBlackBowlWall(x, vy)) {
            let vSafe = true;
            for (let oy = -safeR; oy <= safeR && vSafe; oy++) {
              for (let ox = -safeR; ox <= safeR; ox++) {
                const cx2 = x + ox, cy2 = vy + oy;
                if (cx2 >= 0 && cx2 < rw && cy2 >= 0 && cy2 < rh && whitePrice[cy2 * rw + cx2]) vSafe = false;
              }
            }
            if (vSafe) vertIdx = vy * rw + x;
          }
          if (leftIdx >= 0 && rightIdx >= 0) {
            const lx = leftIdx % rw, rx2 = rightIdx % rw;
            const t = (x - lx) / Math.max(1, rx2 - lx);
            const hr = orig[leftIdx * 4] * (1 - t) + orig[rightIdx * 4] * t;
            const hg = orig[leftIdx * 4 + 1] * (1 - t) + orig[rightIdx * 4 + 1] * t;
            const hb = orig[leftIdx * 4 + 2] * (1 - t) + orig[rightIdx * 4 + 2] * t;
            if (vertIdx >= 0) {
              d[dp] = Math.round(hr * 0.45 + orig[vertIdx * 4] * 0.55);
              d[dp + 1] = Math.round(hg * 0.45 + orig[vertIdx * 4 + 1] * 0.55);
              d[dp + 2] = Math.round(hb * 0.45 + orig[vertIdx * 4 + 2] * 0.55);
            } else {
              d[dp] = Math.round(hr);
              d[dp + 1] = Math.round(hg);
              d[dp + 2] = Math.round(hb);
            }
          } else {
            const single = vertIdx >= 0 ? vertIdx : (leftIdx >= 0 ? leftIdx : rightIdx);
            if (single >= 0) {
              d[dp] = orig[single * 4];
              d[dp + 1] = orig[single * 4 + 1];
              d[dp + 2] = orig[single * 4 + 2];
            } else {
              d[dp] = 28; d[dp + 1] = 27; d[dp + 2] = 26;
            }
          }
        }
      }
    }

    function extractBurger(cfg) {
      const [rx, ry, rw, rh] = cfg.rect;
      const c = document.createElement('canvas');
      c.width = rw; c.height = rh;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(S1.c, rx, ry, rw, rh, 0, 0, rw, rh);
      const imgData = ctx.getImageData(0, 0, rw, rh);
      const d = imgData.data;
      const orig = new Uint8ClampedArray(d);

      const localCup = cfg.cupPoly.map(([px, py]) => [px - rx, py - ry]);
      const localFries = (cfg.friesZones || []).map(([fx, fy, fw, fh]) => [fx - rx, fy - ry, fw, fh]);
      const localHeal = cfg.healZones.map(([hx, hy, hw, hh]) => [hx - rx, hy - ry, hw, hh]);
      const localCupHeal = (cfg.cupHealZones || []).map(([hx, hy, hw, hh]) => [hx - rx, hy - ry, hw, hh]);
      const localDarkHeal = (cfg.darkHealZones || []).map(([tx, ty, tw, th]) => [tx - rx, ty - ry, tw, th]);
      const localWipes = (cfg.wipeZones || []).map(([wx, wy, ww, wh]) => [wx - rx, wy - ry, ww, wh]);
      const [bx, by, brx, bry] = cfg.bunDome.map((v, idx) => idx === 0 ? v - rx : idx === 1 ? v - ry : v);
      const localCrown = cfg.topCrown ? cfg.topCrown.map((v, idx) => idx === 0 ? v - rx : idx === 1 ? v - ry : v) : null;
      const capCutY = cfg.captionCutY ? cfg.captionCutY - ry : rh + 10;

      const inRects = (x, y, list) =>
        list.some(([x0, y0, w0, h0]) => x >= x0 && x < x0 + w0 && y >= y0 && y < y0 + h0);

      const inUpperBun = (x, y) => {
        if (y > by + 10) return false;
        if (y >= by - 2) return Math.abs(x - bx) <= brx;
        const nx = Math.abs(x - bx) / brx;
        const ny = Math.abs(y - by) / bry;
        return (Math.pow(nx, 2.7) + Math.pow(ny, 2.7)) <= 1.00;
      };

      const inTopCrown = (x, y) => {
        if (!localCrown) return false;
        const [cx, cy, crx, cry] = localCrown;
        if (y > by - 6) return false;
        const nx = (x - cx) / crx;
        const ny = (y - cy) / cry;
        return (nx * nx + ny * ny) <= 1.00;
      };

      const isWarmGolden = (r, g, b) => r > b + 32 && r > 102 && g > 74;

      // Step 1: Detect white glyphs in healZones + "New!" dark/ink glyphs in darkHealZones
      const glyphSeed = new Uint8Array(rw * rh);
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const i = (y * rw + x) * 4;
          if (inRects(x, y, localHeal) && isWhiteGlyph(d[i], d[i + 1], d[i + 2])) {
            glyphSeed[y * rw + x] = 1;
          }
          if (inRects(x, y, localDarkHeal) && (isBlackStroke(d[i], d[i + 1], d[i + 2]) || isPosterRed(d[i], d[i + 1], d[i + 2]))) {
            glyphSeed[y * rw + x] = 2;
          }
        }
      }

      const textOcc = new Uint8Array(rw * rh);
      const safeBuffer = new Uint8Array(rw * rh);
      const darkOcc = new Uint8Array(rw * rh);
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x;
          const p = idx * 4;
          if (glyphSeed[idx] === 1) { textOcc[idx] = 1; safeBuffer[idx] = 1; continue; }
          if (glyphSeed[idx] === 2) { textOcc[idx] = 1; safeBuffer[idx] = 1; darkOcc[idx] = 1; continue; }
          const warm = isWarmGolden(orig[p], orig[p + 1], orig[p + 2]);
          if (inRects(x, y, localHeal)) {
            let minD2 = 999;
            for (let dy = -9; dy <= 9; dy++) {
              for (let dx = -9; dx <= 9; dx++) {
                const d2 = dx * dx + dy * dy;
                if (d2 > 81 || d2 >= minD2) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < rw && ny >= 0 && ny < rh && glyphSeed[ny * rw + nx] === 1) {
                  minD2 = d2;
                }
              }
            }
            if (minD2 <= 81) safeBuffer[idx] = 1;
            // Dilate text mask across black strokes & anti-aliased fringes ONLY — NEVER bite clean golden fries/bun!
            if (minD2 <= 49 && (!warm || minD2 <= 4)) textOcc[idx] = 1;
          }
          if (inRects(x, y, localDarkHeal)) {
            let minD2 = 999;
            for (let dy = -3; dy <= 3; dy++) {
              for (let dx = -3; dx <= 3; dx++) {
                const d2 = dx * dx + dy * dy;
                if (d2 > 9 || d2 >= minD2) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < rw && ny >= 0 && ny < rh && glyphSeed[ny * rw + nx] === 2) {
                  minD2 = d2;
                }
              }
            }
            if (minD2 <= 9) safeBuffer[idx] = 1;
            if (minD2 <= 5 && (!warm || minD2 <= 2)) { textOcc[idx] = 1; darkOcc[idx] = 1; }
          }
        }
      }

      // Step 2: Flood-fill outer poster red + wipeZones + text outside bun/crown/fries
      const isBg = new Uint8Array(rw * rh);
      const q = new Int32Array(rw * rh);
      let qh = 0, qt = 0;
      const tryPush = (x, y) => {
        if (x < 0 || x >= rw || y < 0 || y >= rh) return;
        const idx = y * rw + x;
        if (isBg[idx]) return;
        const wipe = inRects(x, y, localWipes);
        if (wipe) { isBg[idx] = 1; q[qt++] = idx; return; }
        if (pointInPoly(x, y, localCup)) return;
        const p = idx * 4;
        const red = isPosterRed(d[p], d[p + 1], d[p + 2]);
        const insideSolidFood = inUpperBun(x, y) || inTopCrown(x, y) || inRects(x, y, localFries);
        const txt = textOcc[idx] === 1 && !darkOcc[idx] && !insideSolidFood;
        const capNoise = y >= capCutY && (isWhiteGlyph(d[p], d[p + 1], d[p + 2]) || isBlackStroke(d[p], d[p + 1], d[p + 2]) || red);
        if (red || txt || capNoise) {
          isBg[idx] = 1;
          q[qt++] = idx;
        }
      };

      for (let x = 0; x < rw; x++) { tryPush(x, 0); tryPush(x, rh - 1); }
      for (let y = 0; y < rh; y++) { tryPush(0, y); tryPush(rw - 1, y); }
      while (qh < qt) {
        const cur = q[qh++];
        const cx = cur % rw, cy = (cur / rw) | 0;
        tryPush(cx + 1, cy); tryPush(cx - 1, cy);
        tryPush(cx, cy + 1); tryPush(cx, cy - 1);
      }

      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x;
          if (inRects(x, y, localWipes) || y >= capCutY) isBg[idx] = 1;
          if (textOcc[idx] && !darkOcc[idx] && !inUpperBun(x, y) && !inTopCrown(x, y) && !inRects(x, y, localFries)) {
            if (y < by + 4) isBg[idx] = 1;
          }
        }
      }

      const isGoldenDonor = (x, y) => {
        if (x < 0 || x >= rw || y < 0 || y >= rh) return false;
        const idx = y * rw + x;
        if (safeBuffer[idx] || textOcc[idx]) return false;
        const p = idx * 4;
        if (isPosterRed(orig[p], orig[p+1], orig[p+2])) return false;
        if (orig[p] > orig[p+1] + 55 && orig[p+1] < 95) return false;
        if (isBlackStroke(orig[p], orig[p+1], orig[p+2])) return false;
        return orig[p] > orig[p+2] + 22 && orig[p] > 92;
      };

      // Step 3A: Mirror & blend bun pixels inside inUpperBun smoothly along curvature
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x;
          if (!inUpperBun(x, y) || (!textOcc[idx] && !isPosterRed(orig[idx*4], orig[idx*4+1], orig[idx*4+2]))) continue;
          const mx = Math.round(2 * bx - x);
          let found = false;
          for (let dy = 0; dy <= 3 && !found; dy = dy <= 0 ? (dy === 0 ? 1 : -dy + 1) : -dy) {
            for (let dx = -3; dx <= 3; dx++) {
              const sx = mx + dx, sy = y + dy;
              if (inUpperBun(sx, sy) && isGoldenDonor(sx, sy)) {
                isBg[idx] = 0;
                const sp = (sy * rw + sx) * 4;
                d[idx * 4] = orig[sp];
                d[idx * 4 + 1] = orig[sp + 1];
                d[idx * 4 + 2] = orig[sp + 2];
                found = true;
                break;
              }
            }
          }
          if (!found) {
            let sr = 0, sg = 0, sb = 0, sw = 0;
            for (let dy = -4; dy <= 28; dy += 2) {
              for (let dx = -56; dx <= 56; dx += 3) {
                const sx = x + dx, sy = y + dy;
                if (inUpperBun(sx, sy) && isGoldenDonor(sx, sy)) {
                  const w = 1 / (Math.abs(dx) * 0.25 + (dy >= 0 ? dy * 1.1 : -dy * 1.8) + 1);
                  const sp = (sy * rw + sx) * 4;
                  sr += orig[sp] * w; sg += orig[sp + 1] * w; sb += orig[sp + 2] * w; sw += w;
                }
              }
            }
            if (sw > 0.015) {
              isBg[idx] = 0;
              const normH = Math.max(0, Math.min(1, (by - y) / Math.max(1, bry)));
              const shade = 1 - normH * 0.06;
              d[idx * 4] = Math.round((sr / sw) * shade);
              d[idx * 4 + 1] = Math.round((sg / sw) * shade);
              d[idx * 4 + 2] = Math.round((sb / sw) * shade);
            } else if (textOcc[idx] || isPosterRed(orig[idx*4], orig[idx*4+1], orig[idx*4+2])) {
              isBg[idx] = 1;
            }
          }
        }
      }

      // Step 3B: Heal topCrown (onion rings) & trim any stray non-golden shadow/horn around crown
      if (localCrown) {
        const [cx] = localCrown;
        for (let y = 0; y < rh; y++) {
          for (let x = 0; x < rw; x++) {
            const idx = y * rw + x;
            if (!inTopCrown(x, y)) continue;
            const p = idx * 4;
            if (!textOcc[idx] && isBlackStroke(orig[p], orig[p + 1], orig[p + 2])) {
              isBg[idx] = 1; continue;
            }
            if (!textOcc[idx]) continue;
            const mx = Math.round(2 * cx - x);
            let healed = false;
            for (let dy = -3; dy <= 6 && !healed; dy++) {
              for (let dx = -4; dx <= 4; dx++) {
                const sx = mx + dx, sy = y + dy;
                if (inTopCrown(sx, sy) && isGoldenDonor(sx, sy)) {
                  isBg[idx] = 0;
                  const sp = (sy * rw + sx) * 4;
                  d[idx * 4] = orig[sp]; d[idx * 4 + 1] = orig[sp + 1]; d[idx * 4 + 2] = orig[sp + 2];
                  healed = true; break;
                }
              }
            }
            if (!healed) isBg[idx] = 1;
          }
        }
      }

      // Step 3C: Heal fries overlapping text glyphs using vertical or down-left crispy fry donor (never carve big scallop!)
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x;
          if (!textOcc[idx] || darkOcc[idx] || inUpperBun(x, y) || inTopCrown(x, y)) continue;
          if (!inRects(x, y, localFries)) continue;
          let bestIdx = -1, bestDist = 999;
          let countDown = 0;
          for (let dy = 6; dy <= 22; dy += 2) {
            if (isGoldenDonor(x, y + dy)) countDown++;
          }
          if (countDown >= 4) {
            for (let dy = 5; dy <= 24; dy++) {
              for (let dx = -4; dx <= 4; dx++) {
                const sx = x + dx, sy = y + dy;
                if (inRects(sx, sy, localFries) && isGoldenDonor(sx, sy)) {
                  const dist = dy + Math.abs(dx) * 2;
                  if (dist < bestDist) { bestDist = dist; bestIdx = sy * rw + sx; }
                }
              }
              if (bestIdx >= 0) break;
            }
          } else {
            // Check down-left crispy fry fan (preserves rounded edge of crinkle fries where text grazed tip)
            let countDL = 0;
            for (let k = 4; k <= 16; k += 2) {
              if (isGoldenDonor(x - k, y + Math.round(k * 0.4))) countDL++;
            }
            if (countDL >= 4) {
              for (let k = 4; k <= 22 && bestIdx < 0; k++) {
                const sx = x - k, sy = y + Math.round(k * 0.35);
                if (inRects(sx, sy, localFries) && isGoldenDonor(sx, sy)) bestIdx = sy * rw + sx;
              }
            }
          }
          if (bestIdx >= 0) {
            isBg[idx] = 0;
            d[idx * 4] = orig[bestIdx * 4];
            d[idx * 4 + 1] = orig[bestIdx * 4 + 1];
            d[idx * 4 + 2] = orig[bestIdx * 4 + 2];
          } else {
            isBg[idx] = 1;
          }
        }
      }

      // Step 3D: Heal "New!" dark/red ink overlapping burger outside bun
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x;
          if (!darkOcc[idx] || isBg[idx] || inUpperBun(x, y)) continue;
          let found = false;
          for (let dx = 4; dx <= 44 && !found; dx++) {
            for (let dy = 0; dy <= 3; dy = dy <= 0 ? (dy === 0 ? 1 : -dy + 1) : -dy) {
              const sx = x - dx, sy = y + dy;
              if (sx < 0 || sy < 0 || sy >= rh) continue;
              const si = sy * rw + sx;
              const sp = si * 4;
              if (!isBg[si] && !darkOcc[si] && !safeBuffer[si] && !isBlackStroke(orig[sp], orig[sp+1], orig[sp+2]) && !isPosterRed(orig[sp], orig[sp+1], orig[sp+2])) {
                d[idx * 4] = orig[sp]; d[idx * 4 + 1] = orig[sp + 1]; d[idx * 4 + 2] = orig[sp + 2];
                found = true; break;
              }
            }
          }
          if (!found) isBg[idx] = 1;
        }
      }

      // Step 3E: Heal upper cup label text (chicken_kak_turkey "تركي") with red cup texture
      if (localCupHeal.length > 0) {
        for (let y = 0; y < rh; y++) {
          for (let x = 0; x < rw; x++) {
            const idx = y * rw + x;
            if (!inRects(x, y, localCupHeal) || !pointInPoly(x, y, localCup)) continue;
            const p = idx * 4;
            if (isWhiteGlyph(orig[p], orig[p+1], orig[p+2]) || isBlackStroke(orig[p], orig[p+1], orig[p+2])) {
              let copied = false;
              for (let dy = 6; dy <= 20 && !copied; dy++) {
                const sy = y + dy;
                if (sy < rh && pointInPoly(x, sy, localCup)) {
                  const sp = (sy * rw + x) * 4;
                  if (orig[sp] > 120 && orig[sp + 1] < 70 && orig[sp + 2] < 70) {
                    d[p] = orig[sp]; d[p + 1] = orig[sp + 1]; d[p + 2] = orig[sp + 2];
                    copied = true;
                  }
                }
              }
              if (!copied) { d[p] = 205; d[p + 1] = 20; d[p + 2] = 24; }
            }
          }
        }
      }

      keepLargestComponentOnly(isBg, rw, rh);

      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x, p = idx * 4;
          if (isBg[idx]) { d[p + 3] = 0; continue; }
          let bgN = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || nx >= rw || ny < 0 || ny >= rh || isBg[ny * rw + nx]) bgN++;
            }
          }
          if (bgN > 0) {
            if (!pointInPoly(x, y, localCup) && d[p] > d[p + 1] + 45 && d[p] > d[p + 2] + 45) {
              d[p] = Math.round((d[p] + d[p + 1]) * 0.5);
            }
            d[p + 3] = Math.round(255 * Math.max(0.25, 1 - bgN / 9.2));
          } else {
            d[p + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return { file: cfg.file, b64: trimAndCenter(c, 560, 420, 18) };
    }

    function extractWingsStudio(cfg) {
      const [rx, ry, rw, rh] = cfg.rect;
      const [ecx, ecy, erx, ery] = cfg.bowlEllipse;
      const lcx = ecx - rx, lcy = ecy - ry;
      const [px, py, pw, ph] = cfg.priceRect;
      const [nx0, ny0, nw0, nh0] = cfg.newZone;

      const c = document.createElement('canvas');
      c.width = rw; c.height = rh;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(S1.c, rx, ry, rw, rh, 0, 0, rw, rh);
      const imgData = ctx.getImageData(0, 0, rw, rh);
      const d = imgData.data;
      const orig = new Uint8ClampedArray(d);

      // 1) Remove bottom "99" completely with 8px dilation + full [224..330] horizontal bounds
      cleanBowlBottomPrice(d, orig, rw, rh, lcx, px - rx, py - ry, pw, ph, 8);

      // 2) Replace floating dark "NEW!" both slightly outside & on outer top-right black rim cleanly
      const lx0 = nx0 - rx, ly0 = ny0 - ry;
      for (let y = Math.max(0, ly0); y < Math.min(rh, ly0 + nh0); y++) {
        for (let x = Math.max(0, lx0); x < Math.min(rw, lx0 + nw0); x++) {
          const bDist = Math.hypot((x - lcx) / erx, (y - lcy) / ery);
          if (bDist <= 0.90) continue; // protect wings inside bowl 100%!
          const idx = (y * rw + x) * 4;
          if (bDist <= 1.03 && isBlackStroke(orig[idx], orig[idx + 1], orig[idx + 2])) {
            d[idx] = 28; d[idx + 1] = 26; d[idx + 2] = 25;
            continue;
          }
          if (bDist > 1.03 && !isPosterRed(orig[idx], orig[idx + 1], orig[idx + 2])) {
            let best = -1;
            for (let step = 4; step <= 48 && best < 0; step += 2) {
              for (const [cx2, cy2] of [[x + step, y], [x, y - step], [x - step, y]]) {
                if (cx2 >= 0 && cx2 < rw && cy2 >= 0 && cy2 < rh) {
                  const inNew = cx2 >= lx0 && cx2 < lx0 + nw0 && cy2 >= ly0 && cy2 < ly0 + nh0;
                  if (!inNew) {
                    const sx = (cy2 * rw + cx2) * 4;
                    if (isPosterRed(orig[sx], orig[sx + 1], orig[sx + 2])) { best = sx; break; }
                  }
                }
              }
            }
            if (best >= 0) {
              d[idx] = orig[best]; d[idx + 1] = orig[best + 1]; d[idx + 2] = orig[best + 2];
            } else {
              d[idx] = 162; d[idx + 1] = 10; d[idx + 2] = 14;
            }
          }
        }
      }

      // 3) Elliptical dark studio vignette + smoother earlier feathered edge
      const ecxR = rw * 0.50;
      const ecyR = rh * 0.50;
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const nx = (x - ecxR) / (rw * 0.49);
          const ny = (y - ecyR) / (rh * 0.48);
          const rNorm = Math.hypot(nx, ny);
          const p = (y * rw + x) * 4;
          const dishDist = Math.hypot((x - lcx) / (erx + 4), (y - lcy) / (ery + 4));
          if (dishDist > 1.00 && isPosterRed(d[p], d[p + 1], d[p + 2])) {
            const vig = Math.min(1, Math.max(0, (rNorm - 0.52) / 0.42));
            d[p] = Math.round(d[p] * (1 - 0.80 * vig));
            d[p + 1] = Math.round(d[p + 1] * (1 - 0.80 * vig));
            d[p + 2] = Math.round(d[p + 2] * (1 - 0.80 * vig));
          }
          if (rNorm >= 0.98) {
            d[p + 3] = 0;
          } else if (rNorm > 0.78) {
            d[p + 3] = Math.round(255 * Math.pow(1 - (rNorm - 0.78) / 0.20, 1.5));
          } else {
            d[p + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return { file: cfg.file, b64: trimAndCenter(c, 520, 390, 12) };
    }

    function extractBowl(sheetObj, cfg) {
      const [rx, ry, rw, rh] = cfg.rect;
      const [ecx, ecy, erx, ery] = cfg.bowlEllipse;
      const lcx = ecx - rx, lcy = ecy - ry;
      const [px, py, pw, ph] = cfg.priceRect;
      const lpx = px - rx, lpy = py - ry;
      const maxDist = cfg.maxDist || 1.00;

      const c = document.createElement('canvas');
      c.width = rw; c.height = rh;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(sheetObj.c, rx, ry, rw, rh, 0, 0, rw, rh);
      const imgData = ctx.getImageData(0, 0, rw, rh);
      const d = imgData.data;
      const orig = new Uint8ClampedArray(d);

      const bowlDist = (x, y) => {
        const dx = (x - lcx) / erx;
        const dy = (y - lcy) / ery;
        return dx * dx + dy * dy;
      };

      const localHeal = (cfg.healZones || []).map(([wx, wy, ww, wh]) => [wx - rx, wy - ry, ww, wh]);
      const localDarkHeal = (cfg.darkHealZones || []).map(([wx, wy, ww, wh]) => [wx - rx, wy - ry, ww, wh]);
      const inRects = (x, y, list) =>
        list.some(([x0, y0, w0, h0]) => x >= x0 && x < x0 + w0 && y >= y0 && y < y0 + h0);

      // Step 1: Clean lower-wall price numeral strictly on bottom bowl wall
      cleanBowlBottomPrice(d, orig, rw, rh, lcx, lpx, lpy, pw, ph, cfg.priceDilate || 5);

      // Step 2: Detect bright glyphs inside healZones + matte ink "New!" in darkHealZones
      const whiteSeed = new Uint8Array(rw * rh);
      const darkSeed = new Uint8Array(rw * rh);
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const i = (y * rw + x) * 4;
          if (inRects(x, y, localHeal) && isWhiteGlyph(d[i], d[i + 1], d[i + 2])) {
            whiteSeed[y * rw + x] = 1;
          }
          if (inRects(x, y, localDarkHeal) && (isMatteInk(d[i], d[i + 1], d[i + 2]) || isBlackStroke(d[i], d[i + 1], d[i + 2]))) {
            darkSeed[y * rw + x] = 1;
          }
        }
      }
      const textOcc = new Uint8Array(rw * rh);
      const darkOcc = new Uint8Array(rw * rh);
      const safeBuffer = new Uint8Array(rw * rh);
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x;
          const p = idx * 4;
          if (whiteSeed[idx]) { textOcc[idx] = 1; safeBuffer[idx] = 1; continue; }
          if (darkSeed[idx]) { darkOcc[idx] = 1; safeBuffer[idx] = 1; continue; }
          const warm = orig[p] > orig[p + 2] + 35 && orig[p] > 105;
          if (inRects(x, y, localHeal)) {
            let minD2 = 999;
            for (let dy = -7; dy <= 7; dy++) {
              for (let dx = -7; dx <= 7; dx++) {
                const d2 = dx * dx + dy * dy;
                if (d2 > 49 || d2 >= minD2) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < rw && ny >= 0 && ny < rh && whiteSeed[ny * rw + nx]) minD2 = d2;
              }
            }
            if (minD2 <= 49) safeBuffer[idx] = 1;
            if (minD2 <= 36 && !warm) textOcc[idx] = 1;
          }
          if (inRects(x, y, localDarkHeal)) {
            let minD2 = 999;
            for (let dy = -3; dy <= 3; dy++) {
              for (let dx = -3; dx <= 3; dx++) {
                const d2 = dx * dx + dy * dy;
                if (d2 > 9 || d2 >= minD2) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < rw && ny >= 0 && ny < rh && darkSeed[ny * rw + nx]) minD2 = d2;
              }
            }
            if (minD2 <= 9) safeBuffer[idx] = 1;
            if (minD2 <= 5 && !warm) { darkOcc[idx] = 1; }
          }
        }
      }

      // Geometric silhouette + poster red flood outside inner upper rim:
      const isBg = new Uint8Array(rw * rh);
      const q = new Int32Array(rw * rh);
      let qh = 0, qt = 0;
      const tryPush = (x, y) => {
        if (x < 0 || x >= rw || y < 0 || y >= rh) return;
        const idx = y * rw + x;
        if (isBg[idx]) return;
        const p = idx * 4;
        const bDist = bowlDist(x, y);
        const warmFood = orig[p] > orig[p + 2] + 35 && orig[p] > 105;
        if (bDist > maxDist) {
          if (warmFood && maxDist > 1.05 && bDist <= maxDist + 0.08) return;
          isBg[idx] = 1; q[qt++] = idx; return;
        }
        const red = isPosterRed(d[p], d[p + 1], d[p + 2]);
        const inUpperPoster = y < lcy - ery * 0.25 && bDist > 0.65;
        if (red && (bDist > 0.85 || inUpperPoster)) {
          isBg[idx] = 1; q[qt++] = idx;
        }
      };

      for (let x = 0; x < rw; x++) { tryPush(x, 0); tryPush(x, rh - 1); }
      for (let y = 0; y < rh; y++) { tryPush(0, y); tryPush(rw - 1, y); }
      while (qh < qt) {
        const cur = q[qh++];
        const cx = cur % rw, cy = (cur / rw) | 0;
        tryPush(cx + 1, cy); tryPush(cx - 1, cy);
        tryPush(cx, cy + 1); tryPush(cx, cy - 1);
      }

      // Step 3A: Inside upper bowl wall & rim (bDist >= 0.28 && y < lcy), heal ALL textOcc + darkOcc seamlessly
      const isCleanRim = (x, y) => {
        if (x < 0 || x >= rw || y < 0 || y >= rh) return false;
        const idx = y * rw + x;
        if (isBg[idx] || safeBuffer[idx] || textOcc[idx] || darkOcc[idx]) return false;
        const p = idx * 4;
        if (isPosterRed(orig[p], orig[p + 1], orig[p + 2])) return false;
        return Math.max(orig[p], orig[p + 1], orig[p + 2]) < 110 && Math.abs(orig[p] - orig[p + 2]) < 26;
      };

      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x;
          if (isBg[idx]) continue;
          if (!(textOcc[idx] || darkOcc[idx])) continue;
          const bDist = bowlDist(x, y);
          const p = idx * 4;
          const isWarmFood = orig[p] > orig[p + 2] + 35 && orig[p] > 105;
          if (isWarmFood && !darkOcc[idx] && !whiteSeed[idx]) continue;
          if (bDist >= 0.28 || y < lcy - 6) {
            const mx = Math.round(2 * lcx - x);
            let done = false;
            for (let dy = 0; dy <= 2 && !done; dy = dy <= 0 ? (dy === 0 ? 1 : -dy + 1) : -dy) {
              for (let dx = -2; dx <= 2; dx++) {
                const sx = mx + dx, sy = y + dy;
                if (isCleanRim(sx, sy)) {
                  const sp = (sy * rw + sx) * 4;
                  d[p] = orig[sp]; d[p + 1] = orig[sp + 1]; d[p + 2] = orig[sp + 2];
                  done = true; break;
                }
              }
            }
            if (!done) {
              const rCur = Math.min(0.95, Math.max(0.55, Math.sqrt(bDist)));
              for (let a = 0; a < 64 && !done; a++) {
                const ang = ((a * 360) / 64) * (Math.PI / 180);
                const sx = Math.round(lcx + erx * rCur * Math.cos(ang));
                const sy = Math.round(lcy + ery * rCur * Math.sin(ang));
                if (sy <= lcy + 14 && isCleanRim(sx, sy)) {
                  const sp = (sy * rw + sx) * 4;
                  d[p] = orig[sp]; d[p + 1] = orig[sp + 1]; d[p + 2] = orig[sp + 2];
                  done = true; break;
                }
              }
            }
            if (!done) {
              d[p] = 28; d[p + 1] = 27; d[p + 2] = 26;
            }
          }
        }
      }

      keepLargestComponentOnly(isBg, rw, rh);

      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x, p = idx * 4;
          if (isBg[idx]) { d[p + 3] = 0; continue; }
          let bgN = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || nx >= rw || ny < 0 || ny >= rh || isBg[ny * rw + nx]) bgN++;
            }
          }
          if (bgN > 0) {
            if (d[p] > d[p + 1] + 45 && d[p] > d[p + 2] + 45 && bowlDist(x, y) > 0.78) {
              d[p] = Math.round((d[p] + d[p + 1]) * 0.5);
            }
            d[p + 3] = Math.round(255 * Math.max(0.22, 1 - bgN / 9.2));
          } else {
            d[p + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return { file: cfg.file, b64: trimAndCenter(c, 520, 390, 20) };
    }

    function extractMealsBanner() {
      const rx = 1054, ry = 0, rw = 310, rh = 236;
      const c = document.createElement('canvas');
      c.width = rw; c.height = rh;
      const ctx = c.getContext('2d', { willReadFrequently: true });

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(1182 - rx, 2 - ry);
      ctx.lineTo(1284 - rx, 2 - ry);
      ctx.quadraticCurveTo(1306 - rx, 40 - ry, 1300 - rx, 82 - ry);
      ctx.quadraticCurveTo(1328 - rx, 102 - ry, 1326 - rx, 140 - ry);
      ctx.lineTo(1308 - rx, 174 - ry);
      ctx.lineTo(1284 - rx, 218 - ry);
      ctx.quadraticCurveTo(1254 - rx, 234 - ry, 1218 - rx, 232 - ry);
      ctx.quadraticCurveTo(1196 - rx, 224 - ry, 1188 - rx, 208 - ry);
      ctx.quadraticCurveTo(1174 - rx, 204 - ry, 1148 - rx, 182 - ry);
      ctx.lineTo(1078 - rx, 144 - ry);
      ctx.quadraticCurveTo(1070 - rx, 136 - ry, 1078 - rx, 114 - ry);
      ctx.lineTo(1100 - rx, 62 - ry);
      ctx.lineTo(1176 - rx, 32 - ry);
      ctx.lineTo(1182 - rx, 2 - ry);
      ctx.closePath();
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();

      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(S2.c, rx, ry, rw, rh, 0, 0, rw, rh);
      ctx.globalCompositeOperation = 'source-over';

      const imgData = ctx.getImageData(0, 0, rw, rh);
      const d = imgData.data;
      const isBg = new Uint8Array(rw * rh);
      const q = [];
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          if (d[(y * rw + x) * 4 + 3] < 50) { isBg[y * rw + x] = 1; q.push(y * rw + x); }
        }
      }
      const ketchup = [1188 - rx, 168 - ry, 42];
      const inKetchup = (x, y) => Math.hypot(x - ketchup[0], y - ketchup[1]) < ketchup[2];

      let qh = 0;
      while (qh < q.length) {
        const cur = q[qh++];
        const cx = cur % rw, cy = (cur / rw) | 0;
        for (const [nx, ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]) {
          if (nx < 0 || nx >= rw || ny < 0 || ny >= rh) continue;
          const ni = ny * rw + nx;
          if (isBg[ni] || inKetchup(nx, ny)) continue;
          const p = ni * 4;
          if (isPosterRed(d[p], d[p + 1], d[p + 2])) {
            isBg[ni] = 1; d[p + 3] = 0; q.push(ni);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return { file: 'banner_meals.webp', b64: trimAndCenter(c, 580, 435, 18) };
    }

    function extractPastaBanner() {
      const rx = 1148, ry = 532, rw = 218, rh = 218;
      const c = document.createElement('canvas');
      c.width = rw; c.height = rh;
      const ctx = c.getContext('2d', { willReadFrequently: true });

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(1218 - rx, 548 - ry);
      ctx.quadraticCurveTo(1285 - rx, 546 - ry, 1344 - rx, 548 - ry);
      ctx.quadraticCurveTo(1357 - rx, 549 - ry, 1355 - rx, 563 - ry);
      ctx.lineTo(1338 - rx, 622 - ry);
      ctx.lineTo(1312 - rx, 730 - ry);
      ctx.quadraticCurveTo(1306 - rx, 742 - ry, 1280 - rx, 741 - ry);
      ctx.lineTo(1188 - rx, 738 - ry);
      ctx.quadraticCurveTo(1174 - rx, 736 - ry, 1170 - rx, 720 - ry);
      ctx.lineTo(1160 - rx, 682 - ry);
      ctx.lineTo(1208 - rx, 558 - ry);
      ctx.quadraticCurveTo(1212 - rx, 549 - ry, 1218 - rx, 548 - ry);
      ctx.closePath();
      ctx.filter = 'blur(1.1px)';
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.restore();

      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(S2.c, rx, ry, rw, rh, 0, 0, rw, rh);
      ctx.globalCompositeOperation = 'source-over';

      const imgData = ctx.getImageData(0, 0, rw, rh);
      const d = imgData.data;
      const orig = new Uint8ClampedArray(d);
      const isBg = new Uint8Array(rw * rh);
      const q = [];
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          if (d[(y * rw + x) * 4 + 3] < 35) { isBg[y * rw + x] = 1; q.push(y * rw + x); }
        }
      }
      let qh = 0;
      while (qh < q.length) {
        const cur = q[qh++];
        const cx = cur % rw, cy = (cur / rw) | 0;
        for (const [nx, ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]) {
          if (nx < 0 || nx >= rw || ny < 0 || ny >= rh) continue;
          const ni = ny * rw + nx;
          if (isBg[ni]) continue;
          const p = ni * 4;
          if (isPosterRed(d[p], d[p + 1], d[p + 2])) {
            isBg[ni] = 1; d[p + 3] = 0; q.push(ni);
          }
        }
      }
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const idx = y * rw + x, p = idx * 4;
          if (!isBg[idx] && x > (1330 - rx) && y > (570 - ry) && y < (650 - ry)) {
            if (isWhiteGlyph(orig[p], orig[p+1], orig[p+2]) || isBlackStroke(orig[p], orig[p+1], orig[p+2])) {
              const sx = Math.max(0, x - 9);
              const sp = (y * rw + sx) * 4;
              if (!isBg[y * rw + sx]) {
                d[p] = orig[sp]; d[p+1] = orig[sp+1]; d[p+2] = orig[sp+2];
              }
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return { file: 'banner_pasta.webp', b64: trimAndCenter(c, 520, 420, 18) };
    }

    const out = [];
    for (const b of BURGERS) out.push(extractBurger(b));
    for (const w of WINGS_STUDIO) out.push(extractWingsStudio(w));
    for (const f of BOWLS_SHEET2) out.push(extractBowl(S2, f));
    out.push(extractMealsBanner());
    out.push(extractPastaBanner());
    return out;
  }, { img1Src, img2Src, BURGERS, WINGS_STUDIO, BOWLS_SHEET2 });

  for (const r of results) {
    fs.writeFileSync(path.join(OUT_DIR, r.file), Buffer.from(r.b64, 'base64'));
  }

  await browser.close();
  console.log('Re-extracted', results.length, 'clean assets (pass 10)!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
