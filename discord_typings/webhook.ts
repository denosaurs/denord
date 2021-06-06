import type { Snowflake } from "./common.ts";
import type { AllowedMentions, Create as MessageCreate } from "./message.ts";
import type { Embed } from "./embed.ts";
import type { GuildChannels } from "./channel.ts";
import type { BaseGuild } from "./guild.ts";
import type { PublicUser } from "./user.ts";

export interface Webhook {
  id: Snowflake;
  type: 1 | 2;
  guild_id: Snowflake; // discord-api-docs#2048
  channel_id: Snowflake;
  user?: PublicUser;
  name: string | null;
  avatar: string | null;
  token?: string;
  application_id: Snowflake | null;
  source_guild?: Pick<BaseGuild, "id" | "name" | "icon">;
  source_channel?: Pick<GuildChannels, "id" | "name">;
  url?: string;
}

export interface Create {
  name: string;
  avatar?: string | null;
}

export interface Modify extends Partial<Create> {
  channel_id?: Snowflake;
}

export interface ExecuteParams {
  wait?: boolean;
}

export interface ExecuteBody
  extends Omit<MessageCreate, "embed" | "nonce" | "message_reference"> {
  username?: string;
  avatar_url?: string;
  embeds?: Embed[];
}

export interface EditMessage {
  content?: string | null;
  embeds?: Embed[] | null;
  file?: File | null;
  payload_json?: string | null;
  allowed_mentions?: AllowedMentions | null;
}

export interface UpdateEvent {
  guild_id: Snowflake;
  channel_id: Snowflake;
}
