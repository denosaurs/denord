import type {
  channel,
  guild,
  Snowflake,
  webhook,
} from "../../discord_typings/mod.ts";
import { User } from "./user.ts";
import type { Client } from "../client.ts";
import type { SendMessageOptions } from "./message.ts";
import type { Embed } from "./embed.ts";

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
  sourceGuild?: Pick<guild.BaseGuild, "id" | "name" | "icon">;
  sourceChannel?: Pick<channel.GuildChannels, "id" | "name">;
  url?: string;
}

export interface ExecuteWebhook
  extends Omit<SendMessageOptions, "embed" | "reply"> {
  username?: string;
  avatarUrl?: string;
  embeds?: Embed[];
}

export function parseWebhook(
  client: Client,
  {
    guild_id,
    channel_id,
    user,
    type,
    application_id,
    source_channel,
    source_guild,
    ...webhook
  }: webhook.Webhook,
): Webhook {
  return {
    ...webhook,
    guildId: guild_id,
    channelId: channel_id,
    type: type === 1 ? "incoming" : "channelFollower",
    user: user && new User(client, user),
    applicationId: application_id,
    sourceGuild: source_guild,
    sourceChannel: source_channel,
  };
}
