export function stringifyQueryParams(obj: any) {
  const stringifiedParams = (new URLSearchParams(obj)).toString();

  if (stringifiedParams) {
    return "?" + stringifiedParams;
  } else {
    return "";
  }
}

export type ImageFormat = "jpg" | "png" | "gif" | "webp";
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;
export function imageURLFormatter(
  endpoint: string,
  { format, size }: {
    format?: ImageFormat;
    size?: ImageSize;
  } = { format: "jpg" },
) {
  return `${URLs.CDN}${endpoint}.${
    (endpoint.includes("_a") && !format) ? "gif" : format
  }${size ? `?=${size}` : ""}`;
}

export const URLs = {
  CDN: "https://cdn.discordapp.com/",
  REST: "https://discordapp.com/api/v6/",
}
