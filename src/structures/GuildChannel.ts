import type { channel, Snowflake } from "../discord.ts";
import type { Client } from "../Client.ts";
import { permissionMap } from "./Role.ts";
import { SnowflakeBase } from "./Base.ts";

export interface PermissionOverwrite {
  id: Snowflake;
  type: "role" | "member";
  permissions: Record<keyof typeof permissionMap, boolean | undefined>;
}

function parsePermissionOverwrite(allow: string, deny: string) {
  const bAllow = BigInt(allow);
  const bDeny = BigInt(deny);

  const permissions = {} as Record<
    keyof typeof permissionMap,
    boolean | undefined
  >;

  for (const [key, val] of Object.entries(permissionMap)) {
    const bVal = BigInt(val);
    if ((bAllow & bVal) === bVal) {
      permissions[key as keyof typeof permissionMap] = true;
    } else if ((bDeny & bVal) === bVal) {
      permissions[key as keyof typeof permissionMap] = false;
    } else {
      permissions[key as keyof typeof permissionMap] = undefined;
    }
  }

  return permissions;
}

export function unparsePermissionOverwrite(
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

export function unparseEditPermissionOverwrite(
  permissionOverwrites?: PermissionOverwrite[] | null,
) {
  return permissionOverwrites?.map(({ permissions, id, type }) => {
    const { allow, deny } = unparsePermissionOverwrite(permissions);

    return {
      id,
      type,
      allow,
      deny,
    };
  }) ?? (permissionOverwrites as undefined | null);
}

export abstract class GuildChannel<T extends channel.GuildChannel>
  extends SnowflakeBase<T> {
  name: string;
  position: number;
  parentId: Snowflake | null;
  guildId: Snowflake;
  permissionOverwrites: PermissionOverwrite[];

  protected constructor(client: Client, data: T) {
    super(client, data);

    this.name = data.name;
    this.position = data.position;
    this.parentId = data.parent_id;
    this.guildId = data.guild_id;
    this.permissionOverwrites = data.permission_overwrites.map((
      { id, type, allow_new, deny_new },
    ) => ({
      id,
      type,
      permissions: parsePermissionOverwrite(allow_new, deny_new),
    }));
  }

  async editPermissions(overwrite: PermissionOverwrite, reason?: string) {
    const { allow, deny } = unparsePermissionOverwrite(overwrite.permissions);

    await this.client.rest.editChannelPermissions(
      this.id,
      overwrite.id,
      {
        allow,
        deny,
        type: overwrite.type,
      },
      reason,
    );
  }

  async deletePermissions(overwriteId: Snowflake, reason?: string) {
    await this.client.rest.deleteChannelPermission(
      this.id,
      overwriteId,
      reason,
    );
  }

  async createInvite(options: {
    maxAge?: number;
    maxUses?: number;
    temporary?: boolean;
    unique?: boolean;
    targetUser?: Snowflake;
    targetUserType?: 1;
  } = {}, reason?: string) {
    return await this.client.rest.createChannelInvite(this.id, {
      max_age: options.maxAge,
      max_uses: options.maxAge,
      unique: options.unique,
      target_user: options.targetUser,
      target_user_type: options.targetUserType,
    }, reason);
  }
}
