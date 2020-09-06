export type ImageFormat = "jpg" | "png" | "gif" | "webp";
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;
export function imageURLFormatter(
  endpoint: string,
  {
    format,
    size,
  }: {
    format?: ImageFormat;
    size?: ImageSize;
  } = {},
) {
  return `${URLs.CDN}${endpoint}.${format ??
    (endpoint.includes("_a") ? "gif" : "jpg")}${size ? `?size=${size}` : ""}`;
}

export const URLs = {
  CDN: "https://cdn.discordapp.com/",
  REST: "https://discord.com/api/v6/",
  Gateway: "wss://gateway.discord.gg/?v=6&encoding=json",
};

type OmitKeysThatDontMatchEntry<
  StringRecord extends Record<string, string | number>,
  Entry extends string | number,
> = {
  [Key in keyof StringRecord]: StringRecord[Key] extends Entry ? Key : never;
};

type FindKey<
  StringRecord extends Record<string, string | number>,
  Entry extends string | number,
> = OmitKeysThatDontMatchEntry<
  StringRecord,
  Entry
>[keyof OmitKeysThatDontMatchEntry<StringRecord, Entry>];

export type InvertRecord<StringRecord extends Record<string, string | number>> =
  {
    [Entry in StringRecord[keyof StringRecord]]: FindKey<StringRecord, Entry>;
  };

export function inverseMap<T extends Record<string, string | number>>(
  map: T,
): {
  [Entry in T[keyof T]]: FindKey<T, Entry>;
} {
  return Object.fromEntries(
    Object.entries(map).map((entry) => entry.reverse()),
  );
}
