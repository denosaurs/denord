import type { AwaitMessagesOptions, Client } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";
import { User } from "./User.ts";
import { Message, SendMessageOptions } from "./Message.ts";
import { SnowflakeBase } from "./Base.ts";
import { ImageFormat, ImageSize, imageURLFormatter } from "../utils/utils.ts";

export class GroupDMChannel<
  T extends channel.GroupDMChannel = channel.GroupDMChannel,
> extends SnowflakeBase<T> {
  /** The type of this channel. */
  type = "groupDM" as const;
  /** The id of the newest message.
   * Is null if there are no messages in the channel.
   * It may point to an nonexisting message.
   */
  lastMessageId: Snowflake | null;
  /** A map of the recipients for this group dm channel indexed by their id. */
  recipients: Map<Snowflake, User>;
  /** The unix timestamp of the newest pinned message. */
  lastPinTimestamp?: number;
  /** The name of the channel. Is null if no name is set. */
  name: string | null;
  /** The icon hash of the channel. Is null if no name is set. */
  icon: string | null;
  /** The id of the owner of the group dm channel. */
  ownerId: Snowflake;
  /** A map of messages in this channel, indexed by their id. */
  messages = new Map<Snowflake, Message>();

  constructor(client: Client, data: T) {
    super(client, data);

    this.lastMessageId = data.last_message_id;
    this.recipients = new Map(
      data.recipients.map(
        (recipient) => [recipient.id, new User(client, recipient)],
      ),
    );
    this.lastPinTimestamp = data.last_pin_timestamp
      ? Date.parse(data.last_pin_timestamp)
      : undefined;
    this.name = data.name;
    this.icon = data.icon;
    this.ownerId = data.owner_id;
  }

  /** Adds a recipient to the dm group. */
  async addRecipient(
    userId: Snowflake,
    accessToken: Snowflake,
    nick?: string,
  ): Promise<void> {
    await this.client.rest.groupDMAddRecipient(this.id, userId, {
      access_token: accessToken,
      nick,
    });
  }

  /** The url for the icon of the dm group channel. */
  iconURL(options: {
    format?: Exclude<ImageFormat, "gif">;
    size?: ImageSize;
  } = {}): string | null {
    return this.icon
      ? imageURLFormatter(`channel-icons/${this.id}/${this.icon}`, options)
      : null;
  }

  /** Removes a recipient from the dm group. */
  async removeRecipient(userId: Snowflake): Promise<void> {
    await this.client.rest.groupDMRemoveRecipient(this.id, userId);
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
  async delete(): Promise<GroupDMChannel> {
    const channel = await this.client.rest.deleteChannel(
      this.id,
    ) as channel.GroupDMChannel;
    return new GroupDMChannel(this.client, channel);
  }

  /** Awaits for messages that fit the bounds given by the parameters. */
  awaitMessages(
    filter: (msg: Message) => boolean,
    options: AwaitMessagesOptions,
  ): Promise<Message[]> {
    return this.client.awaitMessages(this.id, filter, options);
  }
}
