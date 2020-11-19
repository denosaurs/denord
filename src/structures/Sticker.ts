import type { message, Snowflake } from "../discord.ts";

export interface Sticker {
  id: Snowflake;
  packId: Snowflake;
  name: string;
  description: string;
  tags: string[];
  asset: string;
  previewAsset: string | null;
  formatType: "png" | "apng" | "lottie";
}

const formatTypeMap = {
  1: "png",
  2: "apng",
  3: "lottie",
} as const;

export function parseSticker(sticker: message.Sticker): Sticker {
  return {
    id: sticker.id,
    packId: sticker.pack_id,
    name: sticker.name,
    description: sticker.description,
    tags: sticker.tags?.split(",") ?? [],
    asset: sticker.asset,
    previewAsset: sticker.preview_asset,
    formatType: formatTypeMap[sticker.format_type],
  };
}
