import type { Client } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";
import {
  GuildChannel,
  PermissionOverwrite,
  unparseEditPermissionOverwrite,
} from "./GuildChannel.ts";

export class StoreChannel<T extends channel.StoreChannel = channel.StoreChannel>
  extends GuildChannel<T> {
  type = "store";
  nsfw: boolean;

  constructor(client: Client, data: T) {
    super(client, data);

    this.nsfw = data.nsfw;
  }

  async edit(options: {
    name?: string;
    position?: number | null;
    nsfw?: boolean | null;
    permissionOverwrites?: PermissionOverwrite[] | null;
    parentId: Snowflake | null;
  }, reason?: string): Promise<StoreChannel> {
    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      position: options.position,
      nsfw: options.nsfw,
      permission_overwrites: unparseEditPermissionOverwrite(
        options.permissionOverwrites,
      ),
      parent_id: options.parentId,
    }, reason);

    return new StoreChannel(this.client, channel as channel.StoreChannel);
  }

  async delete(reason?: string): Promise<StoreChannel> {
    const channel = await this.client.rest.deleteChannel(
      this.id,
      reason,
    ) as channel.StoreChannel;
    return new StoreChannel(this.client, channel);
  }
}
