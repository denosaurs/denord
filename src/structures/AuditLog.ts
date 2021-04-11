import { User } from "./User.ts";
import type { auditLog, role, Snowflake } from "../discord.ts";
import type { Client } from "../Client.ts";
import type { Integration } from "./Integration.ts";
import { inverseMap } from "../utils/utils.ts";
import { parseWebhook, Webhook } from "./Webhook.ts";
import type { PermissionOverwrite } from "./GuildChannel.ts";
import { parsePermissionOverwritePermissions } from "./GuildChannel.ts";

export interface AuditLog {
  webhooks: Webhook[];
  users: User[];
  entries: Entry[];
  integrations: Pick<Integration, "id" | "name" | "type" | "account">[];
}

const actionTypeMap = {
  1: "guildUpdate",
  10: "channelCreate",
  11: "channelUpdate",
  12: "channelDelete",
  13: "channelOverwriteCreate",
  14: "channelOverwriteUpdate",
  15: "channelOverwriteDelete",
  20: "memberKick",
  21: "memberPrune",
  22: "memberBanAdd",
  23: "memberBanRemove",
  24: "memberUpdate",
  25: "memberRoleUpdate",
  26: "memberMove",
  27: "memberDisconnect",
  28: "botAdd",
  30: "roleCreate",
  31: "roleUpdate",
  32: "roleDelete",
  40: "inviteCreate",
  41: "inviteUpdate",
  42: "inviteDelete",
  50: "webhookCreate",
  51: "webhookUpdate",
  52: "webhookDelete",
  60: "emojiCreate",
  61: "emojiUpdate",
  62: "emojiDelete",
  72: "messageDelete",
  73: "messageBulkDelete",
  74: "messagePin",
  75: "messageUnpin",
  80: "integrationCreate",
  81: "integrationUpdate",
  82: "integrationDelete",
} as const;

export const inverseActionType = inverseMap(actionTypeMap);

const changeKeyMap = {
  name: "name",
  description: "description",
  icon_hash: "iconHash",
  splash_hash: "splashHash",
  discovery_splash_hash: "discoverySplashHash",
  banner_hash: "bannerHash",
  owner_id: "ownerId",
  region: "region",
  preferred_locale: "preferredLocale",
  afk_channel_id: "afkChannelId",
  afk_timeout: "afkTimeout",
  rules_channel_id: "rulesChannelId",
  public_updates_channel_id: "publicUpdatesChannelId",
  mfa_level: "mfaLevel",
  verification_level: "verificationLevel",
  explicit_content_filter: "explicitContentFilter",
  default_message_notifications: "defaultMessageNotifications",
  vanity_url_code: "vanityUrlCode",
  $add: "roleAdd",
  $remove: "roleRemove",
  prune_delete_days: "pruneDeleteDays",
  widget_enabled: "widgetEnabled",
  widget_channel_id: "widgetChannelId",
  system_channel_id: "systemChannelId",
  position: "position",
  topic: "topic",
  bitrate: "bitrate",
  permission_overwrites: "permissionOverwrites",
  nsfw: "nsfw",
  application_id: "applicationId",
  rate_limit_per_user: "rateLimitPerUser",
  permissions: "permissions",
  color: "color",
  hoist: "hoist",
  mentionable: "mentionable",
  allow: "allow",
  deny: "deny",
  code: "code",
  channel_id: "channelId",
  inviter_id: "inviterId",
  max_uses: "maxUses",
  uses: "uses",
  max_age: "maxAge",
  temporary: "temporary",
  deaf: "deaf",
  mute: "mute",
  nick: "nick",
  avatar_hash: "avatarHash",
  id: "id",
  type: "type",
  enable_emoticons: "enableEmoticons",
  expire_behavior: "expireBehavior",
  expire_grace_period: "expireGracePeriod",
  user_limit: "userLimit",
} as const;

interface BaseEntry {
  targetId: string | null;
  changes?: Change[];
  userId: Snowflake | null;
  id: Snowflake;
  reason?: string;
  actionType: keyof typeof inverseActionType;
  extra: unknown;
}

interface NonExtraEntry extends BaseEntry {
  actionType: Exclude<
    keyof typeof inverseActionType,
    | "channelOverwriteCreate"
    | "channelOverwriteUpdate"
    | "channelOverwriteDelete"
    | "memberPrune"
    | "memberMove"
    | "memberDisconnect"
    | "messageDelete"
    | "messageBulkDelete"
    | "messagePin"
    | "messageUnpin"
  >;
  extra: undefined;
}

interface ChannelOverwriteEntry extends BaseEntry {
  actionType:
    | "channelOverwriteCreate"
    | "channelOverwriteUpdate"
    | "channelOverwriteDelete";
  extra: ChannelOverwriteMember | ChannelOverwriteRole;
}

interface ChannelOverwriteMember {
  id: Snowflake;
  type: "member";
  roleName: undefined;
}

interface ChannelOverwriteRole {
  id: Snowflake;
  type: "role";
  roleName: string;
}

interface MemberPruneEntry extends BaseEntry {
  actionType: "memberPrune";
  extra: {
    deleteMemberDays: string;
    membersRemoved: string;
  };
}

