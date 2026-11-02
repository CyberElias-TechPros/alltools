/**
 * URL, domain, IPv4 and user-agent analysis — all of it offline.
 *
 * Nothing here performs a network request. Where a tool would normally need
 * one (DNS, WHOIS, status checks) the catalogue marks it as planned instead of
 * pretending, because a "live lookup" that silently runs against a cached list
 * is worse than no tool at all.
 */

/* ------------------------------------------------------------------ */
/* URL parsing                                                         */
/* ------------------------------------------------------------------ */

export interface UrlQueryParam {
  key: string;
  value: string;
}

export interface ParsedUrl {
  /** The string as typed. */
  raw: string;
  href: string;
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  /** hostname plus :port when a port is present. */
  host: string;
  pathname: string;
  query: UrlQueryParam[];
  search: string;
  hash: string;
  origin: string;
  /** True when no scheme was supplied and https:// was assumed. */
  assumedScheme: boolean;
  /** True for /path, ./path and ../path inputs. */
  relative: boolean;
}

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export function parseUrl(input: string): { parsed?: ParsedUrl; error?: string } {
  const raw = input.trim();
  if (!raw) return { error: "Enter a URL to analyse." };
  if (/\s/.test(raw)) return { error: "A URL cannot contain spaces — spaces must be encoded as %20 or +." };

  if (raw.startsWith("/") || raw.startsWith("./") || raw.startsWith("../")) {
    return {
      parsed: {
        raw,
        href: raw,
        protocol: "",
        username: "",
        password: "",
        hostname: "",
        port: "",
        host: "",
        pathname: raw,
        query: [],
        search: "",
        hash: "",
        origin: "",
        assumedScheme: false,
        relative: true,
      },
    };
  }

  let assumedScheme = false;
  let candidate = raw;
  if (!SCHEME.test(raw)) {
    candidate = `https://${raw.replace(/^\/+/, "")}`;
    assumedScheme = true;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { error: "That is not a URL the browser can parse." };
  }

  const query = [...url.searchParams.entries()].map(([key, value]) => ({ key, value }));

  return {
    parsed: {
      raw,
      href: url.href,
      protocol: url.protocol.replace(/:$/, ""),
      username: url.username,
      password: url.password,
      hostname: url.hostname,
      port: url.port,
      host: url.host,
      pathname: url.pathname,
      query,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      assumedScheme,
      relative: false,
    },
  };
}

export interface UrlCheck {
  valid: boolean;
  errors: string[];
  warnings: string[];
  parsed?: ParsedUrl;
}

/** Practical URL validation: parseable, sensibly structured, no obvious traps. */
export function validateUrl(input: string): UrlCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { parsed, error } = parseUrl(input);

  if (!parsed) return { valid: false, errors: [error ?? "Invalid URL"], warnings };

  if (parsed.relative) {
    warnings.push("This is a relative URL — it has no scheme or host, so it only resolves inside a page.");
    return { valid: true, errors, warnings, parsed };
  }

  if (parsed.assumedScheme) {
    warnings.push("No scheme was supplied, so https:// was assumed. Add it explicitly if the URL will be stored.");
  }
  if (!["http", "https"].includes(parsed.protocol)) {
    warnings.push(
      parsed.protocol === "mailto" || parsed.protocol === "tel"
        ? `${parsed.protocol}: links are valid but are not web addresses.`
        : `${parsed.protocol}: is a non-web scheme — check that this is intended.`,
    );
  }
  if (parsed.protocol === "http") {
    warnings.push("Plain http sends everything in clear text; prefer https.");
  }
  if (parsed.username || parsed.password) {
    errors.push("Credentials in a URL are deprecated and blocked by many browsers. Use an authorization header.");
  }
  if (parsed.hostname.length > 253) errors.push("The hostname is longer than the 253-character DNS limit.");
  if (parsed.hostname && !parsed.hostname.includes(".") && parsed.hostname !== "localhost") {
    warnings.push("The hostname has no dot — it is only meaningful on an internal network.");
  }
  if (input.length > 2000) warnings.push("The URL is very long; some servers and proxies truncate around 2,000 characters.");
  if (parsed.hash && parsed.hash.length > 1 && /\s/.test(parsed.hash)) {
    warnings.push("The fragment contains raw spaces; encode them.");
  }
  if (!parsed.pathname || parsed.pathname === "/") {
    warnings.push("No path is set, so the server's root document will be served.");
  }

  return { valid: errors.length === 0, errors, warnings, parsed };
}

/* ------------------------------------------------------------------ */
/* Domain analysis                                                     */
/* ------------------------------------------------------------------ */

