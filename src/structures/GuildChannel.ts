import type { channel, Snowflake } from "../discord.ts";
import { Client } from "../Client.ts";
import { BaseChannel } from "./BaseChannel.ts";
import { permissionMap } from "./Role.ts";

export interface PermissionOverwrite {
  id: Snowflake;
  type: "role" | "member";
  permissions: Record<keyof typeof permissionMap, boolean | undefined>;
}

export function encodePermissionOverwrite(
  permissions: Record<keyof typeof permissionMap, boolean | undefined>,
) {
  let allow = 0n;
  let deny = 0n;

  for (const [key, val] of Object.entries(permissionMap)) {
    if (typeof permissions[key as keyof typeof permissionMap] === "boolean") {
      const bVal = BigInt(val);
      if (permissions[key as keyof typeof permissionMap]) {
        allow |= bVal;
      } else {
        deny |= bVal;
      }
    }
  }

  return {
    allow: allow.toString(),
    deny: deny.toString(),
  };
}

export abstract class GuildChannel extends BaseChannel {
  name: string;
  position: number;
  parentId: Snowflake | null;
  guildId: Snowflake;
  permissionOverwrites: PermissionOverwrite[];

  protected constructor(client: Client, data: channel.GuildChannel) {
    super(client, data);

    this.name = data.name;
    this.position = data.position;
    this.parentId = data.parent_id;
    this.guildId = data.guild_id;
    this.permissionOverwrites = data.permission_overwrites.map(
      ({ id, type, allow_new, deny_new }) => {
        const allow = BigInt(allow_new);
        const deny = BigInt(deny_new);
        const permissions = {} as Record<
          keyof typeof permissionMap,
          boolean | undefined
        >;

        for (const [key, val] of Object.entries(permissionMap)) {
          const bVal = BigInt(val);
          if ((allow & bVal) == bVal) {
            permissions[key as keyof typeof permissionMap] = true;
          } else if ((deny & bVal) == bVal) {
            permissions[key as keyof typeof permissionMap] = false;
          } else {
            permissions[key as keyof typeof permissionMap] = undefined;
          }
        }

        return {
          id,
          type,
          permissions,
        };
      },
    );
  }

  async editPermissions(overwrite: PermissionOverwrite) {
    const { allow, deny } = encodePermissionOverwrite(overwrite.permissions);

    await this.client.rest.editChannelPermissions(
      this.id,
      overwrite.id,
      {
        allow,
        deny,
        type: overwrite.type,
      },
    );
  }

  async deletePermissions(overwriteId: Snowflake) {
    await this.client.rest.deleteChannelPermission(this.id, overwriteId);
  }

  async getInvites() {
    return await this.client.rest.getChannelInvites(this.id);
  }

  async createInvite(options: {
    maxAge?: number;
    maxUses?: number;
    temporary?: boolean;
    unique?: boolean;
    targetUser?: Snowflake;
    targetUserType?: 1;
  } = {}) {
    return await this.client.rest.createChannelInvite(this.id, {
      max_age: options.maxAge,
      max_uses: options.maxAge,
      unique: options.unique,
      target_user: options.targetUser,
      target_user_type: options.targetUserType,
    });
  }
}
