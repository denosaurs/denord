import { User } from "./User.ts";
import type { auditLog, Snowflake } from "../discord.ts";
import type { Client } from "../Client.ts";
import type { Integration } from "./Integration.ts";
import { inverseMap } from "../utils/utils.ts";

export interface AuditLog {
  webhooks: any;
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

interface BaseEntry {
  targetId: string | null;
  changes?: Change[];
  userId: Snowflake;
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

export interface Change {
  newValue?: any;
  oldValue?: any;
  key: any;
}

export function parseAuditLog(
  client: Client,
  auditLog: auditLog.AuditLog,
): AuditLog {
  return {
    users: auditLog.users.map((user) => new User(client, user)),
    entries: auditLog.audit_log_entries.map((entry) => parseEntry(entry)),
    integrations: auditLog.integrations,
    webhooks: undefined,
  };
}

function parseEntry(entry: auditLog.Entry): Entry {
  let extra;

  if (entry.options) {
    switch (entry.action_type) {
      case 13:
      case 14:
      case 15:
        extra = {
          id: entry.options.id,
          type: entry.options.type,
          roleName: entry.options.role_name,
        };
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
    changes: undefined,
    userId: entry.user_id,
    id: entry.id,
    actionType: actionTypeMap[entry.action_type],
    extra: extra,
    reason: entry.reason,
  };
}
