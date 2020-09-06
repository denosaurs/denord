import { SnowflakeBase } from "./Base.ts";
import { Client } from "../Client.ts";
import type { message, Snowflake } from "../discord.ts";
import { User } from "./User.ts";
import { GuildMember } from "./GuildMember.ts";
import { decodeEmbed, Embed, encodeEmbed } from "./Embed.ts";

const messageTypeMap = {
  0: "normal",
  1: "addRecipient",
  2: "removeRecipient",
  3: "call",
  4: "channelChangeName",
  5: "channelChangeIcon",
  6: "channelPinnedMessage",
  7: "guildMemberJoin",
  8: "guildMemberBoost",
  9: "guildBoostLevel1",
  10: "guildBoostLevel2",
  11: "guildBoostLevel3",
  12: "channelAddFollow",
  14: "guildDiscoveryDisqualified",
  15: "guildDiscoveryRequalified",
} as const;

const activityTypeMap = {
  1: "join",
  2: "spectate",
  3: "listen",
  5: "joinRequest",
} as const;

const flagsMap = {
  "crossposted": 0x01,
  "isCrosspost": 0x02,
  "suppressEmbeds": 0x04,
  "sourceMessageDeleted": 0x08,
  "urgent": 0x10,
} as const;

export class Message extends SnowflakeBase {
  channelId: Snowflake;
  guildId?: Snowflake;
  author: User;
  byWebhook: boolean;
  member?: GuildMember;
  content: string;
  editedAt: number | null;
  tts: boolean;
  mentions: {
    everyone: boolean;
    users: User[];
    roles: Snowflake[];
    channels?: Snowflake[];
  };
  attachments: {
    id: Snowflake;
    filename: string;
    size: number;
    url: string;
    proxyUrl: string;
    height: number | null;
    width: number | null;
  }[];
  embeds: Embed[];
  reactions: message.Reaction[]; // TODO
  pinned: boolean;
  type: typeof messageTypeMap[keyof typeof messageTypeMap];
  activity?: {
    type: typeof activityTypeMap[keyof typeof activityTypeMap];
    partyId?: string;
  };
  application?: {
    id: Snowflake;
    coverImage?: string;
    description: string;
    icon: string | null;
    name: string;
  };
  reference?: {
    messageId?: Snowflake;
    channelId: Snowflake;
    guildId?: Snowflake;
  };
  flags = {} as Record<keyof typeof flagsMap, boolean>;

  constructor(client: Client, data: message.Message) {
    super(client, data);

    this.channelId = data.channel_id;
    this.guildId = data.guild_id;
    this.author = new User(client, data.author);
    this.member = data.member && new GuildMember(client, {
      ...data.member,
      user: data.author,
    }, data.guild_id!);
    this.content = data.content;
    // timestamp
    this.editedAt = data.edited_timestamp
      ? Date.parse(data.edited_timestamp)
      : null;
    this.tts = data.tts;
    this.mentions = {
      everyone: data.mention_everyone,
      users: data.mentions.map((user) => new User(client, user)),
      roles: data.mention_roles,
      channels: data.mention_channels?.map((mention) => mention.id),
    };
    this.attachments = data.attachments.map(({ proxy_url, ...attachment }) => ({
      ...attachment,
      proxyUrl: proxy_url,
    }));
    this.embeds = data.embeds.map((embed) => decodeEmbed(embed));
    this.reactions = data.reactions ?? [];
    // nonce
    this.pinned = data.pinned;
    this.byWebhook = !!data.webhook_id;
    this.type = messageTypeMap[data.type];
    this.activity = data.activity && {
      type: activityTypeMap[data.activity.type],
      partyId: data.activity.party_id,
    };
    this.application = data.application && {
      id: data.application.id,
      coverImage: data.application.cover_image,
      description: data.application.description,
      icon: data.application.icon,
      name: data.application.name,
    };
    this.reference = data.message_reference && {
      messageId: data.message_reference.message_id,
      channelId: data.message_reference.channel_id,
      guildId: data.message_reference.guild_id,
    };

    const flags = data.flags ?? 0;

    for (const [key, val] of Object.entries(flagsMap)) {
      this.flags[key as keyof typeof flagsMap] = ((flags & +val) === +val);
    }
  }

  async delete() {
    await this.client.rest.deleteMessage(this.channelId, this.id);
  }

  async edit(options: {
    content?: string;
    embed?: Embed;
    suppressEmbeds?: boolean;
  }) {
    let flags = 0;

    for (const [key, val] of Object.entries(this.flags)) {
      if (val) {
        flags |= flagsMap[key as keyof typeof flagsMap];
      }
    }

    if (
      options.suppressEmbeds !== undefined &&
      options.suppressEmbeds !== this.flags.suppressEmbeds
    ) {
      flags ^= flagsMap["suppressEmbeds"];
    }

    const message = await this.client.rest.editMessage(
      this.channelId,
      this.id,
      {
        content: options.content,
        embed: options.embed && encodeEmbed(options.embed),
        flags,
      },
    );

    return new Message(this.client, message);
  }

  async pin() {
    await this.client.rest.addPinnedChannelMessage(this.channelId, this.id);
  }

  async unpin() {
    await this.client.rest.deletePinnedChannelMessage(this.channelId, this.id);
  }

  async addReaction(emoji: string) {
    await this.client.rest.createReaction(this.channelId, this.id, emoji);
  }

  async removeReaction(emoji: string, userId?: Snowflake) {
    if (userId) {
      await this.client.rest.deleteUserReaction(
        this.channelId,
        this.id,
        emoji,
        userId,
      );
    } else {
      await this.client.rest.deleteOwnReaction(this.channelId, this.id, emoji);
    }
  }

  async removeAllReactions(emoji?: string) {
    if (emoji) {
      await this.client.rest.deleteAllReactionsForEmoji(
        this.channelId,
        this.id,
        emoji,
      );
    } else {
      await this.client.rest.deleteAllReactions(this.channelId, this.id);
    }
  }
}