interface MemberMoveEntry extends BaseEntry {
  actionType: "memberMove";
  extra: {
    channelId: Snowflake;
    count: string;
  };
}

interface MemberDisconnectEntry extends BaseEntry {
  actionType: "memberDisconnect";
  extra: {
    count: string;
  };
}

interface MessageDeleteEntry extends BaseEntry {
  actionType: "messageDelete";
  extra: {
    channelId: Snowflake;
    count: string;
  };
}

interface MessageBulkDeleteEntry extends BaseEntry {
  actionType: "messageBulkDelete";
  extra: {
    count: string;
  };
}

interface MessagePinEntry extends BaseEntry {
  actionType: "messagePin" | "messageUnpin";
  extra: {
    channelId: Snowflake;
    messageId: Snowflake;
  };
}

type Entry =
  | MemberPruneEntry
  | MemberMoveEntry
  | MessagePinEntry
  | MessageDeleteEntry
  | MessageBulkDeleteEntry
  | MemberDisconnectEntry
  | ChannelOverwriteEntry
  | NonExtraEntry;

export interface ChangeKey {
  name: string;
  iconHash: string;
  splashHash: string;
  ownerId: Snowflake;
  region: string;
  afkChannelId: Snowflake;
  afkTimeout: number;
  mfaLevel: number;
  verificationLevel: number;
  explicitContentFilter: number;
  defaultMessageNotifications: number;
  vanityUrlCode: string;
  roleAdd: Pick<role.Role, "id" | "name">[];
  roleRemove: Pick<role.Role, "id" | "name">[];
  pruneDeleteDays: number;
  widgetEnabled: boolean;
  widgetChannelId: Snowflake;
  systemChannelId: Snowflake;
  position: number;
  topic: string;
  bitrate: number;
  permissionOverwrites: PermissionOverwrite[];
  nsfw: boolean;
  applicationId: Snowflake;
  rateLimitPerUser: number;
  permissions: number;
  permissionsNew: string;
  color: number;
  hoist: boolean;
  mentionable: boolean;
  allow: number;
  allowNew: string;
  deny: number;
  denyNew: string;
  code: string;
  channelId: Snowflake;
  inviterId: Snowflake;
  maxUses: number;
  uses: number;
  maxAge: number;
  temporary: boolean;
  deaf: boolean;
  mute: boolean;
  nick: string;
  avatarHash: string;
  id: Snowflake;
  type: number | string;
  enableEmoticons: boolean;
  expireBehavior: number;
  expireGracePeriod: number;
}

export interface UnspecificChange<T extends keyof ChangeKey> {
  newValue?: ChangeKey[T];
  oldValue?: ChangeKey[T];
  key: T;
}

type SpecificChange<T extends keyof ChangeKey> = T extends keyof ChangeKey
  ? UnspecificChange<T>
  : never;

export type Change = SpecificChange<keyof ChangeKey>;

export function parseAuditLog(
  client: Client,
  { audit_log_entries, integrations, users, webhooks }: auditLog.AuditLog,
): AuditLog {
  return {
    users: users.map((user) => new User(client, user)),
    entries: audit_log_entries.map((entry) => parseEntry(entry)),
    integrations,
    webhooks: webhooks.map((webhook) => parseWebhook(client, webhook)),
  };
}

//TODO: remove all casts
function parseEntry(entry: auditLog.Entry): Entry {
  let extra: Entry["extra"];

  if (entry.options) {
    switch (entry.action_type) {
      case 13:
      case 14:
      case 15:
        extra = {
          id: entry.options.id,
          type: entry.options.type === "1" ? "member" : "role",
          roleName: entry.options.role_name,
        } as ChannelOverwriteMember | ChannelOverwriteRole;
        break;
      case 21:
        extra = {
          deleteMemberDays: entry.options.delete_member_days,
          membersRemoved: entry.options.members_removed,
        };
        break;
      case 26:
      case 72:
        extra = {
          channelId: entry.options.channel_id,
          count: entry.options.count,
        };
        break;
      case 27:
      case 73:
        extra = {
          count: entry.options.count,
        };
        break;
      case 74:
      case 75:
        extra = {
          channelId: entry.options.channel_id,
          messageId: entry.options.message_id,
        };
        break;
    }
  }

  return {
    targetId: entry.target_id,
    changes: entry.changes?.map((change) => {
      if (change.key === "permission_overwrites") {
        return {
          key: changeKeyMap[change.key],
          newValue: change.new_value?.map(
            ((value) => ({
              id: value.id,
              type: value.type,
              permissions: parsePermissionOverwritePermissions(
                value.allow,
                value.deny,
              ),
            })),
          ),
          oldValue: change.old_value?.map(
            ((value) => ({
              id: value.id,
              type: value.type,
              permissions: parsePermissionOverwritePermissions(
                value.allow,
                value.deny,
              ),
            })),
          ),
        };
      } else {
        return {
          key: changeKeyMap[change.key],
          newValue: change.new_value,
          oldValue: change.old_value,
        };
      }
    }),
    userId: entry.user_id,
    id: entry.id,
    actionType: actionTypeMap[entry.action_type],
    extra: extra,
    reason: entry.reason,
  } as Entry;
}
