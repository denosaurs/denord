import { EditOptions, TextBasedGuildChannel } from "./TextBasedGuildChannel.ts";
import { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import { TextChannel } from "./TextChannel.ts";

export class NewsChannel extends TextBasedGuildChannel {
  constructor(client: Client, data: channel.NewsChannel) {
    super(client, data);
  }

  async edit(options: EditOptions & {type?: "news"}): Promise<NewsChannel>;
  async edit(options: EditOptions & {type: "text"}): Promise<TextChannel>;
  async edit(options: EditOptions): Promise<TextChannel | NewsChannel> {
    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      type: options.type ? (options.type === "text" ? 0 : 5) : undefined,
      position: options.position,
      topic: options.topic,
      nsfw: options.nsfw,
      rate_limit_per_user: options.slowMode,
      permission_overwrites: options.permissionOverwrites,
      parent_id: options.parentId,
    });

    if (options.type === undefined || options.type === "news") {
      return new NewsChannel(this.client, channel as channel.NewsChannel);
    } else {
      return new TextChannel(this.client, channel as channel.TextChannel);
    }
  }
}
