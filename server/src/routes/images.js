import express from "express";

const router = express.Router();

// Simple in-memory cache so repeat lookups for the same venue don't burn
// through the Google API's free daily quota (100 queries/day).
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

/**
 * GET /api/v1/images/venue?query=<venue name>
 *
 * Tries the Google Custom Search JSON API (Images) if GOOGLE_API_KEY and
 * GOOGLE_CX are configured in the environment. If they are not configured,
 * or the request fails for any reason (quota, network, bad key), this
 * returns { imageUrl: null } rather than an error — the client falls back
 * to the bundled hand-illustrated venue artwork automatically.
 *
 * To activate real photos:
 *   1. Create a Google Cloud project and enable the "Custom Search API".
 *   2. Get an API key: https://console.cloud.google.com/apis/credentials
 *   3. Create a Programmable Search Engine (set to search the whole web,
 *      with "Image search" turned on): https://programmablesearchengine.google.com/
 *   4. Copy its Search engine ID (cx) into GOOGLE_CX.
 *   5. Set GOOGLE_API_KEY and GOOGLE_CX in server/.env.
 * Free tier: 100 queries/day. Beyond that, Google bills per query.
 */
router.get("/venue", async (req, res) => {
  const query = (req.query.query || "").toString().trim();
  if (!query) return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", message: "query is required" });

  const cached = cache.get(query);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return res.json({ imageUrl: cached.imageUrl, source: cached.imageUrl ? "google" : "none", cached: true });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  if (!apiKey || !cx) {
    // Not configured — tell the client to use the illustrated fallback.
    return res.json({ imageUrl: null, source: "none", reason: "GOOGLE_API_KEY/GOOGLE_CX not configured" });
  }

  try {
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", cx);
    url.searchParams.set("q", query);
    url.searchParams.set("searchType", "image");
    url.searchParams.set("num", "1");
    url.searchParams.set("safe", "active");

    const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!resp.ok) throw new Error(`Google API responded ${resp.status}`);
    const data = await resp.json();
    const imageUrl = data.items?.[0]?.link || null;

    cache.set(query, { imageUrl, at: Date.now() });
    res.json({ imageUrl, source: imageUrl ? "google" : "none" });
  } catch (err) {
    // Never fail the request over an image lookup — just fall back.
    cache.set(query, { imageUrl: null, at: Date.now() });
    res.json({ imageUrl: null, source: "none", reason: err.message });
  }
});

export default router;
