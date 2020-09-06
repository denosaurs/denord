import { EditOptions, TextBasedGuildChannel } from "./TextBasedGuildChannel.ts";
import { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import { TextChannel } from "./TextChannel.ts";

export class NewsChannel extends TextBasedGuildChannel {
  constructor(client: Client, data: channel.NewsChannel) {
    super(client, data);
  }

  async edit(options: EditOptions & { type?: "news" }): Promise<NewsChannel>;
  async edit(options: EditOptions & { type: "text" }): Promise<TextChannel>;
  async edit(options: EditOptions): Promise<TextChannel | NewsChannel> {
    return super.edit(options);
  }
}
