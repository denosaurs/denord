import { EditOptions, TextBasedGuildChannel } from "./TextBasedGuildChannel.ts";
import type { Client } from "../Client.ts";
import type { channel, Snowflake, webhook } from "../../discord_typings/mod.ts";
import { parseWebhook, Webhook } from "./Webhook.ts";

export class TextChannel<T extends channel.TextChannel = channel.TextChannel>
  extends TextBasedGuildChannel<T> {
  /** The type of this channel. */
  type = "text" as const;
  /** The amount of seconds a user has to wait before sending another message. */
  slowmode: number;

  constructor(client: Client, data: T) {
    super(client, data);

    this.slowmode = data.rate_limit_per_user;
  }

  /**
   * Edits this channel. Returns a new instance.
   * If options.type is news, a NewsChannel is returned instead.
   */
  async edit(
    options: EditOptions & { type?: "text" },
    reason?: string,
  ): Promise<TextChannel>;
  async edit(
    options: EditOptions & { type: "news" },
    reason?: string,
  ): Promise<NewsChannel>;
  async edit(
    options: EditOptions,
    reason?: string,
  ): Promise<TextChannel | NewsChannel> {
    return super.edit(options, reason);
  }

  /** Deletes the channel. Returns a new instance. */
  async delete(reason?: string): Promise<TextChannel> {
    const channel = await this.client.rest.deleteChannel(
      this.id,
      reason,
    ) as channel.TextChannel;
    return new TextChannel(this.client, channel);
  }

  /** Follows a news channel. */
  async follow(newsChannelId: Snowflake): Promise<Snowflake> {
    const followedChannel = await this.client.rest.followNewsChannel(
      newsChannelId,
      {
        webhook_channel_id: this.id,
      },
    );
    return followedChannel.webhook_id;
  }

  /** Creates a new webhook. */
  async createWebhook(data: webhook.Create, reason?: string): Promise<Webhook> {
    const webhook = await this.client.rest.createWebhook(this.id, data, reason);
    return parseWebhook(this.client, webhook);
  }

  /** Fetches all webhooks in this channel. */
  async getWebhooks(): Promise<Webhook[]> {
    const webhooks = await this.client.rest.getChannelWebhooks(this.id);
    return webhooks.map((webhook) => parseWebhook(this.client, webhook));
  }
}

export class NewsChannel<T extends channel.NewsChannel = channel.NewsChannel>
  extends TextBasedGuildChannel<T> {
  /** The type of this channel. */
  type = "news" as const;

  constructor(client: Client, data: T) {
    super(client, data);
  }

  /**
   * Edits this channel. Returns a new instance.
   * If options.type is text, a TextChannel is returned instead.
   */
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

  /** Deletes the channel. Returns a new instance. */
  async delete(reason?: string): Promise<NewsChannel> {
    const channel = await this.client.rest.deleteChannel(
      this.id,
      reason,
    ) as channel.NewsChannel;
    return new NewsChannel(this.client, channel);
  }
}
