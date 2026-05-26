#!/usr/bin/env node
/**
 * One-shot migration: upload every Unsplash fallback in lib/cms-images.ts to
 * Cloudinary, then rewrite cms-images.ts so the fallbacks point at Cloudinary.
 *
 * Idempotent: uses deterministic public_ids under `website/fallbacks/<key>`
 * with `overwrite: true`, so re-running just refreshes the assets.
 *
 *   node scripts/migrate-cms-fallbacks.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Load .env.local manually (Next loads it for the app, but plain node won't)
function loadEnv() {
  try {
    const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        let v = m[2];
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    }
  } catch {
    /* no .env.local — assume env is exported */
  }
}
loadEnv();

const required = ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing env var: ${k}`);
    process.exit(1);
  }
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Parse fallbacks straight out of cms-images.ts by re-implementing the import
// without a TS toolchain. We capture each `key: "..."` and `fallback: "..."`
// pair within the IMAGE_PAGES array.
const SRC_PATH = resolve(ROOT, "lib/cms-images.ts");
const src = readFileSync(SRC_PATH, "utf8");

// Crude but reliable: match { key: "...", label: "...", fallback: "..." } blocks
const slotRe = /\{\s*key:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*fallback:\s*\n?\s*"([^"]+)"/g;
const slots = [];
for (const m of src.matchAll(slotRe)) {
  slots.push({ key: m[1], label: m[2], fallback: m[3] });
}
if (slots.length === 0) {
  console.error("No slots parsed from cms-images.ts — bailing");
  process.exit(1);
}
console.log(`Found ${slots.length} slots to migrate`);

const results = [];
let i = 0;
for (const slot of slots) {
  i++;
  process.stdout.write(`[${i}/${slots.length}] ${slot.key} ... `);
  try {
    const r = await cloudinary.uploader.upload(slot.fallback, {
      public_id: `website/fallbacks/${slot.key}`,
      overwrite: true,
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto",
    });
    results.push({ key: slot.key, secure_url: r.secure_url });
    console.log("ok");
  } catch (err) {
    console.error(`FAILED: ${err.message ?? err}`);
    process.exit(1);
  }
}

// Rewrite cms-images.ts with new fallback URLs.
let newSrc = src;
for (const r of results) {
  // Replace the fallback URL for this key. Match the same shape we extracted.
  const re = new RegExp(
    `(\\{\\s*key:\\s*"${r.key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}",\\s*label:\\s*"[^"]+",\\s*fallback:\\s*\\n?\\s*)"[^"]+"`,
  );
  const replaced = newSrc.replace(re, `$1"${r.secure_url}"`);
  if (replaced === newSrc) {
    console.warn(`WARN: could not rewrite fallback for ${r.key}`);
  }
  newSrc = replaced;
}
writeFileSync(SRC_PATH, newSrc);
console.log(`\nRewrote ${SRC_PATH}`);
console.log("Done.");
