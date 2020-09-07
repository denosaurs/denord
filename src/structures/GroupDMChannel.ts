import { BaseChannel } from "./BaseChannel.ts";
import type { Client, SendMessage } from "../Client.ts";
import type { channel, Snowflake } from "../discord.ts";
import { User } from "./User.ts";

export class GroupDMChannel extends BaseChannel {
  lastMessageId: Snowflake | null;
  recipients: Map<Snowflake, User>;
  lastPinTimestamp?: number;
  name: string | null;
  icon: string | null;
  ownerId: Snowflake;

  constructor(client: Client, data: channel.GroupDMChannel) {
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
    return this.client.getPins(this.id);
  }
}
