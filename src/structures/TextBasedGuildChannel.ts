import { GuildChannel } from "./GuildChannel.ts";
import { Client, SendMessage } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";

export interface EditOptions {
  name?: string;
  type?: "text" | "news";
  position?: number | null;
  topic?: string | null;
  nsfw?: boolean | null;
  slowMode?: number | null;
  permissionOverwrites?: channel.OverwriteSend[] | null;
  parentId: Snowflake | null;
}

export abstract class TextBasedGuildChannel extends GuildChannel {
  lastMessageId: Snowflake | null;
  lastPinTimestamp?: number;
  topic: string | null;

  protected constructor(client: Client, data: channel.TextBasedGuildChannel) {
    super(client, data);

    this.lastMessageId = data.last_message_id;
    this.lastPinTimestamp = data.last_pin_timestamp
      ? Date.parse(data.last_pin_timestamp)
      : undefined;
    this.topic = data.topic;
  }

  async startTyping() {
    await this.client.rest.triggerTypingIndicator(this.id);
  }

  async sendMessage(data: SendMessage) {
    return this.client.sendMessage(this.id, data);
  }

  async getPins() {
    return this.client.getPins(this.id);
  }

  async bulkDeleteMessages(messageIds: Snowflake[]) {
    await this.client.rest.bulkDeleteMessages(this.id, {
      messages: messageIds
    });
  }
}

