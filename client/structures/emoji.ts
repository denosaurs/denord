import type { emoji, Snowflake } from "../../discord_typings/mod.ts";
import { User } from "./user.ts";
import type { Client } from "../client.ts";

export interface BaseEmoji {
  id: Snowflake | null;
  name: string | null;
  roles?: Snowflake[];
  user?: User;
  requireColons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

interface idEmoji extends BaseEmoji {
  id: Snowflake;
}

interface nameEmoji extends BaseEmoji {
  name: string;
}

export type Emoji = idEmoji | nameEmoji;

export type GuildEmoji = idEmoji & nameEmoji;

export function parseEmoji(client: Client, emoji: emoji.GuildEmoji): GuildEmoji;
export function parseEmoji(client: Client, emoji: emoji.Emoji): Emoji;
export function parseEmoji(
  client: Client,
  { user, require_colons, ...emoji }: emoji.Emoji | emoji.GuildEmoji,
): Emoji | GuildEmoji {
  return {
    ...emoji,
    user: user && new User(client, user),
    requireColons: require_colons,
  };
}

export function unparseEmoji(emoji: GuildEmoji): emoji.GuildEmoji;
export function unparseEmoji(emoji: Emoji): emoji.Emoji;
export function unparseEmoji(
  { user, requireColons, ...emoji }: Emoji | GuildEmoji,
): emoji.Emoji | emoji.GuildEmoji {
  return {
    ...emoji,
    user: user?.raw,
    require_colons: requireColons,
  };
}
