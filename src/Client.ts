import EventEmitter from "./utils/EventEmitter.ts";
import { ShardManager } from "./gateway/ShardManager.ts";
import { RestClient } from "./rest/RestClient.ts";
import type { channel, guild, message, role, Snowflake } from "./discord.ts";
import { PrivateUser, User } from "./structures/User.ts";
import { Guild } from "./structures/Guild.ts";
import { GuildMember } from "./structures/GuildMember.ts";
import { VoiceChannel } from "./structures/VoiceChannel.ts";
import { DMChannel } from "./structures/DMChannel.ts";
import { TextChannel } from "./structures/TextChannel.ts";
import { NewsChannel } from "./structures/NewsChannel.ts";
import { CategoryChannel } from "./structures/CategoryChannel.ts";
import { StoreChannel } from "./structures/StoreChannel.ts";
import { GroupDMChannel } from "./structures/GroupDMChannel.ts";
import { Message } from "./structures/Message.ts";
import { Embed, unparseEmbed } from "./structures/Embed.ts";

export type DMChannels = DMChannel | GroupDMChannel;
export type GuildChannels = TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel;
export type Channel = DMChannels | GuildChannels;

export interface BaseSendMessage {
  tts?: boolean;
  allowedMentions?: message.AllowedMentions;
}

export interface SendMessageContent extends BaseSendMessage {
  content: string;
  file?: File;
  embed?: Embed;
}

export interface SendMessageFile extends BaseSendMessage {
  content?: string;
  file: File;
  embed?: Embed;
}

export interface SendMessageEmbed extends BaseSendMessage {
  content?: string;
  file?: File;
  embed: Embed;
}

export type SendMessage =
  | SendMessageContent
  | SendMessageFile
  | SendMessageEmbed;

export interface Events {
  ready: undefined;
  shardReady: number;
  channelCreate: Channel;
  channelUpdate: [Channel, Channel];
  channelDelete: Channel;

  guildCreate: Guild;

  guildMemberAdd: GuildMember;
}

const intentsMap = {
  guilds: 1 << 0,
  guildMembers: 1 << 1,
  guildBans: 1 << 2,
  guildEmojis: 1 << 3,
  guildIntegrations: 1 << 4,
  guildWebhooks: 1 << 5,
  guildInvites: 1 << 6,
  guildVoiceStates: 1 << 7,
  guildPresences: 1 << 8,
  guildMessages: 1 << 9,
  guildMessageReactions: 1 << 10,
  guildMessageTyping: 1 << 11,
  directMessages: 1 << 12,
  directMessageReactions: 1 << 13,
  directMessageTyping: 1 << 14,
} as const;

export class Client extends EventEmitter<Events> {
  gateway: ShardManager;
  rest = new RestClient();

  channels = new Map<Snowflake, GuildChannels>();
  DMChannels = new Map<Snowflake, DMChannels>();
  guilds = new Map<Snowflake, Guild>();
  users = new Map<Snowflake, User>();

  user?: PrivateUser;

  constructor(shardAmount: number = 1, intents: Record<keyof typeof intentsMap, boolean> | number | boolean = true) {
    super();

    let newIntents = 0;

    if (intents) {
      if (typeof intents === "boolean") {
        newIntents = Object.values(intentsMap).reduce((prev, curr) => prev | curr, 0);
      } else if (typeof intents === "number") {
        newIntents = intents;
      } else {
        for (const [key, val] of Object.entries(intentsMap)) {
          if (intents[key as keyof typeof intentsMap]) {
            newIntents |= val;
          }
        }
      }
    }

    this.gateway = new ShardManager(shardAmount, newIntents);
    let shardCount = 0;
    this.gateway.on("raw", (e) => {
      switch (e.name) {
        case "READY":
          this.emit("shardReady", shardCount);
          this.user = new PrivateUser(this, e.data.user);
          if (++shardCount === shardAmount) {
            this.emit("ready", undefined);
          }
          break;
        case "CHANNEL_CREATE": {
          const channel = this.newChannelSwitch(e.data);
          this.channels.set(e.data.id, channel);
          this.emit("channelCreate", channel);
          break;
        }
        case "GUILD_CREATE": {
          const guild = new Guild(this, e.data);
          this.guilds.set(e.data.id, guild);
          this.emit("guildCreate", guild);
          break;
        }
        case "GUILD_MEMBER_ADD": {
          const member = new GuildMember(this, e.data, e.data.guild_id);
          this.emit("guildMemberAdd", member);
          break;
        }
      }
    });
  }

  connect(token: string) {
    this.rest.token = token;
    this.gateway.connect(token);
  }

  newChannelSwitch(data: channel.Channel): Channel {
    switch (data.type) {
      case 0:
        return new TextChannel(this, data);
      case 1:
        return new DMChannel(this, data);
      case 2:
        return new VoiceChannel(this, data);
      case 3:
        return new GroupDMChannel(this, data);
      case 4:
        return new CategoryChannel(this, data);
      case 5:
        return new NewsChannel(this, data);
      case 6:
        return new StoreChannel(this, data);
    }
  }

  async createGuild(name: string, options: {
    region?: string;
    icon?: string;
    verificationLevel?: guild.VerificationLevel;
    defaultNotifyAllMessages?: boolean;
    explicitContentFilter?: guild.ExplicitContentFilter;
    roles?: role.Role[];
    channels?: channel.GuildChannels[];
    afkChannelId?: Snowflake;
    afkTimeout?: number;
    systemChannelId?: Snowflake;
  } = {}) {
    const guild = await this.rest.createGuild({
      name,
      region: options.region,
      icon: options.icon,
      verification_level: options.verificationLevel,
      default_message_notifications:
        typeof options.defaultNotifyAllMessages === "boolean"
          ? +!options.defaultNotifyAllMessages as 0 | 1
          : undefined,
      explicit_content_filter: options.explicitContentFilter,
      roles: options.roles,
      channels: options.channels,
      afk_channel_id: options.afkChannelId,
      afk_timeout: options.afkTimeout,
      system_channel_id: options.systemChannelId,
    });

    return new Guild(this, guild);
  }

  async sendMessage(channelId: Snowflake, data: SendMessage) {
    let embed;
    if (data.embed) {
      embed = unparseEmbed(data.embed);
    }

    let convertedData: message.Create = {
      content: data.content,
      tts: data.tts,
      embed,
      allowed_mentions: data.allowedMentions,
    };

    if (data.file) {
      convertedData = {
        file: data.file,
        payload_json: JSON.stringify(convertedData),
      };
    }

    const message = await this.rest.createMessage(channelId, convertedData);

    return new Message(this, message);
  }

  async getPins(channelId: Snowflake) {
    const messages = await this.rest.getPinnedMessages(channelId);

    return messages.map((message) => new Message(this, message));
  }
}
