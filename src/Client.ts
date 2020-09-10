import EventEmitter from "./utils/EventEmitter.ts";
import { ShardManager } from "./gateway/ShardManager.ts";
import { RestClient } from "./rest/RestClient.ts";
import type { channel, guild, message, role, Snowflake } from "./discord.ts";
import { embed, presence, webhook } from "./discord.ts";
import { PrivateUser, User } from "./structures/User.ts";
import { GatewayGuild, RestGuild } from "./structures/Guild.ts";
import { GuildMember } from "./structures/GuildMember.ts";
import { VoiceChannel } from "./structures/VoiceChannel.ts";
import { DMChannel } from "./structures/DMChannel.ts";
import { TextChannel } from "./structures/TextChannel.ts";
import { NewsChannel } from "./structures/NewsChannel.ts";
import { CategoryChannel } from "./structures/CategoryChannel.ts";
import { StoreChannel } from "./structures/StoreChannel.ts";
import { GroupDMChannel } from "./structures/GroupDMChannel.ts";
import { Message, SendMessage } from "./structures/Message.ts";
import { unparseEmbed } from "./structures/Embed.ts";
import { Emoji, GuildEmoji, parseEmoji } from "./structures/Emoji.ts";
import { Role } from "./structures/Role.ts";
import {
  Activity,
  parsePresence,
  Presence,
  unparseActivity,
} from "./structures/Presence.ts";
import {
  InviteCreate,
  parseInvite,
  parseMetadata,
} from "./structures/Invite.ts";
import { ExecuteWebhook, parseWebhook } from "./structures/Webhook.ts";
import { equal } from "../deps.ts";

export type DMChannels = DMChannel | GroupDMChannel;
export type TextBasedGuildChannels = TextChannel | NewsChannel;
export type TextBasedChannel = DMChannels | TextBasedGuildChannels;
export type GuildChannels =
  | TextBasedGuildChannels
  | VoiceChannel
  | CategoryChannel
  | StoreChannel;
export type Channel = DMChannels | GuildChannels;

interface ChannelPinsUpdate {
  guildId?: Snowflake;
  channelId: Snowflake;
  lastPinTimestamp?: number;
}

type UnknownMessage = Pick<Message, "id" | "channelId" | "guildId">;

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

export type Events = {
  ready: [undefined];
  shardReady: [string];

  channelCreate: [Channel];
  channelUpdate: [Channel, Channel];
  channelDelete: [Channel];
  channelPinsUpdate: [ChannelPinsUpdate];

  guildCreate: [GatewayGuild];
  guildUpdate: [GatewayGuild, GatewayGuild];
  guildDelete: [guild.UnavailableGuild];
  guildBanAdd: [Snowflake, User];
  guildBanRemove: [Snowflake, User];
  guildEmojiCreate: [GatewayGuild, GuildEmoji];
  guildEmojiUpdate: [GatewayGuild, GuildEmoji, GuildEmoji];
  guildEmojiDelete: [GatewayGuild, GuildEmoji];
  guildIntegrationsUpdate: [Snowflake];

  guildMemberAdd: [GatewayGuild, GuildMember];
  guildMemberUpdate: [GatewayGuild, GuildMember, GuildMember];
  guildMemberRemove: [GatewayGuild, GuildMember];
  guildMembersChunk: [GatewayGuild, Map<Snowflake, GuildMember>];

  guildRoleCreate: [GatewayGuild, Role];
  guildRoleUpdate: [GatewayGuild, Role, Role];
  guildRoleDelete: [GatewayGuild, Role];

  inviteCreate: [InviteCreate];
  inviteDelete: [Snowflake, Snowflake | undefined, string];

  messageCreate: [TextBasedChannel, Message];
  messageUpdate: [TextBasedChannel, Message | undefined, Message];
  messageDelete: [TextBasedChannel, Message | UnknownMessage];
  messageDeleteBulk: [TextBasedChannel, Map<Snowflake, Message | Snowflake>];

  messageReactionAdd: [TextBasedChannel, Message | Snowflake, Emoji, User];
  messageReactionRemove: [TextBasedChannel, Message | Snowflake, Emoji, User];
  messageReactionRemoveAll: [TextBasedChannel, Message | Snowflake];
  messageReactionRemoveEmoji: [TextBasedChannel, Message | Snowflake, Emoji];

  presenceUpdate: [GatewayGuild | undefined, Presence | undefined, Presence];
  typingStart: [User | Snowflake, Snowflake, Snowflake | undefined];
  currentUserUpdate: [PrivateUser, PrivateUser];

  webhookUpdate: [Snowflake, Snowflake];
};

