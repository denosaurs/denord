import {
  GuildChannel,
  PermissionOverwrite,
  unparsePermissionOverwrite,
} from "./GuildChannel.ts";
import type { AwaitMessagesOptions, Client } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";
import { TextChannel } from "./TextChannel.ts";
import { NewsChannel } from "./NewsChannel.ts";
import { Message, SendMessageOptions } from "./Message.ts";
import { parseInvite } from "./Invite.ts";

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

export abstract class TextBasedGuildChannel<
  T extends channel.TextBasedGuildChannel,
> extends GuildChannel<T> {
  lastMessageId: Snowflake | null;
  lastPinTimestamp?: number;
  topic: string | null;
  messages = new Map<Snowflake, Message>();

  protected constructor(client: Client, data: T) {
    super(client, data);

    this.lastMessageId = data.last_message_id;
    this.lastPinTimestamp = data.last_pin_timestamp
      ? Date.parse(data.last_pin_timestamp)
      : undefined;
    this.topic = data.topic;
  }

  async edit(
    options: EditOptions,
    reason?: string,
  ): Promise<TextChannel | NewsChannel> {
    const permissionOverwrites =
      options.permissionOverwrites?.map(({ permissions, id, type }) => {
        const { allow, deny } = unparsePermissionOverwrite(permissions);

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
    }, reason);

    if (channel.type === 0) {
      return new TextChannel(this.client, channel);
    } else {
      return new NewsChannel(this.client, channel as channel.NewsChannel);
    }
  }

  async startTyping() {
    await this.client.rest.triggerTypingIndicator(this.id);
  }

  async sendMessage(data: SendMessageOptions) {
    return this.client.sendMessage(this.id, data);
  }

  async getPins() {
    const messages = await this.client.rest.getPinnedMessages(this.id);
    return messages.map((message) => new Message(this.client, message));
  }

  async bulkDeleteMessages(messageIds: Snowflake[], reason?: string) {
    await this.client.rest.bulkDeleteMessages(this.id, {
      messages: messageIds,
    }, reason);
  }

  async getInvites() {
    const invites = await this.client.rest.getChannelInvites(this.id);

    return invites.map((invite) => parseInvite(this.client, invite));
  }

  async awaitMessages(
    filter: (msg: Message) => boolean,
    options: AwaitMessagesOptions,
  ): Promise<Message[]> {
    return this.client.awaitMessages(this.id, filter, options);
  }
}
