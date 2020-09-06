import {
  encodePermissionOverwrite,
  GuildChannel,
  PermissionOverwrite,
} from "./GuildChannel.ts";
import { Client, SendMessage } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";
import { TextChannel } from "./TextChannel.ts";
import { NewsChannel } from "./NewsChannel.ts";

export interface EditOptions {
  name?: string;
  type?: "text" | "news";
  position?: number | null;
  topic?: string | null;
  nsfw?: boolean | null;
  slowMode?: number | null;
  permissionOverwrites?: PermissionOverwrite[] | null;
  parentId?: Snowflake | null;
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

  async edit(options: EditOptions): Promise<TextChannel | NewsChannel> {
    const permissionOverwrites =
      options.permissionOverwrites?.map(({ permissions, id, type }) => {
        const { allow, deny } = encodePermissionOverwrite(permissions);

        return {
          id,
          type,
          allow,
          deny,
        };
      }) ?? (options.permissionOverwrites as undefined | null);

    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      type: options.type ? (options.type === "text" ? 0 : 5) : undefined,
      position: options.position,
      topic: options.topic,
      nsfw: options.nsfw,
      rate_limit_per_user: options.slowMode,
      permission_overwrites: permissionOverwrites,
      parent_id: options.parentId,
    });

    if (channel.type === 0) {
      return new TextChannel(this.client, channel);
    } else {
      return new NewsChannel(this.client, channel as channel.NewsChannel);
    }
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
      messages: messageIds,
    });
  }
}
