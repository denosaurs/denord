import type { Client } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";
import { User } from "./User.ts";
import { Message, SendMessage } from "./Message.ts";
import { SnowflakeBase } from "./Base.ts";

export class GroupDMChannel<T extends channel.GroupDMChannel = channel.GroupDMChannel> extends SnowflakeBase<T> {
  type = "groupDM";
  lastMessageId: Snowflake | null;
  recipients: Map<Snowflake, User>;
  lastPinTimestamp?: number;
  name: string | null;
  icon: string | null;
  ownerId: Snowflake;
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

  async addRecipient(userId: Snowflake, accessToken: Snowflake, nick?: string) {
    await this.client.rest.groupDMAddRecipient(this.id, userId, {
      access_token: accessToken,
      nick,
    });
  }

  async removeRecipient(userId: Snowflake) {
    await this.client.rest.groupDMRemoveRecipient(this.id, userId);
  }

  async startTyping() {
    await this.client.rest.triggerTypingIndicator(this.id);
  }

  async sendMessage(data: SendMessage) {
    return this.client.sendMessage(this.id, data);
  }

  async getPins() {
    const messages = await this.client.rest.getPinnedMessages(this.id);
    return messages.map((message) => new Message(this.client, message));
  }

  async delete() {
    const channel = await this.client.rest.deleteChannel(
      this.id,
    ) as channel.GroupDMChannel;
    return new GroupDMChannel(this.client, channel);
  }
}
