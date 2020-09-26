import type { invite, Snowflake } from "../discord.ts";
import { User } from "./User.ts";
import type { Client } from "../Client.ts";

export interface Invite {
  code: string;
  guildId: Snowflake;
  channelId: Snowflake;
  inviter?: User;
  targetUserId?: Snowflake;
  targetUserType?: "stream";
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
    Pick<Invite, "code" | "inviter" | "targetUserId" | "targetUserType">,
    Metadata {
  guildId: Snowflake;
  channelId: Snowflake;
}

export type MetadataInvite = Metadata & Invite;

export function parseInvite(
  client: Client,
  {
    code,
    channel,
    guild,
    inviter,
    target_user,
    target_user_type,
    approximate_member_count,
    approximate_presence_count,
  }: invite.Invite,
): Invite {
  return {
    code,
    guildId: guild?.id!,
    channelId: channel.id!,
    inviter: inviter && new User(client, inviter),
    targetUserId: target_user?.id,
    targetUserType: target_user_type && "stream",
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
