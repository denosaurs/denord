import type { ISO8601, Snowflake } from "./common.ts";
import type { Application } from "./oauth2.ts";
import type { PublicUser } from "./user.ts";
import type { RESTGuild } from "./guild.ts";
import type { GuildChannels } from "./channel.ts";

export interface Invite {
  code: string;
  guild?: Partial<RESTGuild>;
  channel: Partial<GuildChannels>;
  inviter?: PublicUser;
  target_type?: TargetType;
  target_user?: Partial<PublicUser>;
  target_application?: Partial<Application>;
  approximate_presence_count?: number;
  approximate_member_count?: number;
}

export type TargetType = 1 | 2;

export interface Metadata {
  uses: number;
  max_uses: number;
  max_age: number;
  temporary: boolean;
  created_at: ISO8601;
}

export type MetadataInvite = Invite & Metadata;

export interface Create extends
  Partial<
    Pick<
      MetadataInvite,
      "max_age" | "max_uses" | "temporary" | "target_type"
    >
  > {
  unique?: boolean;
  target_user_id?: Snowflake;
  target_application_id?: Snowflake;
}

export type VanityURL = Pick<MetadataInvite, "code" | "uses">;

export interface CreateEvent extends
  Pick<
    Invite,
    | "code"
    | "inviter"
    | "target_user"
    | "target_type"
    | "target_application"
  >,
  Metadata {
  channel_id: Snowflake;
  guild_id?: Snowflake;
}

export interface DeleteEvent {
  channel_id: Snowflake;
  guild_id?: Snowflake;
  code: string;
}