export class Client extends EventEmitter<Events> {
  gateway: ShardManager;
  rest = new RestClient();

  guildChannels = new Map<Snowflake, GuildChannels>();
  dmChannels = new Map<Snowflake, DMChannels>();
  guilds = new Map<Snowflake, GatewayGuild>();
  users = new Map<Snowflake, User>();

  user?: PrivateUser;

  constructor(
    shardAmount: number = 1,
    intents: Record<keyof typeof intentsMap, boolean> | number | boolean = true,
  ) {
    super();

    let newIntents = 0;

    if (intents) {
      if (typeof intents === "boolean") {
        newIntents = Object.values(intentsMap).reduce(
          (prev, curr) => prev | curr,
          0,
        );
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
    this.gateway.on("raw", (e) => {
      switch (e.name) {
        case "READY":
          this.user = new PrivateUser(this, e.data.user);
          this.emit("shardReady", e.data.shard!.join("/"));
          break;
        case "RESUMED":
          break;
        case "RECONNECT":
          break;

        case "CHANNEL_CREATE": {
          const channel = this.newChannelSwitch(e.data);
          if (channel.type === "dm" || channel.type === "groupDM") {
            this.dmChannels.set(channel.id, channel as DMChannels);
          } else {
            this.guildChannels.set(channel.id, channel as GuildChannels);
          }
          this.emit("channelCreate", channel);
          break;
        }
        case "CHANNEL_UPDATE": {
          let oldChannel: Channel;
          const newChannel = this.newChannelSwitch(e.data);
          if (newChannel.type === "dm" || newChannel.type === "groupDM") {
            oldChannel = this.dmChannels.get(e.data.id)!;
            this.dmChannels.set(newChannel.id, newChannel as DMChannels);
          } else {
            oldChannel = this.guildChannels.get(e.data.id)!;
            this.guildChannels.set(newChannel.id, newChannel as GuildChannels);
          }
          this.emit("channelUpdate", oldChannel, newChannel);
          break;
        }
        case "CHANNEL_DELETE": {
          const channel = this.newChannelSwitch(e.data);
          if (channel.type === "dm" || channel.type === "groupDM") {
            this.dmChannels.delete(channel.id);
          } else {
            this.guildChannels.delete(channel.id);
          }
          this.emit("channelDelete", channel);
          break;
        }
        case "CHANNEL_PINS_UPDATE":
          this.emit("channelPinsUpdate", {
            guildId: e.data.guild_id,
            channelId: e.data.channel_id,
            lastPinTimestamp: e.data.last_pin_timestamp
              ? Date.parse(e.data.last_pin_timestamp)
              : undefined,
          });
          break;

        case "GUILD_CREATE": {
          const guild = new GatewayGuild(this, e.data);
          for (const channel of e.data.channels) {
            this.guildChannels.set(
              channel.id,
              this.newChannelSwitch(channel) as TextBasedGuildChannels,
            );
          }
          this.guilds.set(e.data.id, guild);
          this.emit("guildCreate", guild);
          break;
        }
        case "GUILD_UPDATE": {
          const oldGuild = this.guilds.get(e.data.id)!;
          const newGuild = new GatewayGuild(this, e.data);
          this.guilds.set(e.data.id, newGuild);
          this.emit("guildUpdate", oldGuild, newGuild);
          break;
        }
        case "GUILD_DELETE":
          this.guilds.delete(e.data.id);
          this.emit("guildDelete", e.data);
          break;

        case "GUILD_BAN_ADD": {
          const user = new User(this, e.data.user);
          this.users.set(e.data.user.id, user);
          this.emit("guildBanAdd", e.data.guild_id, user);
          break;
        }
        case "GUILD_BAN_REMOVE": {
          const user = new User(this, e.data.user);
          this.users.set(e.data.user.id, user);
          this.emit("guildBanRemove", e.data.guild_id, user);
          break;
        }
        case "GUILD_EMOJIS_UPDATE": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const newEmojis = new Map<Snowflake, GuildEmoji>(
            e.data.emojis.map((emoji) => [emoji.id, parseEmoji(this, emoji)]),
          );
          guild.emojis = newEmojis;
          this.guilds.set(guild.id, guild);

          if (newEmojis.size > guild.emojis.size) {
            let addedEmoji: GuildEmoji;
            for (const [id, emoji] of newEmojis) {
              if (!guild.emojis.has(id)) {
                addedEmoji = emoji;
              }
            }
            this.emit("guildEmojiCreate", guild, addedEmoji!);
          } else if (newEmojis.size === guild.emojis.size) {
            for (const [id, original] of guild.emojis) {
              const updated = newEmojis.get(id);
              if (updated && !equal(original, updated)) {
                this.emit("guildEmojiUpdate", guild, original, updated);
                break;
              }
            }
          } else {
            let deletedEmoji: GuildEmoji;
            for (const [id, emoji] of guild.emojis) {
              if (!newEmojis.has(id)) {
                deletedEmoji = emoji;
              }
            }
            this.emit("guildEmojiDelete", guild, deletedEmoji!);
          }
          break;
        }
        case "GUILD_INTEGRATIONS_UPDATE":
          this.emit("guildIntegrationsUpdate", e.data.guild_id);
          break;

        case "GUILD_MEMBER_ADD": {
          const member = new GuildMember(this, e.data, e.data.guild_id);
          const guild = this.guilds.get(e.data.guild_id)!;
          guild.members.set(member.user.id, member);
          this.guilds.set(e.data.guild_id, guild);
          this.emit("guildMemberAdd", guild, member);
          break;
        }
        case "GUILD_MEMBER_UPDATE": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const oldMember = guild.members.get(e.data.user.id)!;
          const newMember = new GuildMember(this, {
            ...oldMember.raw,
            ...e.data,
          }, e.data.guild_id);
          guild.members.set(e.data.user.id, newMember);
          this.guilds.set(e.data.guild_id, guild);
          this.emit("guildMemberUpdate", guild, oldMember, newMember);
          break;
        }
        case "GUILD_MEMBER_REMOVE": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const member = guild.members.get(e.data.user.id)!;
          guild.members.delete(e.data.user.id);
          this.guilds.set(e.data.guild_id, guild);
          this.emit("guildMemberRemove", guild, member);
          break;
        }
        case "GUILD_MEMBERS_CHUNK": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const members = new Map(
            e.data.members.map(
              (member) => [
                member.user.id,
                new GuildMember(this, member, e.data.guild_id),
              ],
            ),
          );
          guild.members = new Map({
            ...guild.members.entries(),
            ...members.entries(),
          });
          this.guilds.set(e.data.guild_id, guild);
          this.emit("guildMembersChunk", guild, members); //TODO
          break;
        }

        case "GUILD_ROLE_CREATE": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const role = new Role(this, e.data.role, e.data.guild_id);
          guild.roles.set(e.data.role.id, role);
          this.guilds.set(e.data.guild_id, guild);
          this.emit("guildRoleCreate", guild, role);
          break;
        }
        case "GUILD_ROLE_UPDATE": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const oldRole = guild.roles.get(e.data.role.id)!;
          const newRole = new Role(this, e.data.role, e.data.guild_id);
          guild.roles.set(e.data.role.id, newRole);
          this.guilds.set(e.data.guild_id, guild);
          this.emit("guildRoleUpdate", guild, oldRole, newRole);
          break;
        }
        case "GUILD_ROLE_DELETE": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const role = guild.roles.get(e.data.role_id)!;
          guild.roles.delete(e.data.role_id);
          this.guilds.set(e.data.guild_id, guild);
          this.emit("guildRoleDelete", guild, role);
          break;
        }

        case "INVITE_CREATE": {
          const {
            guild_id,
            channel_id,
            code,
            inviter,
            target_user,
            target_user_type,
            ...metadata
          } = e.data;

          let parsedInviter;

          if (inviter) {
            parsedInviter = new User(this, inviter);
            this.users.set(parsedInviter.id, parsedInviter);
          }

          const data: InviteCreate = {
            guildId: guild_id,
            channelId: channel_id,
            code,
            inviter: parsedInviter,
            ...parseMetadata(metadata),
          };

          this.emit("inviteCreate", data);
          break;
        }
        case "INVITE_DELETE":
          this.emit(
            "inviteDelete",
            e.data.channel_id,
            e.data.guild_id,
            e.data.code,
          );
          break;

        case "MESSAGE_CREATE": {
          const message = new Message(this, e.data);
          let channel: TextBasedChannel;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            )! as TextBasedGuildChannels;
            channel.messages.set(message.id, message);
            this.guildChannels.set(channel.id, channel);
          } else {
            channel = this.dmChannels.get(e.data.channel_id)!;
            channel.messages.set(message.id, message);
            this.dmChannels.set(channel.id, channel);
          }
          this.emit("messageCreate", channel, message);
          break;
        }
        case "MESSAGE_UPDATE": {
          let oldMessage;
          const newMessage = new Message(this, e.data);
          let channel: TextBasedChannel;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            )! as TextBasedGuildChannels;
            oldMessage = channel.messages.get(newMessage.id);
            channel.messages.set(newMessage.id, newMessage);
            this.guildChannels.set(channel.id, channel);
          } else {
            channel = this.dmChannels.get(e.data.channel_id)!;
            oldMessage = channel.messages.get(newMessage.id);
            channel.messages.set(newMessage.id, newMessage);
            this.dmChannels.set(channel.id, channel);
          }
          this.emit("messageUpdate", channel, oldMessage, newMessage);
          break;
        }
        case "MESSAGE_DELETE": {
          let message;
          let channel: TextBasedChannel;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            )! as TextBasedGuildChannels;
            message = channel.messages.get(e.data.id);
            channel.messages.delete(e.data.id);
            this.guildChannels.set(channel.id, channel);
          } else {
            channel = this.dmChannels.get(e.data.channel_id)!;
            message = channel.messages.get(e.data.id);
            channel.messages.delete(e.data.id);
            this.dmChannels.set(channel.id, channel);
          }
          this.emit(
            "messageDelete",
            channel,
            message || {
              id: e.data.id,
              channelId: e.data.channel_id,
              guildId: e.data.guild_id,
            },
          );
          break;
        }
        case "MESSAGE_DELETE_BULK": {
          let messages = new Map<Snowflake, Message | Snowflake>();
          let channel: TextBasedChannel;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            )! as TextBasedGuildChannels;
            for (const id of e.data.ids) {
              const message = channel.messages.get(id);
              messages.set(id, message || id);
              channel.messages.delete(id);
            }
            this.guildChannels.set(channel.id, channel);
          } else {
            channel = this.dmChannels.get(e.data.channel_id)!;
            for (const id of e.data.ids) {
              const message = channel.messages.get(id);
              messages.set(id, message || id);
              channel.messages.delete(id);
            }
            this.dmChannels.set(channel.id, channel);
          }
          this.emit("messageDeleteBulk", channel, messages);
          break;
        }

        case "MESSAGE_REACTION_ADD": {
          let message;
          let channel: TextBasedChannel;
          const user = this.users.get(e.data.user_id)!;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            )! as TextBasedGuildChannels;
            message = channel.messages.get(e.data.message_id);
            if (message) {
              const previousReaction = message.reactions.get(
                e.data.emoji.id ?? e.data.emoji.name!,
              );
              if (previousReaction) {
                message.reactions.set(e.data.emoji.id ?? e.data.emoji.name!, {
                  count: ++previousReaction.count,
                  emoji: e.data.emoji,
                  me: e.data.user_id === this.user!.id || previousReaction.me,
                });
              } else {
                message.reactions.set(e.data.emoji.id ?? e.data.emoji.name!, {
                  count: 0,
                  emoji: e.data.emoji,
                  me: e.data.user_id === this.user!.id,
                });
              }
              channel.messages.set(message.id, message);
              this.guildChannels.set(channel.id, channel);
            }
          } else {
            channel = this.dmChannels.get(e.data.channel_id)!;
            message = channel.messages.get(e.data.message_id);
            if (message) {
              const previousReaction = message.reactions.get(
                e.data.emoji.id ?? e.data.emoji.name!,
              );
              if (previousReaction) {
                message.reactions.set(e.data.emoji.id ?? e.data.emoji.name!, {
                  count: ++previousReaction.count,
                  emoji: e.data.emoji,
                  me: e.data.user_id === this.user!.id || previousReaction.me,
                });
              } else {
                message.reactions.set(e.data.emoji.id ?? e.data.emoji.name!, {
                  count: 0,
                  emoji: e.data.emoji,
                  me: e.data.user_id === this.user!.id,
                });
              }
              channel.messages.set(message.id, message);
              this.dmChannels.set(channel.id, channel);
            }
          }
          this.emit(
            "messageReactionAdd",
            channel,
            message || e.data.message_id,
            e.data.emoji,
            user,
          );
          break;
        }
        case "MESSAGE_REACTION_REMOVE": {
          let message;
          let channel: TextBasedChannel;
          const user = this.users.get(e.data.user_id)!;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            )! as TextBasedGuildChannels;
            message = channel.messages.get(e.data.message_id);
            if (message) {
              const previousReaction = message.reactions.get(
                e.data.emoji.id ?? e.data.emoji.name!,
              )!;
              message.reactions.set(e.data.emoji.id ?? e.data.emoji.name!, {
                count: --previousReaction.count,
                emoji: e.data.emoji,
                me: e.data.user_id !== this.user!.id && previousReaction.me,
              });
              channel.messages.set(message.id, message);
              this.guildChannels.set(channel.id, channel);
            }
          } else {
            channel = this.dmChannels.get(e.data.channel_id)!;
            message = channel.messages.get(e.data.message_id);
            if (message) {
              const previousReaction = message.reactions.get(
                e.data.emoji.id ?? e.data.emoji.name!,
              )!;
              message.reactions.set(e.data.emoji.id ?? e.data.emoji.name!, {
                count: --previousReaction.count,
                emoji: e.data.emoji,
                me: e.data.user_id !== this.user!.id && previousReaction.me,
              });
              message.reactions.delete(e.data.emoji.id ?? e.data.emoji.name!);
              channel.messages.set(message.id, message);
              this.dmChannels.set(channel.id, channel);
            }
          }
          this.emit(
            "messageReactionRemove",
            channel,
            message || e.data.message_id,
            e.data.emoji,
            user,
          );
          break;
        }
        case "MESSAGE_REACTION_REMOVE_ALL": {
          let message;
          let channel: TextBasedChannel;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            )! as TextBasedGuildChannels;
            message = channel.messages.get(e.data.message_id);
            if (message) {
              message.reactions.clear();
              channel.messages.set(message.id, message);
              this.guildChannels.set(channel.id, channel);
            }
          } else {
            channel = this.dmChannels.get(e.data.channel_id)!;
            message = channel.messages.get(e.data.message_id);
            if (message) {
              message.reactions.clear();
              channel.messages.set(message.id, message);
              this.dmChannels.set(channel.id, channel);
            }
          }
          this.emit(
            "messageReactionRemoveAll",
            channel,
            message || e.data.message_id,
          );
          break;
        }
        case "MESSAGE_REACTION_REMOVE_EMOJI": {
          let message;
          let channel: TextBasedChannel;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            )! as TextBasedGuildChannels;
            message = channel.messages.get(e.data.message_id);
            if (message) {
              message.reactions.delete(e.data.emoji.id ?? e.data.emoji.name!);
              channel.messages.set(message.id, message);
              this.guildChannels.set(channel.id, channel);
            }
          } else {
            channel = this.dmChannels.get(e.data.channel_id)!;
            message = channel.messages.get(e.data.message_id);
            if (message) {
              message.reactions.delete(e.data.emoji.id ?? e.data.emoji.name!);
              channel.messages.set(message.id, message);
              this.dmChannels.set(channel.id, channel);
            }
          }
          this.emit(
            "messageReactionRemoveEmoji",
            channel,
            message || e.data.message_id,
            e.data.emoji,
          );
          break;
        }

        case "PRESENCE_UPDATE": {
          const newPresence = parsePresence(this, e.data);
          let guild;
          let oldPresence;
          if (e.data.guild_id) {
            guild = this.guilds.get(e.data.guild_id)!;
            oldPresence = guild.presences.get(e.data.user.id);
            guild.presences.set(e.data.user.id, newPresence);
            this.guilds.set(e.data.guild_id, guild);
          }
          this.emit("presenceUpdate", guild, oldPresence, newPresence);
          break;
        }
        case "TYPING_START": {
          let user;
          if (e.data.member) {
            user = new User(this, e.data.member.user);
            this.users.set(e.data.user_id, user);
          } else {
            user = this.users.get(e.data.user_id) || e.data.user_id;
          }
          this.emit("typingStart", user, e.data.channel_id, e.data.guild_id);
          break;
        }
        case "USER_UPDATE": {
          const oldUser = this.user!;
          const newUser = new PrivateUser(this, e.data);
          this.user = newUser;
          this.emit("currentUserUpdate", oldUser, newUser);
          break;
        }

        case "VOICE_STATE_UPDATE": {
          break;
        }
        case "VOICE_SERVER_UPDATE":
          break;

        case "WEBHOOKS_UPDATE":
          this.emit("webhookUpdate", e.data.channel_id, e.data.guild_id);
          break;
      }
    });
  }

  async connect(token: string) {
    this.rest.token = token;
    await this.gateway.connect(token);
    this.emit("ready", undefined);
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

    return new RestGuild(this, guild);
  }

  async getGuildPreview(guildId: Snowflake) {
    return await this.rest.getGuildPreview(guildId);
  }

  async getInvite(code: string) {
    return parseInvite(this, await this.rest.getInvite(code));
  }

  async getUser(userId: Snowflake) {
    const user = new User(this, await this.rest.getUser(userId));
    this.users.set(user.id, user);
    return user;
  }

  async getWebhook(webhookId: Snowflake, token?: string) {
    let webhook;
    if (token) {
      webhook = await this.rest.getWebhookWithToken(webhookId, token);
    } else {
      webhook = await this.rest.getWebhook(webhookId);
    }
    return parseWebhook(this, webhook);
  }

  async editWebhook(
    webhookId: Snowflake,
    options: {
      name?: string;
      avatar?: string | null;
      channelId?: Snowflake;
    },
    token?: string,
    reason?: string,
  ) {
    let webhook;
    if (token) {
      webhook = await this.rest.modifyWebhookWithToken(webhookId, token, {
        name: options.name,
        avatar: options.avatar,
        channel_id: options.channelId,
      }, reason);
    } else {
      webhook = await this.rest.modifyWebhook(webhookId, {
        name: options.name,
        avatar: options.avatar,
        channel_id: options.channelId,
      }, reason);
    }
    return parseWebhook(this, webhook);
  }

  async deleteWebhook(webhookId: Snowflake, token?: string, reason?: string) {
    if (token) {
      await this.rest.deleteWebhookWithToken(webhookId, token, reason);
    } else {
      await this.rest.deleteWebhook(webhookId, reason);
    }
  }

  async executeWebhook(
    webhookId: Snowflake,
    token: string,
    data: ExecuteWebhook,
    wait?: false,
  ): Promise<void>;
  async executeWebhook(
    webhookId: Snowflake,
    token: string,
    data: ExecuteWebhook,
    wait: true,
  ): Promise<Message>;
  async executeWebhook(
    webhookId: Snowflake,
    token: string,
    data: ExecuteWebhook,
    wait?: boolean,
  ): Promise<Message | void> {
    let embeds: embed.Embed[] | undefined;
    if (data.embeds) {
      embeds = data.embeds.map((embed) => unparseEmbed(embed));
    }

    let convertedData: webhook.ExecuteBody = {
      content: data.content,
      tts: data.tts,
      embeds,
      allowed_mentions: data.allowedMentions,
    };

    if (data.file) {
      convertedData = {
        file: data.file,
        payload_json: JSON.stringify(convertedData),
      };
    }

    const res = await this.rest.executeWebhook(
      webhookId,
      token,
      convertedData,
      {
        wait,
      },
    );

    if (wait) {
      // TODO: cast shouldn't be unnecessary but ts complains
      return new Message(this, res as message.Message);
    }
  }

  requestGuildMembers(
    shardNumber: number,
    guildIds: Snowflake | Snowflake[],
    options: {
      query?: string;
      limit: number;
      presences?: boolean;
      userIds?: Snowflake | Snowflake[];
      nonce?: string;
    },
  ) {
    this.gateway.guildRequestMember(shardNumber, {
      guild_id: guildIds,
      query: options.query,
      limit: options.limit,
      presences: options.presences,
      user_ids: options.userIds,
      nonce: options.nonce,
    });
  }

  statusUpdate(shardNumber: number, data: {
    since: number | null;
    game: Activity | null;
    status: presence.ActiveStatus;
    afk: boolean;
  }) {
    this.gateway.statusUpdate(shardNumber, {
      since: data.since,
      game: data.game && unparseActivity(data.game),
      status: data.status,
      afk: data.afk,
    });
  }

  // utils

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
}
