import type { ISO8601, Snowflake } from "./common.ts";
import type { PublicUser } from "./user.ts";
import type { BaseGuild } from "./guild.ts";

export interface Template {
  code: string;
  name: string;
  description: string | null;
  usage_count: number;
  creator_id: Snowflake;
  creator: PublicUser;
  created_at: ISO8601;
  updated_at: ISO8601;
  source_guild_id: Snowflake;
  serialized_source_guild: Partial<BaseGuild>;
  is_dirty: boolean | null;
}

export interface createGuildTemplate {
  name: string;
  description?: string | null;
}

export type modifyGuildTemplate = Partial<createGuildTemplate>;

export interface createGuildFromTemplate {
  name: string;
  icon?: string;
}