const COMMON_TLDS = new Set([
  "com", "net", "org", "io", "co", "dev", "app", "ai", "edu", "gov", "mil", "info", "biz",
  "me", "xyz", "tech", "store", "online", "site", "blog", "shop", "design", "studio", "cloud",
  "uk", "de", "fr", "ng", "ke", "za", "ca", "au", "in", "jp", "cn", "br", "es", "it", "nl",
]);

export interface DomainAnalysis {
  hostname: string;
  unicode: string;
  labels: string[];
  tld: string;
  registeredName: string;
  subdomainCount: number;
  length: number;
  hyphenCount: number;
  digitCount: number;
  isIpv4: boolean;
  isLocalhost: boolean;
  isPunycode: boolean;
  tldLooksCommon: boolean;
  /** 0–100 heuristic, clearly labelled as heuristic in the UI. */
  brandScore: number;
  notes: string[];
}

export function analyseDomain(input: string): DomainAnalysis | { error: string } {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return { error: "Enter a domain such as example.com." };

  let hostname = trimmed
    .replace(/^[a-z]+:\/\//, "")
    .split("/")[0]
    .split("?")[0]
    .split("#")[0]
    .replace(/:\d+$/, "");

  if (!hostname) return { error: "That does not contain a domain." };

  // Keep the unicode spelling if one was supplied; URL() otherwise normalises
  // it to punycode, which is what DNS actually stores.
  const unicode = /[^\x00-\x7f]/.test(hostname) ? hostname : hostname;
  if (/[^\x00-\x7f]/.test(hostname)) {
    try {
      hostname = new URL(`https://${hostname}`).hostname;
    } catch {
      /* keep the raw value */
    }
  }

  const labels = hostname.split(".").filter(Boolean);
  const tld = labels.length > 1 ? labels[labels.length - 1] : "";
  const registeredName = labels.length > 1 ? labels[labels.length - 2] : labels[0] ?? "";
  const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  const notes: string[] = [];

  if (isIpv4) notes.push("This is an IP address, not a domain name — no DNS lookup is involved.");
  if (hostname === "localhost") notes.push("localhost always resolves to the machine you are using.");
  if (labels.some((label) => label.startsWith("xn--"))) {
    notes.push("At least one label is punycode, which means the real name contains non-ASCII characters. Check it visually — this is how homograph attacks hide.");
  }
  if (hostname.includes("--")) notes.push("Double hyphens outside an xn-- prefix are unusual and worth a second look.");
  if (labels.length > 3) notes.push("There are several subdomains; only the registered name is bought from a registrar.");
  if (tld && !COMMON_TLDS.has(tld)) notes.push(`“.${tld}” is not in the common-TLD list used here — it may be a country code or a new gTLD.`);
  if (registeredName.length > 20) notes.push("The registered name is long, which is harder to recall and to type on mobile.");
  if (/\d/.test(registeredName)) notes.push("Digits in a registered name are often used by typosquatters.");

  const hyphenCount = (registeredName.match(/-/g) ?? []).length;
  const digitCount = (registeredName.match(/\d/g) ?? []).length;
  if (hyphenCount >= 2) notes.push("Two or more hyphens make a name read like a spam domain.");

  let brandScore = 100;
  brandScore -= hyphenCount * 12;
  brandScore -= digitCount * 10;
  brandScore -= Math.max(0, registeredName.length - 12) * 2;
  brandScore -= labels.length > 3 ? 8 : 0;
  brandScore -= hostname.includes("xn--") ? 15 : 0;
  brandScore = Math.max(0, Math.min(100, brandScore));

  return {
    hostname,
    unicode,
    labels,
    tld,
    registeredName,
    subdomainCount: Math.max(0, labels.length - 2),
    length: hostname.length,
    hyphenCount,
    digitCount,
    isIpv4,
    isLocalhost: hostname === "localhost",
    isPunycode: labels.some((label) => label.startsWith("xn--")),
    tldLooksCommon: COMMON_TLDS.has(tld),
    brandScore,
    notes,
  };
}

/* ------------------------------------------------------------------ */
/* IPv4 and subnets                                                    */
/* ------------------------------------------------------------------ */

export function parseIpv4(input: string): number | null {
  const parts = input.trim().split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = value * 256 + octet;
  }
  return value;
}

