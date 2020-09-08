import { EditOptions, TextBasedGuildChannel } from "./TextBasedGuildChannel.ts";
import type { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import { Snowflake } from "../discord.ts";
import type { NewsChannel } from "./NewsChannel.ts";

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

  async delete(reason?: string) {
    const channel = await this.client.rest.deleteChannel(
      this.id,
      reason,
    ) as channel.TextChannel;
    return new TextChannel(this.client, channel);
  }

  async follow(newsChannelId: Snowflake) {
    const followedChannel = await this.client.rest.followNewsChannel(newsChannelId, {
      webhook_channel_id: this.id,
    });

    return followedChannel.webhook_id;
  }
}
