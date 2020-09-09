import type { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import {
  GuildChannel,
  PermissionOverwrite,
  unparsePermissionOverwrite,
} from "./GuildChannel.ts";

export class CategoryChannel<T extends channel.CategoryChannel = channel.CategoryChannel> extends GuildChannel<T> {
  type = "category";

  constructor(client: Client, data: T) {
    super(client, data);
  }

  async edit(options: {
    name?: string;
    position?: number | null;
    permissionOverwrites?: PermissionOverwrite[] | null;
  }, reason?: string) {
    const permissionOverwrites =
      options.permissionOverwrites?.map(({ permissions, id, type }) => {
        const { allow, deny } = unparsePermissionOverwrite(permissions);

        return {
          id,
          type,
          allow,
          deny,
        };
      }) ?? (options.permissionOverwrites as undefined | null);

    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      position: options.position,
      permission_overwrites: permissionOverwrites,
    }, reason);

    return new CategoryChannel(this.client, channel as channel.CategoryChannel);
  }
}
