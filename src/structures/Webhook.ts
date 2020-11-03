import type { Snowflake, webhook } from "../discord.ts";
import { User } from "./User.ts";
import type { Client } from "../Client.ts";
import type { SendMessageOptions } from "./Message.ts";
import type { Embed } from "./Embed.ts";

export interface Webhook {
  id: Snowflake;
  type: "incoming" | "channelFollower";
  guildId: Snowflake;
  channelId: Snowflake;
  user?: User;
  name: string | null;
  avatar: string | null;
  token?: string;
  applicationId: Snowflake | null;
}

export interface ExecuteWebhook extends Omit<SendMessageOptions, "embed"> {
  username?: string;
  avatarUrl?: string;
  embeds?: Embed[];
}

export function parseWebhook(
  client: Client,
  { guild_id, channel_id, user, type, application_id, ...webhook }:
    webhook.Webhook,
): Webhook {
  return {
    ...webhook,
    guildId: guild_id,
    channelId: channel_id,
    type: type === 1 ? "incoming" : "channelFollower",
    user: user && new User(client, user),
    applicationId: application_id,
  };
}
