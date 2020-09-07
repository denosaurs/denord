import { EditOptions, TextBasedGuildChannel } from "./TextBasedGuildChannel.ts";
import type { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import type { TextChannel } from "./TextChannel.ts";

export class NewsChannel extends TextBasedGuildChannel {
  constructor(client: Client, data: channel.NewsChannel) {
    super(client, data);
  }

  async edit(options: EditOptions & { type?: "news" }): Promise<NewsChannel>;
  async edit(options: EditOptions & { type: "text" }): Promise<TextChannel>;
  async edit(options: EditOptions): Promise<TextChannel | NewsChannel> {
    return super.edit(options);
  }

  async delete() {
    const channel = await this.client.rest.deleteChannel(this.id) as channel.NewsChannel;
    return new NewsChannel(this.client, channel);
  }
}
