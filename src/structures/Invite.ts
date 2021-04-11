import type { invite, Snowflake } from "../discord.ts";
import { oauth2 } from "../discord.ts";
import { User } from "./User.ts";
import type { Client } from "../Client.ts";
import { inverseMap } from "../utils/utils.ts";

export interface Invite {
  code: string;
  guildId: Snowflake;
  channelId: Snowflake;
  inviter?: User;
  targetType?: keyof typeof inverseTargetTypeMap;
  targetUserId?: Snowflake;
  targetApplication?: Partial<oauth2.Application>; // TODO
  approximatePresenceCount?: number;
  approximateMemberCount?: number;
}

export interface Metadata {
  uses: number;
  maxUses: number;
  maxAge: number;
  temporary: boolean;
  createdAt: number;
}

export interface InviteCreate
  extends
    Pick<Invite, "code" | "inviter" | "targetUserId" | "targetType">,
    Metadata {
  guildId?: Snowflake;
  channelId: Snowflake;
}

export type MetadataInvite = Metadata & Invite;

export const targetTypeMap = {
  1: "stream",
  2: "embeddedApplication",
} as const;
export const inverseTargetTypeMap = inverseMap(targetTypeMap);

export function parseInvite(
  client: Client,
  {
    code,
    channel,
    guild,
    inviter,
    target_type,
    target_user,
    target_application,
    approximate_member_count,
    approximate_presence_count,
  }: invite.Invite,
): Invite {
  return {
    code,
    guildId: guild?.id!,
    channelId: channel.id!,
    inviter: inviter && new User(client, inviter),
    targetType: target_type && targetTypeMap[target_type],
    targetUserId: target_user?.id,
    targetApplication: target_application,
    approximateMemberCount: approximate_member_count,
    approximatePresenceCount: approximate_presence_count,
  };
}

export function parseMetadata(
  { uses, max_uses, max_age, temporary, created_at }: invite.Metadata,
): Metadata {
  return {
    uses,
    maxUses: max_uses,
    maxAge: max_age,
    temporary,
    createdAt: Date.parse(created_at),
  };
}

export function parseMetadataInvite(
  client: Client,
  { uses, max_uses, max_age, temporary, created_at, ...invite }:
    invite.MetadataInvite,
): MetadataInvite {
  return {
    ...parseMetadata({ uses, max_uses, max_age, temporary, created_at }),
    ...parseInvite(client, invite),
  };
}
