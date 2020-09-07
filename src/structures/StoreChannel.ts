import type { Client } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";
import {
  GuildChannel,
  PermissionOverwrite,
  unparsePermissionOverwrite,
} from "./GuildChannel.ts";

export class StoreChannel extends GuildChannel {
  nsfw: boolean;

  constructor(client: Client, data: channel.StoreChannel) {
    super(client, data);

    this.nsfw = data.nsfw;
  }

  async edit(options: {
    name?: string;
    position?: number | null;
    nsfw?: boolean | null;
    permissionOverwrites?: PermissionOverwrite[] | null;
    parentId: Snowflake | null;
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
      nsfw: options.nsfw,
      permission_overwrites: permissionOverwrites,
      parent_id: options.parentId,
    });

    return new StoreChannel(this.client, channel as channel.StoreChannel);
  }
}
