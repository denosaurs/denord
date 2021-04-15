import type { Snowflake } from "./common.ts";
import type { Webhook } from "./webhook.ts";
import type { PublicUser } from "./user.ts";
import type { Integration } from "./integration.ts";
import type { Role } from "./role.ts";
import type { Overwrite } from "./channel.ts";

export interface AuditLog {
  webhooks: Webhook[];
  users: PublicUser[];
  audit_log_entries: Entry[];
  integrations: Pick<Integration, "id" | "name" | "type" | "account">[];
}

export interface ChangeKey {
  name: string;
  description: string;
  icon_hash: string;
  splash_hash: string;
  discovery_splash_hash: string;
  banner_hash: string;
  owner_id: Snowflake;
  region: string;
  preferred_locale: string;
  afk_channel_id: Snowflake;
  afk_timeout: number;
  rules_channel_id: Snowflake;
  public_updates_channel_id: Snowflake;
  mfa_level: number;
  verification_level: number;
  explicit_content_filter: number;
  default_message_notifications: number;
  vanity_url_code: string;
  $add: Pick<Role, "id" | "name">[];
  $remove: Pick<Role, "id" | "name">[];
  prune_delete_days: number;
  widget_enabled: boolean;
  widget_channel_id: Snowflake;
  system_channel_id: Snowflake;
  position: number;
  topic: string;
  bitrate: number;
  permission_overwrites: Overwrite[];
  nsfw: boolean;
  application_id: Snowflake;
  rate_limit_per_user: number;
  permissions: string;
  color: number;
  hoist: boolean;
  mentionable: boolean;
  allow: string;
  deny: string;
  code: string;
  channel_id: Snowflake;
  inviter_id: Snowflake;
  max_uses: number;
  uses: number;
  max_age: number;
  temporary: boolean;
  deaf: boolean;
  mute: boolean;
  nick: string;
  avatar_hash: string;
  id: Snowflake;
  type: number | string;
  enable_emoticons: boolean;
  expire_behavior: number;
  expire_grace_period: number;
  user_limit: number;
}

export interface UnspecificChange<T extends keyof ChangeKey> {
  new_value?: ChangeKey[T];
  old_value?: ChangeKey[T];
  key: T;
}

type SpecificChange<T extends keyof ChangeKey> = T extends keyof ChangeKey
  ? UnspecificChange<T>
  : never;

export type Change = SpecificChange<keyof ChangeKey>;

type ActionType =
  | 1
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 30
  | 31
  | 32
  | 40
  | 41
  | 42
  | 50
  | 51
  | 52
  | 60
  | 61
  | 62
  | 72
  | 73
  | 74
  | 75
  | 80
  | 81
  | 82;

interface BaseEntry {
  target_id: string | null;
  changes?: Change[];
  user_id: Snowflake | null;
  id: Snowflake;
  action_type: ActionType;
  options: unknown;
  reason?: string;
}

interface NonOptionsEntry extends BaseEntry {
  action_type: Exclude<
    ActionType,
    13 | 14 | 15 | 21 | 26 | 27 | 72 | 73 | 74 | 75
  >;
  options: undefined;
}

interface ChannelOverwriteEntry extends BaseEntry {
  action_type: 13 | 14 | 15;
  options: ChannelOverwriteMember | ChannelOverwriteRole;
}

interface ChannelOverwriteMember {
  id: Snowflake;
  type: "1";
  role_name: undefined;
}

interface ChannelOverwriteRole {
  id: Snowflake;
  type: "0";
  role_name: string;
}

interface MemberPruneEntry extends BaseEntry {
  action_type: 21;
  options: {
    delete_member_days: string;
    members_removed: string;
  };
}

interface MemberMoveEntry extends BaseEntry {
  action_type: 26;
  options: {
    channel_id: Snowflake;
    count: string;
  };
}

interface MemberDisconnectEntry extends BaseEntry {
  action_type: 27;
  options: {
    count: string;
  };
}

interface MessageDeleteEntry extends BaseEntry {
  action_type: 72;
  options: {
    channel_id: Snowflake;
    count: string;
  };
}

interface MessageBulkDeleteEntry extends BaseEntry {
  action_type: 73;
  options: {
    count: string;
  };
}

interface MessagePinEntry extends BaseEntry {
  action_type: 74 | 75;
  options: {
    channel_id: Snowflake;
    message_id: Snowflake;
  };
}

export type Entry =
  | MemberPruneEntry
  | MemberMoveEntry
  | MessagePinEntry
  | MessageDeleteEntry
  | MessageBulkDeleteEntry
  | MemberDisconnectEntry
  | ChannelOverwriteEntry
  | NonOptionsEntry;

export interface Params {
  user_id?: Snowflake;
  action_type?: number;
  before?: Snowflake;
  limit?: number;
}
