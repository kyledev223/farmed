// Copies the site's pixel art into promo/public and extracts the music track.
// Run with `npm run assets` whenever ../public or ../assets change.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const site = resolve(root, "..");
const pub = join(root, "public");
mkdirSync(pub, { recursive: true });

const copy = (rel) => {
  const from = join(site, "public", rel);
  if (!existsSync(from)) {
    console.warn(`skip (missing): public/${rel}`);
    return;
  }
  cpSync(from, join(pub, rel), { recursive: true });
  console.log(`copied public/${rel}`);
};

[
  "logo-icon.png",
  "logo-wordmark.png",
  "hero.png",
  "bg-soil.png",
  "icons",
  "farms",
].forEach(copy);
// Optional extras: only copied if they exist in the site's public folder.
["sfx", "screens"].forEach(
  (d) => existsSync(join(site, "public", d)) && copy(d),
);

// Music: the first .mp4/.m4a/.mp3/.wav in ../assets. Audio stream only, so the
// 500MB screen recording never ends up in the Remotion bundle.
const assetsDir = join(site, "assets");
const track = existsSync(assetsDir)
  ? readdirSync(assetsDir).find((f) => /\.(mp4|m4a|mp3|wav)$/i.test(f))
  : undefined;
if (!track) {
  console.warn(
    "no music found in ../assets — keeping existing public/music.m4a",
  );
} else {
  const win = process.platform === "win32";
  // `npx` needs a shell on Windows, so quote args there (the recording name has spaces).
  const args = [
    "remotion",
    "ffmpeg",
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    join(assetsDir, track),
    "-vn",
    "-c:a",
    "aac",
    "-b:a",
    "256k",
    "-f",
    "mp4",
    join(pub, "music.m4a"),
  ];
  const res = spawnSync("npx", win ? args.map((a) => `"${a}"`) : args, {
    cwd: root,
    stdio: "inherit",
    shell: win,
  });
  if (res.status !== 0) process.exit(res.status ?? 1);
  console.log(`extracted music from assets/${track} -> public/music.m4a`);
}
