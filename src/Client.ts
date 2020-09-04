import EventEmitter from "./utils/EventEmitter.ts";
import { ShardManager } from "./gateway/ShardManager.ts";
import { RestClient } from "./rest/RestClient.ts";
import type {
  channel,
  guild,
  message,
  role,
  Snowflake,
  user,
} from "./discord.ts";
import { User } from "./structures/User.ts";
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
import { Embed, encodeEmbed } from "./structures/Embed.ts";

export type Channel =
  | TextChannel
  | DMChannel
  | VoiceChannel
  | GroupDMChannel
  | CategoryChannel
  | NewsChannel
  | StoreChannel;

export interface SendMessage {
  content?: string;
  tts?: boolean;
  file?: File;
  embed?: Embed;
  allowedMentions?: message.AllowedMentions;
}

export interface Events {
  ready: undefined;
  shardReady: number;
  channelCreate: Channel;
  channelUpdate: [Channel, Channel];
  channelDelete: Channel;

  guildCreate: Guild;

  guildMemberAdd: GuildMember;
}

export class Client extends EventEmitter<Events> {
  gateway: ShardManager;
  rest = new RestClient();

  channels = new Map<Snowflake, Channel>();
  DMChannels = new Map<Snowflake, DMChannel>();
  guilds = new Map<Snowflake, Guild>();
  users = new Map<Snowflake, User>();

  user?: ClientUser;

  constructor(shardAmount: number = 1, intents?: number) {
    super();

    this.gateway = new ShardManager(shardAmount, intents);
    let shardCount = 0;
    this.gateway.on("raw", (e) => {
      switch (e.name) {
        case "READY":
          this.emit("shardReady", shardCount);
          this.user = new ClientUser(this, e.data.user);
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
    this.rest = new RestClient(token);
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
          : options.defaultNotifyAllMessages,
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
      embed = encodeEmbed(data.embed);
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

export class ClientUser extends User {
  email: string | null;
  flags: number;
  locale: string;
  mfaEnabled: boolean;
  phone?: string | null;
  verified: boolean;

  constructor(client: Client, data: user.PrivateUser) {
    super(client, data);

    this.email = data.email;
    this.flags = data.flags ?? 0;
    this.locale = data.locale;
    this.mfaEnabled = data.mfa_enabled;
    this.phone = data.phone;
    this.verified = data.verified;
  }
}
