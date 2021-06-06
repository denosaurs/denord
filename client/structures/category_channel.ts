import type { Client } from "../client.ts";
import type { channel } from "../../discord_typings/mod.ts";
import {
  GuildChannel,
  PermissionOverwrite,
  unparseEditPermissionOverwrite,
} from "./guild_channel.ts";

export class CategoryChannel<
  T extends channel.CategoryChannel = channel.CategoryChannel,
> extends GuildChannel<T> {
  /** The type of this channel. */
  type = "category" as const;

  constructor(client: Client, data: T) {
    super(client, data);
  }

  /** Edits this channel. Returns a new instance. */
  async edit(options: {
    name?: string;
    position?: number | null;
    permissionOverwrites?: PermissionOverwrite[] | null;
  }, reason?: string): Promise<CategoryChannel> {
    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      position: options.position,
      permission_overwrites: unparseEditPermissionOverwrite(
        options.permissionOverwrites,
      ),
    }, reason);

    return new CategoryChannel(this.client, channel as channel.CategoryChannel);
  }

  /** Deletes the channel. Returns a new instance. */
  async delete(reason?: string): Promise<CategoryChannel> {
    const channel = await this.client.rest.deleteChannel(
      this.id,
      reason,
    ) as channel.CategoryChannel;
    return new CategoryChannel(this.client, channel);
  }
}
