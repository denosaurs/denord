import { EditOptions, TextBasedGuildChannel } from "./TextBasedGuildChannel.ts";
import type { Client } from "../Client.ts";
import type { channel } from "../discord.ts";
import { Snowflake, webhook } from "../discord.ts";
import type { NewsChannel } from "./NewsChannel.ts";
import { parseWebhook } from "./Webhook.ts";

export class TextChannel<T extends channel.TextChannel = channel.TextChannel> extends TextBasedGuildChannel<T> {
  slowMode: number;

  constructor(client: Client, data: T) {
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
    const followedChannel = await this.client.rest.followNewsChannel(
      newsChannelId,
      {
        webhook_channel_id: this.id,
      },
    );
    return followedChannel.webhook_id;
  }

  async createWebhook(data: webhook.Create, reason?: string) {
    const webhook = await this.client.rest.createWebhook(this.id, data, reason);
    return parseWebhook(this.client, webhook);
  }

  async getWebhooks() {
    const webhooks = await this.client.rest.getChannelWebhooks(this.id);
    return webhooks.map((webhook) => parseWebhook(this.client, webhook));
  }
}
