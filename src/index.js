import { countryCode } from "./countries.js";

export { Board } from "./board.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/config") {
      return json({ turnstileSiteKey: env.TURNSTILE_SITE_KEY || "" });
    }
    if (url.pathname === "/api/board") {
      return json(await callBoard(env, request, { count: 0 }));
    }
    if (url.pathname === "/api/punch" && request.method === "POST") {
      if (!sameOrigin(request, url)) {
        return json({ error: "bad origin" }, 403);
      }
      const payload = await request.json().catch(() => ({}));
      if (!(await turnstileOk(env, request, payload.token))) {
        return json({ error: "check failed" }, 403);
      }
      return json(await callBoard(env, request, payload));
    }
    if (url.pathname.startsWith("/api/")) {
      return json({ error: "not found" }, 404);
    }
    if (!env.ASSETS) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },

  async scheduled(_event, env, ctx) {
    const stub = env.BOARD.get(env.BOARD.idFromName("global"));
    ctx.waitUntil(stub.fetch("https://board/board", {
      method: "POST",
      body: JSON.stringify({ faceId: env.FACE_ID || "placeholder-dog", country: "XX", count: 0, cap: 1, ip: "cron" }),
    }));
  },
};

async function callBoard(env, request, payload) {
  const url = new URL(request.url);
  const override = env.ALLOW_COUNTRY_OVERRIDE === "1"
    ? (url.searchParams.get("country") || request.headers.get("X-Country"))
    : "";
  const country = countryCode(override || request.headers.get("CF-IPCountry"));
  const stub = env.BOARD.get(env.BOARD.idFromName("global"));
  const response = await stub.fetch("https://board/punch", {
    method: "POST",
    body: JSON.stringify({
      country,
      count: payload.count || 0,
      cap: env.DAILY_CAP || "500",
      faceId: env.FACE_ID || "placeholder-dog",
      ip: request.headers.get("CF-Connecting-IP") || "local",
    }),
  });
  return response.json();
}

async function turnstileOk(env, request, token) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET);
  body.set("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const data = await response.json().catch(() => ({}));
  return data.success === true;
}

function sameOrigin(request, url) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  return origin === url.origin;
}

function json(data, status = 200) {
  return Response.json(data, { status });
}
