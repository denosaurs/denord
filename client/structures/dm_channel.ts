import type { AwaitMessagesOptions, Client } from "../client.ts";
import type { channel, Snowflake } from "../../discord_typings/mod.ts";
import { User } from "./user.ts";
import { Message, SendMessageOptions } from "./message.ts";
import { SnowflakeBase } from "./base.ts";

export class DMChannel<T extends channel.DMChannel = channel.DMChannel>
  extends SnowflakeBase<T> {
  /** The type of this channel. */
  type = "dm" as const;
  /** The id of the newest message.
   * Is null if there are no messages in the channel.
   * It may point to an nonexisting message.
   */
  lastMessageId: Snowflake | null;
  /** The recipient for this dm channel. */
  recipient: User;
  /** The unix timestamp of the newest pinned message. */
  lastPinTimestamp?: number | null;
  /** A map used to cache messages in this channel, indexed by their id. */
  get messages(): Map<Snowflake, Message> {
    if (!this.client.messages.has(this.id)) {
      this.client.messages.set(this.id, new Map());
    }

    return this.client.messages.get(this.id)!;
  }

  constructor(client: Client, data: T) {
    super(client, data);

    this.lastMessageId = data.last_message_id;
    this.recipient = new User(client, data.recipients[0]);
    this.lastPinTimestamp = data.last_pin_timestamp // TODO: handle null?
      ? Date.parse(data.last_pin_timestamp)
      : undefined;
  }

  /** Starts the typing indicator. */
  async startTyping(): Promise<void> {
    await this.client.rest.triggerTypingIndicator(this.id);
  }

  /** Sends a new message to this channel. */
  sendMessage(data: SendMessageOptions): Promise<Message> {
    return this.client.sendMessage(this.id, data);
  }

  /** Fetches the pinned messages of this channel. */
  async getPins(): Promise<Message[]> {
    const messages = await this.client.rest.getPinnedMessages(this.id);
    return messages.map((message) => new Message(this.client, message));
  }

  /** Deletes this channel. */
  async delete(): Promise<DMChannel> {
    const channel = await this.client.rest.deleteChannel(
      this.id,
    ) as channel.DMChannel;
    return new DMChannel(this.client, channel);
  }

  /** Awaits for messages that fit the bounds given by the parameters. */
  awaitMessages(
    filter: (message: Message) => boolean,
    options: AwaitMessagesOptions,
  ): Promise<Message[]> {
    return this.client.awaitMessages(this.id, filter, options);
  }
}
