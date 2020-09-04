import type { channel, Snowflake } from "../discord.ts";
import { Client } from "../Client.ts";
import { BaseChannel } from "./BaseChannel.ts";

export abstract class GuildChannel extends BaseChannel {
  name: string;
  position: number;
  parentId: Snowflake | null;
  guildId: Snowflake;
  permissionOverwrites: {
    id: Snowflake;
    type: "role" | "member";
    allow: bigint;
    deny: bigint;
  }[];

  protected constructor(client: Client, data: channel.GuildChannel) {
    super(client, data);

    this.name = data.name;
    this.position = data.position;
    this.parentId = data.parent_id;
    this.guildId = data.guild_id;
    this.permissionOverwrites = data.permission_overwrites.map(({id, type, allow_new, deny_new}) => ({
      id,
      type,
      allow: BigInt(allow_new),
      deny: BigInt(deny_new)
    }));
  }

  async editPermissions(
    overwriteId: Snowflake,
    options: Omit<channel.OverwriteSend, "id">,
  ) {
    await this.client.rest.editChannelPermissions(
      this.id,
      overwriteId,
      options,
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
