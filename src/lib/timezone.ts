export interface ZoneOption {
  id: string;
  city: string;
  country: string;
}

export const COMMON_ZONES: ZoneOption[] = [
  { id: "Pacific/Auckland", city: "Auckland", country: "New Zealand" },
  { id: "Australia/Sydney", city: "Sydney", country: "Australia" },
  { id: "Asia/Tokyo", city: "Tokyo", country: "Japan" },
  { id: "Asia/Shanghai", city: "Shanghai", country: "China" },
  { id: "Asia/Singapore", city: "Singapore", country: "Singapore" },
  { id: "Asia/Kolkata", city: "Mumbai", country: "India" },
  { id: "Asia/Dubai", city: "Dubai", country: "UAE" },
  { id: "Africa/Lagos", city: "Lagos", country: "Nigeria" },
  { id: "Europe/Istanbul", city: "Istanbul", country: "Türkiye" },
  { id: "Europe/Berlin", city: "Berlin", country: "Germany" },
  { id: "Europe/Paris", city: "Paris", country: "France" },
  { id: "Europe/London", city: "London", country: "United Kingdom" },
  { id: "UTC", city: "UTC", country: "Coordinated Universal Time" },
  { id: "America/Sao_Paulo", city: "São Paulo", country: "Brazil" },
  { id: "America/New_York", city: "New York", country: "United States" },
  { id: "America/Chicago", city: "Chicago", country: "United States" },
  { id: "America/Denver", city: "Denver", country: "United States" },
  { id: "America/Los_Angeles", city: "Los Angeles", country: "United States" },
  { id: "Pacific/Honolulu", city: "Honolulu", country: "United States" },
];

/** Offset in milliseconds for a time zone at a given instant. */
export function zoneOffsetMs(instant: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(instant);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUtc - instant.getTime();
}

/**
 * Convert a wall-clock time in a specific IANA zone to an absolute instant.
 * Iterates twice so daylight-saving transitions resolve correctly.
 */
export function zonedTimeToInstant(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  let instant = new Date(guess - zoneOffsetMs(new Date(guess), timeZone));
  instant = new Date(guess - zoneOffsetMs(instant, timeZone));
  return instant;
}

export function formatInZone(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(instant);
}

export function formatOffset(instant: Date, timeZone: string): string {
  const offsetMinutes = zoneOffsetMs(instant, timeZone) / 60000;
  const sign = offsetMinutes >= 0 ? "+" : "−";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  return `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function localHourInZone(instant: Date, timeZone: string): number {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hour12: false,
  }).format(instant);
  return Number(formatted) % 24;
}
