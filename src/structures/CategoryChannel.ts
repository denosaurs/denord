import type { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import {
  GuildChannel,
  PermissionOverwrite,
  unparsePermissionOverwrite,
} from "./GuildChannel.ts";

export class CategoryChannel extends GuildChannel {
  constructor(client: Client, data: channel.CategoryChannel) {
    super(client, data);
  }

  async edit(options: {
    name?: string;
    position?: number | null;
    permissionOverwrites?: PermissionOverwrite[] | null;
  }) {
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
    });

    return new CategoryChannel(this.client, channel as channel.CategoryChannel);
  }
}