export function ipv4ToString(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

export function ipv4ToBinary(value: number): string {
  return [24, 16, 8, 0]
    .map((shift) => ((value >>> shift) & 255).toString(2).padStart(8, "0"))
    .join(".");
}

export interface SubnetResult {
  ip: string;
  prefix: number;
  mask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalAddresses: number;
  usableHosts: number;
  hostBits: number;
  binary: { ip: string; mask: string; network: string; broadcast: string };
  kind: string;
  isPrivate: boolean;
  isLoopback: boolean;
  notes: string[];
}

function classifyIpv4(value: number): { kind: string; isPrivate: boolean; isLoopback: boolean } {
  const a = (value >>> 24) & 255;
  const b = (value >>> 16) & 255;
  if (a === 10) return { kind: "Private (RFC 1918)", isPrivate: true, isLoopback: false };
  if (a === 172 && b >= 16 && b <= 31) return { kind: "Private (RFC 1918)", isPrivate: true, isLoopback: false };
  if (a === 192 && b === 168) return { kind: "Private (RFC 1918)", isPrivate: true, isLoopback: false };
  if (a === 127) return { kind: "Loopback", isPrivate: false, isLoopback: true };
  if (a === 169 && b === 254) return { kind: "Link-local (APIPA)", isPrivate: true, isLoopback: false };
  if (a === 100 && b >= 64 && b <= 127) return { kind: "Carrier-grade NAT (RFC 6598)", isPrivate: true, isLoopback: false };
  if (a === 0) return { kind: "This network", isPrivate: true, isLoopback: false };
  if (a >= 224 && a <= 239) return { kind: "Multicast", isPrivate: false, isLoopback: false };
  if (a >= 240) return { kind: "Reserved / experimental", isPrivate: false, isLoopback: false };
  if (a === 198 && (b === 18 || b === 19)) return { kind: "Benchmarking (RFC 2544)", isPrivate: false, isLoopback: false };
  if (a === 192 && b === 0) return { kind: "Documentation / IETF protocol assignment", isPrivate: false, isLoopback: false };
  if (a === 203 && b === 0 && ((value >>> 8) & 255) === 113) return { kind: "Documentation (TEST-NET-3)", isPrivate: false, isLoopback: false };
  return { kind: "Public unicast", isPrivate: false, isLoopback: false };
}

export function calculateSubnet(ipInput: string, prefix: number): SubnetResult | { error: string } {
  const ip = parseIpv4(ipInput);
  if (ip === null) return { error: "Enter a valid IPv4 address, such as 192.168.1.10." };
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return { error: "The prefix length must be a whole number between 0 and 32." };
  }

  const maskValue = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & maskValue) >>> 0;
  const broadcast = (network | (~maskValue >>> 0)) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);
  const usableHosts = prefix === 32 ? 1 : prefix === 31 ? 2 : Math.max(0, totalAddresses - 2);
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0;
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;
  const { kind, isPrivate, isLoopback } = classifyIpv4(ip);
  const notes: string[] = [];

  if (prefix === 32) notes.push("A /32 is a single host route; there is no room for a network or broadcast address.");
  if (prefix === 31) notes.push("A /31 is a point-to-point link: both addresses are assignable, per RFC 3021.");
  if (prefix <= 30 && isPrivate) notes.push("This range is private and is not routed on the public internet.");
  if (usableHosts > 65534 && prefix <= 16) notes.push("That is a very large subnet (more than 65k hosts); most networks split it further.");

  return {
    ip: ipv4ToString(ip),
    prefix,
    mask: ipv4ToString(maskValue),
    wildcard: ipv4ToString(~maskValue >>> 0),
    network: ipv4ToString(network),
    broadcast: ipv4ToString(broadcast),
    firstHost: ipv4ToString(firstHost),
    lastHost: ipv4ToString(lastHost),
    totalAddresses,
    usableHosts,
    hostBits: 32 - prefix,
    binary: {
      ip: ipv4ToBinary(ip),
      mask: ipv4ToBinary(maskValue),
      network: ipv4ToBinary(network),
      broadcast: ipv4ToBinary(broadcast),
    },
    kind,
    isPrivate,
    isLoopback,
    notes,
  };
}

/* ------------------------------------------------------------------ */
/* User-agent parsing                                                  */
/* ------------------------------------------------------------------ */

export interface UserAgentInfo {
  browser: { name: string; version: string };
  engine: string;
  os: { name: string; version: string };
  device: { type: "desktop" | "mobile" | "tablet" | "bot" | "unknown"; vendor: string };
  isBot: boolean;
  notes: string[];
}

const BOTS = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|curl|wget|python-requests|axios|go-http-client/i;

