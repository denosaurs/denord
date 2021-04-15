import type { ISO8601, Snowflake } from "./common.ts";
import type { GuildMember } from "./guildMember.ts";

export interface State {
  guild_id?: Snowflake;
  channel_id: Snowflake | null;
  user_id: Snowflake;
  member?: GuildMember;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_stream?: boolean;
  self_video: boolean;
  suppress: boolean;
  request_to_speak_timestamp: ISO8601 | null;
}

export interface Region {
  id: string;
  name: string;
  vip: boolean;
  optimal: boolean;
  deprecated: boolean;
  custom: boolean;
}

export interface ServerUpdateEvent {
  token: string;
  guild_id: Snowflake;
  endpoint: string | null;
}

export interface CurrentUserUpdateState {
  channel_id: Snowflake;
  suppress?: boolean;
  request_to_speak_timestamp?: ISO8601 | null;
}

export type UserUpdateState = Omit<
  CurrentUserUpdateState,
  "request_to_speak_timestamp"
>;
