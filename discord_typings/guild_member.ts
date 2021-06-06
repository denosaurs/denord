import type { ISO8601, Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";
import type { Presence } from "./presence.ts";

export interface GuildMember {
  user: PublicUser;
  nick?: string | null;
  roles: Snowflake[];
  joined_at: ISO8601;
  premium_since?: ISO8601 | null;
  deaf: boolean;
  mute: boolean;
  pending?: boolean;
  permissions?: string;
}

export interface List {
  limit?: number;
  after?: Snowflake;
}

export interface Search {
  query: string;
  limit?: number;
}

export interface Add {
  access_token: string;
  nick?: string;
  roles?: Snowflake[];
  mute?: boolean;
  deaf?: boolean;
}

export interface ModifyCurrentNick {
  nick?: string | null;
}

export type ModifyCurrentNickResponse = Required<ModifyCurrentNick>;

export interface Modify extends ModifyCurrentNick {
  roles?: Snowflake[] | null;
  deaf?: boolean | null;
  mute?: boolean | null;
  channel_id?: Snowflake | null;
}

export interface AddEvent extends GuildMember {
  guild_id: Snowflake;
}

export interface RemoveEvent {
  guild_id: Snowflake;
  user: PublicUser;
}

export interface UpdateEvent {
  guild_id: Snowflake;
  roles: Snowflake[];
  user: PublicUser;
  nick?: string | null;
  joined_at: ISO8601;
  premium_since?: ISO8601 | null;
  deaf?: boolean;
  mute?: boolean;
  pending?: boolean;
}

export interface ChunkEvent {
  guild_id: Snowflake;
  members: GuildMember[];
  chunk_index: number;
  chunk_count: number;
  not_found?: Snowflake[];
  presences?: Presence[];
  nonce?: string;
}
