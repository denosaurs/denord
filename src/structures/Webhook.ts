import type { Snowflake, webhook } from "../discord.ts";
import { User } from "./User.ts";
import type { Client } from "../Client.ts";

export interface Webhook {
  id: Snowflake;
  type: 1 | 2;
  guildId?: Snowflake; // TODO
  channelId: Snowflake;
  user?: User;
  name: string | null;
  avatar: string | null;
  token?: string;
}

export function parseWebhook(
  client: Client,
  { guild_id, channel_id, user, ...webhook }: webhook.Webhook,
): Webhook {
  return {
    ...webhook,
    guildId: guild_id,
    channelId: channel_id,
    user: user && new User(client, user),
  };
}
