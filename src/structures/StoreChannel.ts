import { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import { Snowflake } from "../discord.ts";
import { GuildChannel } from "./GuildChannel.ts";

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
    permissionOverwrites?: channel.OverwriteSend[] | null;
    parentId: Snowflake | null;
  }) {
    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      position: options.position,
      nsfw: options.nsfw,
      permission_overwrites: options.permissionOverwrites,
      parent_id: options.parentId,
    });

    return new StoreChannel(this.client, channel as channel.StoreChannel);
  }
}
