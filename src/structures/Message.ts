import { SnowflakeBase } from "./Base.ts";
import type { Client } from "../Client.ts";
import type { message, Snowflake } from "../discord.ts";
import { User } from "./User.ts";
import { GuildMember } from "./GuildMember.ts";
import { Embed, parseEmbed, unparseEmbed } from "./Embed.ts";

export interface SendMessage {
  tts?: boolean;
  allowedMentions?: message.AllowedMentions;
  content?: string;
  file?: File;
  embed?: Embed;
}

export type SendMessageOptions =
  | SendMessage & Required<Pick<SendMessage, "content">>
  | SendMessage & Required<Pick<SendMessage, "file">>
  | SendMessage & Required<Pick<SendMessage, "embed">>;

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

export class Message<T extends message.Message = message.Message>
  extends SnowflakeBase<T> {
  /** The id of the channel this message was sent in. */
  channelId: Snowflake;
  /** The id of the guild if the message was sent in a guild channel. */
  guildId?: Snowflake;
  /** The author of the message. */
  author: User;
  /** Whether or not this message was made by a webhook. */
  byWebhook: boolean;
  /** The member associated to the author, if the message was sent in a guild channel. */
  member?: GuildMember;
  /** The content of the message. */
  content: string;
  /** The unix timestamp of when the message was last edited. Null if it hasn't been edited. */
  editedAt: number | null;
  /** Whether or not this message has Text-To-speech enabled. */
  tts: boolean;
  /** The mentions of the message. */
  mentions: {
    everyone: boolean;
    users: User[];
    roles: Snowflake[];
    channels?: Snowflake[];
  };
  /** An array of attachments in the message. */
  attachments: {
    id: Snowflake;
    filename: string;
    size: number;
    url: string;
    proxyUrl: string;
    height: number | null;
    width: number | null;
  }[];
  /** An array of embeds in the message. */
  embeds: Embed[];
  /** A map of reactions in the message, primarily indexed by id, else by name. */
  reactions: Map<Snowflake | string, message.Reaction>;
  /** Whether or not this message is pinned in the channel. */
  pinned: boolean;
  /** The type of message. */
  type: typeof messageTypeMap[keyof typeof messageTypeMap];
  /** sent with Rich Presence-related chat embeds. */
  activity?: {
    type: typeof activityTypeMap[keyof typeof activityTypeMap];
    partyId?: string;
  };
  /** sent with Rich Presence-related chat embeds. */
  application?: {
    id: Snowflake;
    coverImage?: string;
    description: string;
    icon: string | null;
    name: string;
  };
  /**
   * The reference of the message. Available if the message is crossposted or
   * if the message type is channelPinnedMessage.
   */
  reference?: {
    messageId?: Snowflake;
    channelId: Snowflake;
    guildId?: Snowflake;
  };
  /**
   * An object of flags the message can have.
   * If the message has a flag, that flag is set to true.
   */
  flags = {} as Record<keyof typeof flagsMap, boolean>;

  constructor(client: Client, data: T) {
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
    this.embeds = data.embeds.map((embed) => parseEmbed(embed));
    this.reactions = new Map(
      data.reactions?.map(
        (reaction) => [reaction.emoji.id ?? reaction.emoji.name!, reaction],
      ) ?? [],
    );
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
      this.flags[key as keyof typeof flagsMap] = ((flags & val) === val);
    }
  }

  /** Deletes the message. */
  async delete(reason?: string): Promise<void> {
    await this.client.rest.deleteMessage(
      this.channelId,
      this.id,
      this.guildId && reason,
    );
  }

  /** Edits the message. */
  async edit(options: {
    content?: string;
    embed?: Embed;
    suppressEmbeds?: boolean;
  }): Promise<Message> {
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
        embed: options.embed && unparseEmbed(options.embed),
        flags,
      },
    );

    return new Message(this.client, message);
  }

  /** Pins the message. */
  async pin(): Promise<void> {
    await this.client.rest.addPinnedChannelMessage(this.channelId, this.id);
  }

  /** Unpins the message. */
  async unpin(): Promise<void> {
    await this.client.rest.deletePinnedChannelMessage(this.channelId, this.id);
  }

  /** Adds a reaction to the message. */
  async addReaction(emoji: string): Promise<void> {
    await this.client.rest.createReaction(this.channelId, this.id, emoji);
  }

  /**
   * Removes a reaction from the message. If user is not specified,
   * the current user's message is removed.
   */
  async removeReaction(emoji: string, userId?: Snowflake): Promise<void> {
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

  /**
   * Removes all reactions from a message. If emoji is passed,
   * all reactions with that emoji are removed.
   */
  async removeAllReactions(emoji?: string): Promise<void> {
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

  /** Crossposts this message if it was sent in a news channel. */
  async crosspost(): Promise<Message> {
    const message = await this.client.rest.crosspostMessage(
      this.channelId,
      this.id,
    );

    return new Message(this.client, message);
  }
}

export type PartialEditedMessage = Partial<Omit<Message, "mentions"> & {
  mentions?: Partial<Message["mentions"]>
}> & Pick<Message, "id" | "channelId">;

export function parsePartialMessage(
  client: Client,
  data: Partial<message.Message> & Pick<message.Message, "id" | "channel_id">,
): PartialEditedMessage {
  const partialMessage = {} as PartialEditedMessage;

  partialMessage.channelId = data.channel_id;
  partialMessage.guildId = data.guild_id;
  if (data.author) {
    partialMessage.author = new User(client, data.author);
    partialMessage.member = data.member && new GuildMember(client, {
      ...data.member,
      user: data.author,
    }, data.guild_id!);
  }
  partialMessage.content = data.content;
  // timestamp
  partialMessage.editedAt = data.edited_timestamp
    ? Date.parse(data.edited_timestamp)
    : null;
  partialMessage.tts = data.tts;
  partialMessage.mentions = {
    everyone: data.mention_everyone,
    users: data.mentions?.map((user) => new User(client, user)),
    roles: data.mention_roles,
    channels: data.mention_channels?.map((mention) => mention.id),
  };
  partialMessage.attachments = data.attachments?.map((
    { proxy_url, ...attachment },
  ) => ({
    ...attachment,
    proxyUrl: proxy_url,
  }));
  partialMessage.embeds = data.embeds?.map((embed) => parseEmbed(embed));
  partialMessage.reactions = new Map(
    data.reactions?.map(
      (reaction) => [reaction.emoji.id ?? reaction.emoji.name!, reaction],
    ) ?? [],
  );
  // nonce
  partialMessage.pinned = data.pinned;
  partialMessage.byWebhook = !!data.webhook_id;
  partialMessage.type = data.type !== undefined
    ? messageTypeMap[data.type]
    : undefined;
  partialMessage.activity = data.activity && {
    type: activityTypeMap[data.activity.type],
    partyId: data.activity.party_id,
  };
  partialMessage.application = data.application && {
    id: data.application.id,
    coverImage: data.application.cover_image,
    description: data.application.description,
    icon: data.application.icon,
    name: data.application.name,
  };
  partialMessage.reference = data.message_reference && {
    messageId: data.message_reference.message_id,
    channelId: data.message_reference.channel_id,
    guildId: data.message_reference.guild_id,
  };

  partialMessage.flags = {} as Record<keyof typeof flagsMap, boolean>;
  const flags = data.flags ?? 0;
  for (const [key, val] of Object.entries(flagsMap)) {
    partialMessage.flags[key as keyof typeof flagsMap] =
      ((flags & val) === val);
  }

  return partialMessage;
}
