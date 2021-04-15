import type { ISO8601, Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";

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
