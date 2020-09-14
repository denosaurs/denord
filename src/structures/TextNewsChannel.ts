import { EditOptions, TextBasedGuildChannel } from "./TextBasedGuildChannel.ts";
import type { Client } from "../Client.ts";
import type { channel, Snowflake, webhook } from "../discord.ts";
import { parseWebhook } from "./Webhook.ts";

export class TextChannel<T extends channel.TextChannel = channel.TextChannel>
  extends TextBasedGuildChannel<T> {
  type = "text";
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

export class NewsChannel<T extends channel.NewsChannel = channel.NewsChannel>
  extends TextBasedGuildChannel<T> {
  type = "news";

  constructor(client: Client, data: T) {
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
