import {
  GuildChannel,
  PermissionOverwrite,
  unparseEditPermissionOverwrite,
} from "./GuildChannel.ts";
import type { AwaitMessagesOptions, Client } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";
import { NewsChannel, TextChannel } from "./TextNewsChannel.ts";
import { Message, SendMessageOptions } from "./Message.ts";
import { Invite, parseInvite } from "./Invite.ts";

export interface EditOptions {
  name?: string;
  type?: "text" | "news";
  position?: number | null;
  topic?: string | null;
  nsfw?: boolean | null;
  slowmode?: number | null;
  permissionOverwrites?: PermissionOverwrite[] | null;
  parentId?: Snowflake | null;
}

export abstract class TextBasedGuildChannel<
  T extends channel.TextBasedGuildChannel,
> extends GuildChannel<T> {
  /** The id of the newest message.
   * Is null if there are no messages in the channel.
   * It may point to an nonexisting message.
   */
  lastMessageId: Snowflake | null;
  /** The unix timestamp of the newest pinned message. */
  lastPinTimestamp?: number;
  /** The topic of the channel. Null if none is set. */
  topic: string | null;
  /** Whether or not the channel is Not Safe For Work. */
  nsfw: boolean;
  /** A map used to cache messages in this channel, indexed by their id. */
  messages = new Map<Snowflake, Message>();

  protected constructor(client: Client, data: T) {
    super(client, data);

    this.lastMessageId = data.last_message_id;
    this.lastPinTimestamp = data.last_pin_timestamp
      ? Date.parse(data.last_pin_timestamp)
      : undefined;
    this.topic = data.topic;
    this.nsfw = data.nsfw;
  }

  /** The string that mentions the channel. */
  get mention(): string {
    return `<#${this.id}>`;
  }

  /** Edits this channel. Returns a new instance. */
  async edit(
    options: EditOptions,
    reason?: string,
  ): Promise<TextChannel | NewsChannel> {
    const channel = await this.client.rest.modifyChannel(this.id, {
      name: options.name,
      type: options.type ? (options.type === "text" ? 0 : 5) : undefined,
      position: options.position,
      topic: options.topic,
      nsfw: options.nsfw,
      rate_limit_per_user: options.slowmode,
      permission_overwrites: unparseEditPermissionOverwrite(
        options.permissionOverwrites,
      ),
      parent_id: options.parentId,
    }, reason);

    if (channel.type === 0) {
      return new TextChannel(this.client, channel);
    } else {
      return new NewsChannel(this.client, channel as channel.NewsChannel);
    }
  }

  /** Starts the typing indicator. */
  async startTyping(): Promise<void> {
    await this.client.rest.triggerTypingIndicator(this.id);
  }

  /** Sends a new message to this channel. */
  async sendMessage(data: SendMessageOptions): Promise<Message> {
    return this.client.sendMessage(this.id, data);
  }

  /** Fetches the pinned messages of this channel. */
  async getPins(): Promise<Message[]> {
    const messages = await this.client.rest.getPinnedMessages(this.id);
    return messages.map((message) => new Message(this.client, message));
  }

  /** Deletes messages in bulk. */
  async bulkDeleteMessages(
    messageIds: Snowflake[],
    reason?: string,
  ): Promise<void> {
    await this.client.rest.bulkDeleteMessages(this.id, {
      messages: messageIds,
    }, reason);
  }

  /** Fetches the invites for this channel. */
  async getInvites(): Promise<Invite[]> {
    const invites = await this.client.rest.getChannelInvites(this.id);

    return invites.map((invite) => parseInvite(this.client, invite));
  }

  /** Awaits for messages that fit the bounds given by the parameters. */
  async awaitMessages(
    filter: (msg: Message) => boolean,
    options: AwaitMessagesOptions,
  ): Promise<Message[]> {
    return this.client.awaitMessages(this.id, filter, options);
  }
}
