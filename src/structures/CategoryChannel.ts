import { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import { GuildChannel } from "./GuildChannel.ts";

export class CategoryChannel extends GuildChannel {
  constructor(client: Client, data: channel.CategoryChannel) {
    super(client, data);
  }

  async edit(options: {
    name?: string;
    position?: number | null;
    permissionOverwrites?: channel.OverwriteSend[] | null;
  }) {
    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      position: options.position,
      permission_overwrites: options.permissionOverwrites,
    });

    return new CategoryChannel(this.client, channel as channel.CategoryChannel);
  }
}
