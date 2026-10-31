import { DurableObject } from "cloudflare:workers";
import { COUNTRIES, weekId, dayId } from "./countries.js";

const ORDER = new Map(COUNTRIES.map(([code], index) => [code, index]));

export class Board extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
      CREATE TABLE IF NOT EXISTS scores (
        country TEXT PRIMARY KEY,
        weekly INTEGER NOT NULL DEFAULT 0,
        alltime INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS allowance (
        ip TEXT PRIMARY KEY,
        day TEXT NOT NULL,
        used INTEGER NOT NULL
      );
    `);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const body = request.method === "POST" ? await request.json() : {};
    this.rollWeek(body.faceId || "placeholder-dog");
    if (url.pathname === "/punch") {
      return Response.json(this.addPunches(body));
    }
    return Response.json(this.snapshot(body.country || "XX", 0, false));
  }

  rollWeek(faceId) {
    const currentWeek = weekId();
    const storedWeek = this.meta("week");
    const storedFace = this.meta("face");
    if (storedWeek !== currentWeek || (storedFace && storedFace !== faceId)) {
      this.ctx.storage.sql.exec("UPDATE scores SET weekly = 0");
    }
    this.setMeta("week", currentWeek);
    this.setMeta("face", faceId);
    const today = dayId();
    this.ctx.storage.sql.exec("DELETE FROM allowance WHERE day != ?", today);
  }

  addPunches(body) {
    const country = body.country || "XX";
    const cap = Math.max(1, Number(body.cap) || 500);
    const asked = Math.max(0, Math.min(20, Math.floor(Number(body.count) || 0)));
    const ip = String(body.ip || "local");
    const today = dayId();
    const row = this.ctx.storage.sql.exec(
      "SELECT used FROM allowance WHERE ip = ? AND day = ?",
      ip,
      today,
    ).toArray()[0];
    const used = row ? Number(row.used) : 0;
    const accepted = Math.max(0, Math.min(asked, cap - used));
    if (accepted > 0) {
      this.ctx.storage.sql.exec(
        `INSERT INTO allowance (ip, day, used) VALUES (?, ?, ?)
         ON CONFLICT(ip) DO UPDATE SET day = excluded.day, used = excluded.used`,
        ip,
        today,
        used + accepted,
      );
      this.ctx.storage.sql.exec(
        `INSERT INTO scores (country, weekly, alltime) VALUES (?, ?, ?)
         ON CONFLICT(country) DO UPDATE SET
           weekly = weekly + excluded.weekly,
           alltime = alltime + excluded.alltime`,
        country,
        accepted,
        accepted,
      );
    }
    return this.snapshot(country, accepted, used + accepted >= cap);
  }

  snapshot(country, accepted, limited) {
    const rows = this.ctx.storage.sql.exec(
      "SELECT country, weekly, alltime FROM scores",
    ).toArray();
    const byCode = new Map(rows.map((row) => [row.country, row]));
    const ranked = (field) => COUNTRIES
      .map(([code, name]) => ({
        code,
        name,
        score: Number(byCode.get(code)?.[field] || 0),
      }))
      .sort((a, b) => b.score - a.score || ORDER.get(a.code) - ORDER.get(b.code));
    return {
      country,
      accepted,
      limited,
      weekly: ranked("weekly"),
      alltime: ranked("alltime"),
    };
  }

  meta(key) {
    const row = this.ctx.storage.sql.exec(
      "SELECT v FROM meta WHERE k = ?",
      key,
    ).toArray()[0];
    return row ? row.v : "";
  }

  setMeta(key, value) {
    this.ctx.storage.sql.exec(
      "INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v",
      key,
      value,
    );
  }
}
