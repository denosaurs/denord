import type { ISO8601, Snowflake } from "./common.ts";
import type { GuildMember } from "./guild_member.ts";
import type { PublicUser } from "./user.ts";
import type { Mention as ChannelMention } from "./channel.ts";
import type { Embed } from "./embed.ts";
import type { Application } from "./oauth2.ts";
import type { MessageInteraction } from "./interaction.ts";
import type { Emoji } from "./emoji.ts";

export interface Message {
  id: Snowflake;
  channel_id: Snowflake;
  guild_id?: Snowflake;
  author: PublicUser;
  member?: Omit<GuildMember, "user">;
  content: string;
  timestamp: ISO8601;
  edited_timestamp: ISO8601 | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: (PublicUser & { member?: Omit<GuildMember, "user"> })[];
  mention_roles: Snowflake[];
  mention_channels?: ChannelMention[];
  attachments: Attachment[];
  embeds: Embed[];
  reactions?: Reaction[];
  nonce?: number | string;
  pinned: boolean;
  webhook_id?: Snowflake;
  type: Type;
  activity?: Activity;
  application?: Partial<Application>;
  message_reference?: Reference;
  flags?: number;
  stickers?: Sticker[];
  referenced_message?: Message | null;
  interaction?: MessageInteraction;
}

export type Type =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 14
  | 15
  | 16
  | 17
  | 19
  | 20
  | 22;

export interface Attachment {
  id: Snowflake;
  filename: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number | null;
  width?: number | null;
}

export interface Reaction {
  count: number;
  me: boolean;
  emoji: Pick<Emoji, "id" | "name" | "animated">;
}

export interface Activity {
  type: 1 | 2 | 3 | 5;
  party_id?: string;
}

export interface AllowedMentions {
  parse: ["roles"?, "users"?, "everyone"?];
  roles: Snowflake[];
  users: Snowflake[];
  replied_user: boolean;
}

export interface Reference {
  message_id?: Snowflake;
  channel_id?: Snowflake;
  guild_id?: Snowflake;
  fail_if_not_exists?: boolean;
}

export interface Sticker {
  id: Snowflake;
  pack_id: Snowflake;
  name: string;
  description: string;
  tags?: string;
  asset: string;
  preview_asset: string | null;
  format_type: 1 | 2 | 3;
}

export interface BaseCreate {
  content?: string;
  nonce?: number | string;
  tts?: boolean;
  file?: File;
  embed?: Embed;
  payload_json?: string;
  allowed_mentions?: AllowedMentions;
  message_reference?: Reference & Required<Pick<Reference, "message_id">>;
}

export type Create =
  | BaseCreate & Required<Pick<BaseCreate, "embed">>
  | BaseCreate & Required<Pick<BaseCreate, "file">>
  | BaseCreate & Required<Pick<BaseCreate, "content">>;

export interface Edit {
  content?: string | null;
  embed?: Embed | null;
  flags?: number | null;
  allowed_mentions?: AllowedMentions | null;
}

export type DeleteEvent = Pick<Message, "id" | "channel_id" | "guild_id">;

export interface ReactionAddEvent {
  user_id: Snowflake;
  channel_id: Snowflake;
  message_id: Snowflake;
  guild_id?: Snowflake;
  member?: GuildMember;
  emoji: Pick<Emoji, "id" | "name" | "animated">;
}

export type ReactionRemoveEvent = Omit<ReactionAddEvent, "member">;

export type ReactionRemoveAllEvent = Omit<
  ReactionRemoveEvent,
  "emoji" | "user_id"
>;

export type ReactionRemoveEmojiEvent = Omit<ReactionRemoveEvent, "user_id">;

export type UpdateEvent = Partial<Message> & Pick<Message, "id" | "channel_id">;
