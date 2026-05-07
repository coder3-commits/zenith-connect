// Nigerian network prefix detection + recent recipients cache.
export type Network = "MTN" | "AIRTEL" | "GLO" | "9MOBILE";

const PREFIXES: Record<Network, string[]> = {
  MTN: ["0703", "0704", "0706", "0803", "0806", "0810", "0813", "0814", "0816", "0903", "0906", "0913", "0916", "0707", "0807"],
  AIRTEL: ["0701", "0708", "0802", "0808", "0812", "0901", "0902", "0904", "0907", "0912"],
  GLO: ["0705", "0805", "0807", "0811", "0815", "0905", "0915"],
  "9MOBILE": ["0809", "0817", "0818", "0908", "0909"],
};

export function detectNetwork(phone: string): Network | null {
  const p = phone.replace(/\D/g, "");
  if (p.length < 4) return null;
  const prefix = p.slice(0, 4);
  for (const [net, list] of Object.entries(PREFIXES)) {
    if (list.includes(prefix)) return net as Network;
  }
  return null;
}

export function isValidNgPhone(phone: string): boolean {
  return /^0[7-9][0-1]\d{8}$/.test(phone.replace(/\D/g, ""));
}

const RECENT_KEY = "zentrix.recent.recipients";
export type Recipient = { phone: string; network: Network; lastUsed: number };

export function getRecentRecipients(): Recipient[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRecipient(phone: string, network: Network) {
  if (typeof window === "undefined") return;
  const list = getRecentRecipients().filter((r) => r.phone !== phone);
  list.unshift({ phone, network, lastUsed: Date.now() });
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
}