export function parseUserAgent(input: string): UserAgentInfo | { error: string } {
  const ua = input.trim();
  if (!ua) return { error: "Paste a User-Agent string to parse." };

  const notes: string[] = [];
  const isBot = BOTS.test(ua);
  let browser = { name: "Unknown", version: "" };
  let engine = "Unknown";
  let os = { name: "Unknown", version: "" };
  let device: UserAgentInfo["device"] = { type: "unknown", vendor: "" };

  const match = (pattern: RegExp) => pattern.exec(ua)?.[1] ?? "";

  // Browser order matters: Edge and Opera both claim to be Chrome.
  if (/Edg\//.test(ua)) browser = { name: "Microsoft Edge", version: match(/Edg\/([\d.]+)/) };
  else if (/OPR\//.test(ua) || /Opera/.test(ua)) browser = { name: "Opera", version: match(/(?:OPR|Version)\/([\d.]+)/) };
  else if (/SamsungBrowser\//.test(ua)) browser = { name: "Samsung Internet", version: match(/SamsungBrowser\/([\d.]+)/) };
  else if (/Firefox\//.test(ua)) browser = { name: "Firefox", version: match(/Firefox\/([\d.]+)/) };
  else if (/CriOS\//.test(ua)) browser = { name: "Chrome (iOS)", version: match(/CriOS\/([\d.]+)/) };
  else if (/FxiOS\//.test(ua)) browser = { name: "Firefox (iOS)", version: match(/FxiOS\/([\d.]+)/) };
  else if (/Chrome\//.test(ua)) browser = { name: "Chrome", version: match(/Chrome\/([\d.]+)/) };
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = { name: "Safari", version: match(/Version\/([\d.]+)/) };
  else if (/MSIE |Trident\//.test(ua)) browser = { name: "Internet Explorer", version: match(/(?:MSIE |rv:)([\d.]+)/) };
  else if (isBot) browser = { name: "Automated client", version: "" };
  if (!browser.version) notes.push("No version number was found — the string may be truncated or custom.");

  if (/Gecko\/|Firefox\//.test(ua)) engine = "Gecko";
  else if (/AppleWebKit\//.test(ua)) engine = /Chrome\/|Chromium|Edg\/|OPR\//.test(ua) ? "Blink" : "WebKit";
  else if (/Trident\//.test(ua)) engine = "Trident";
  else if (/Presto/.test(ua)) engine = "Presto";

  if (/Windows NT 10\.0/.test(ua)) os = { name: "Windows", version: "10 or 11" };
  else if (/Windows NT 6\.3/.test(ua)) os = { name: "Windows", version: "8.1" };
  else if (/Windows NT 6\.1/.test(ua)) os = { name: "Windows", version: "7" };
  else if (/Windows Phone/.test(ua)) os = { name: "Windows Phone", version: match(/Windows Phone(?: OS)? ([\d.]+)/) };
  else if (/Windows NT/.test(ua)) os = { name: "Windows", version: match(/Windows NT ([\d.]+)/) };
  else if (/iPhone|iPad|iPod/.test(ua)) os = { name: "iOS", version: match(/OS ([\d_]+)/).replace(/_/g, ".") };
  else if (/Android/.test(ua)) os = { name: "Android", version: match(/Android ([\d.]+)/) };
  else if (/CrOS/.test(ua)) os = { name: "ChromeOS", version: match(/CrOS \w+ ([\d.]+)/) };
  else if (/Mac OS X/.test(ua)) os = { name: "macOS", version: match(/Mac OS X ([\d_.]+)/).replace(/_/g, ".") };
  else if (/Ubuntu/.test(ua)) os = { name: "Ubuntu", version: match(/Ubuntu\/([\d.]+)/) };
  else if (/Linux/.test(ua)) os = { name: "Linux", version: "" };

  if (isBot) device = { type: "bot", vendor: "" };
  else if (/iPad|Tablet|PlayBook|Silk/.test(ua)) device = { type: "tablet", vendor: /iPad/.test(ua) ? "Apple" : /Samsung|SM-T/.test(ua) ? "Samsung" : "" };
  else if (/Mobile|iPhone|Android.+Mobile|Windows Phone/.test(ua)) device = { type: "mobile", vendor: /iPhone/.test(ua) ? "Apple" : /SM-|Samsung/.test(ua) ? "Samsung" : /Pixel/.test(ua) ? "Google" : "" };
  else if (ua.length > 20) device = { type: "desktop", vendor: /Macintosh/.test(ua) ? "Apple" : /Windows/.test(ua) ? "Microsoft" : "" };

  if (/Android/.test(ua) && !/Mobile/.test(ua)) notes.push("Android without “Mobile” usually means a tablet.");
  if (/iPad/.test(ua) && /Macintosh/.test(ua)) notes.push("iPadOS 13+ reports itself as desktop macOS Safari — that is expected.");
  if (isBot) notes.push("This looks like a crawler, preview bot or scripted client.");
  if (/HeadlessChrome/.test(ua)) notes.push("Headless Chrome indicates automation rather than a person.");

  return {
    browser,
    engine,
    os,
    device,
    isBot,
    notes,
  };
}
