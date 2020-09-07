import type { emoji, Snowflake } from "../discord.ts";
import { User } from "./User.ts";
import type { Client } from "../Client.ts";

export interface Emoji {
  id: Snowflake | null;
  name: string | null;
  roles?: Snowflake[];
  user?: User;
  requireColons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export interface GuildEmoji extends Emoji {
  id: Snowflake;
  name: string;
}

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
