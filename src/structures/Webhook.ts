import type { Snowflake, webhook } from "../discord.ts";
import { User } from "./User.ts";
import type { Client } from "../Client.ts";

export interface Webhook {
  id: Snowflake;
  type: "incoming" | "channelFollower";
  guildId?: Snowflake; // TODO
  channelId: Snowflake;
  user?: User;
  name: string | null;
  avatar: string | null;
  token?: string;
}

export function parseWebhook(
  client: Client,
  { guild_id, channel_id, user, type, ...webhook }: webhook.Webhook,
): Webhook {
  return {
    ...webhook,
    guildId: guild_id,
    channelId: channel_id,
    type: type === 1 ? "incoming" : "channelFollower",
    user: user && new User(client, user),
  };
}
