import type { ISO8601, Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";
import type { GuildMember } from "./guildMember.ts";

export interface BaseChannel {
  id: Snowflake;
  type: Type;
}

export type Type = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 13;

export interface DMChannel extends BaseChannel {
  type: 1;
  last_message_id: Snowflake | null;
  recipients: [PublicUser];
  last_pin_timestamp?: ISO8601 | null;
}

export interface GroupDMChannel extends BaseChannel {
  type: 3;
  last_message_id: Snowflake | null;
  recipients: PublicUser[];
  last_pin_timestamp?: ISO8601 | null;
  application_id?: Snowflake;
  name: string | null;
  icon: string | null;
  owner_id: Snowflake;
}

export interface GuildChannel extends BaseChannel {
  type: Exclude<Type, 1 | 3>;
  name: string;
  position: number;
  parent_id: Snowflake | null;
  guild_id: Snowflake;
  permission_overwrites: Overwrite[];
  nsfw: boolean;
  permissions?: number;
}

export interface TextBasedGuildChannel extends GuildChannel {
  type: Extract<Type, 0 | 5>;
  last_pin_timestamp?: ISO8601 | null;
  last_message_id: Snowflake | null;
  topic: string | null;
}

export interface TextChannel extends TextBasedGuildChannel {
  type: 0;
  rate_limit_per_user: number;
}

export interface VoiceBasedChannel extends GuildChannel {
  bitrate: number;
  user_limit: number;
  nsfw: false;
  rtc_region?: string | null;
  video_quality_mode?: VideoQualityMode;
}

export interface VoiceChannel extends VoiceBasedChannel {
  type: 2;
}

export type VideoQualityMode = 1 | 2;

export interface CategoryChannel extends GuildChannel {
  type: 4;
  parent_id: null;
  nsfw: false;
}

export interface NewsChannel extends TextBasedGuildChannel {
  type: 5;
}

export interface StoreChannel extends GuildChannel {
  type: 6;
}

export interface StageVoiceChannel extends VoiceBasedChannel {
  type: 13;
}

export type GuildChannels =
  | TextChannel
  | VoiceChannel
  | CategoryChannel
  | NewsChannel
  | StoreChannel
  | StageVoiceChannel;

export type TextBasedChannels = TextChannel | NewsChannel | DMChannels;

export type DMChannels = DMChannel | GroupDMChannel;

export type Channel = GuildChannels | DMChannels;

export interface Overwrite {
  id: Snowflake;
  type: 0 | 1;
  allow: string;
  deny: string;
}

export interface Mention {
  id: Snowflake;
  guild_id: Snowflake;
  type: Type;
  name: string;
}

export interface GetMessages {
  around?: Snowflake;
  before?: Snowflake;
  after?: Snowflake;
  limit?: number;
}

export interface GetReactions {
  after?: Snowflake;
  limit?: number;
}

export interface BulkDelete {
  messages: Snowflake[];
}

export interface FollowedChannel {
  channel_id: Snowflake;
  webhook_id: Snowflake;
}

export interface FollowNewsChannel {
  webhook_channel_id: Snowflake;
}

export interface GroupDMAddRecipient {
  access_token: string;
  nick?: string;
}

export interface CreateGuildChannel {
  name: string;
  type?: Exclude<Type, 1 | 3>;
  topic?: string;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  position?: number;
  permission_overwrites?: Overwrite[];
  parent_id?: Snowflake;
  nsfw?: boolean;
}

export interface Modify {
  name?: string;
  type?: 0 | 5;
  position?: number | null;
  topic?: string | null;
  nsfw?: boolean | null;
  rate_limit_per_user?: number | null;
  bitrate?: number | null;
  user_limit?: number | null;
  permission_overwrites?: Overwrite[] | null;
  parent_id?: Snowflake | null;
  rtc_region?: string | null;
  video_quality_mode?: VideoQualityMode | null;
}

export interface GuildPosition {
  id: Snowflake;
  position: number | null;
  lock_permissions: boolean | null;
  parent_id: Snowflake | null;
}

export interface CreateDM {
  recipient_id: Snowflake;
}

export interface CreateGroupDM {
  access_tokens: string[];
  nicks: { [key: string]: string };
}

export interface PinsUpdateEvent {
  guild_id?: Snowflake;
  channel_id: Snowflake;
  last_pin_timestamp?: ISO8601 | null;
}

export interface DeleteBulkEvent {
  ids: Snowflake[];
  channel_id: Snowflake;
  guild_id?: Snowflake;
}

export interface TypingStartEvent {
  channel_id: Snowflake;
  guild_id?: Snowflake;
  user_id: Snowflake;
  timestamp: number;
  member?: GuildMember;
}
