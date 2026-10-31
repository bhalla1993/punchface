export const COUNTRIES = [
  ["AR", "Argentina"],
  ["AU", "Australia"],
  ["BD", "Bangladesh"],
  ["BR", "Brazil"],
  ["CA", "Canada"],
  ["CN", "China"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["IN", "India"],
  ["ID", "Indonesia"],
  ["IT", "Italy"],
  ["JP", "Japan"],
  ["MX", "Mexico"],
  ["NG", "Nigeria"],
  ["PK", "Pakistan"],
  ["PH", "Philippines"],
  ["RU", "Russia"],
  ["SA", "Saudi Arabia"],
  ["ZA", "South Africa"],
  ["KR", "South Korea"],
  ["TR", "Türkiye"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["XX", "Rest of world"],
];

const NAMES = new Map(COUNTRIES);

export function countryName(code) {
  return NAMES.get(code) || "Rest of world";
}

export function countryCode(headerValue) {
  const code = String(headerValue || "").toUpperCase();
  return NAMES.has(code) && code !== "XX" ? code : "XX";
}

export function weekId(date = new Date()) {
  const day = date.getUTCDay() || 7;
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

export function dayId(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
