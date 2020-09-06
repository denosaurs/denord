import { EditOptions, TextBasedGuildChannel } from "./TextBasedGuildChannel.ts";
import { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import { NewsChannel } from "./NewsChannel.ts";

export class TextChannel extends TextBasedGuildChannel {
  slowMode: number;

  constructor(client: Client, data: channel.TextChannel) {
    super(client, data);

    this.slowMode = data.rate_limit_per_user;
  }

  async edit(options: EditOptions & { type?: "text" }): Promise<TextChannel>;
  async edit(options: EditOptions & { type: "news" }): Promise<NewsChannel>;
  async edit(options: EditOptions): Promise<TextChannel | NewsChannel> {
    return super.edit(options);
  }
}
