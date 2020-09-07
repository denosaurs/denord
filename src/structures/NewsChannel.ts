import { EditOptions, TextBasedGuildChannel } from "./TextBasedGuildChannel.ts";
import type { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import type { TextChannel } from "./TextChannel.ts";

export class NewsChannel extends TextBasedGuildChannel {
  constructor(client: Client, data: channel.NewsChannel) {
    super(client, data);
  }

  async edit(
    options: EditOptions & { type?: "news" },
    reason?: string,
  ): Promise<NewsChannel>;
  async edit(
    options: EditOptions & { type: "text" },
    reason?: string,
  ): Promise<TextChannel>;
  async edit(
    options: EditOptions,
    reason?: string,
  ): Promise<TextChannel | NewsChannel> {
    return super.edit(options, reason);
  }

  async delete(reason?: string) {
    const channel = await this.client.rest.deleteChannel(
      this.id,
      reason,
    ) as channel.NewsChannel;
    return new NewsChannel(this.client, channel);
  }
}
