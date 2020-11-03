import { equal, EventEmitter } from "../deps.ts";
import { ShardManager } from "./gateway/ShardManager.ts";
import { RestClient } from "./rest/RestClient.ts";
import type {
  channel,
  embed,
  guild,
  message,
  presence,
  role,
  Snowflake,
  webhook,
} from "./discord.ts";
import { PrivateUser, User } from "./structures/User.ts";
import { GatewayGuild, RestGuild } from "./structures/Guild.ts";
import { GuildMember } from "./structures/GuildMember.ts";
import { VoiceChannel } from "./structures/VoiceChannel.ts";
import { DMChannel } from "./structures/DMChannel.ts";
import { NewsChannel, TextChannel } from "./structures/TextNewsChannel.ts";
import { CategoryChannel } from "./structures/CategoryChannel.ts";
import { StoreChannel } from "./structures/StoreChannel.ts";
import {
  Message,
  parsePartialMessage,
  PartialEditedMessage,
  SendMessageOptions,
} from "./structures/Message.ts";
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
  Invite,
  InviteCreate,
  parseInvite,
  parseMetadata,
} from "./structures/Invite.ts";
import { ExecuteWebhook, parseWebhook, Webhook } from "./structures/Webhook.ts";
import { parseState, State } from "./structures/VoiceState.ts";

interface AwaitMessage {
  time?: number;
  max?: number;
  maxProcessed?: number;
}

export type AwaitMessagesOptions =
  | AwaitMessage & Required<Pick<AwaitMessage, "time">>
  | AwaitMessage & Required<Pick<AwaitMessage, "max">>
  | AwaitMessage & Required<Pick<AwaitMessage, "maxProcessed">>;

export type TextBasedGuildChannels = TextChannel | NewsChannel;
export type TextBasedChannel = DMChannel | TextBasedGuildChannels;
export type GuildChannels =
  | TextBasedGuildChannels
  | VoiceChannel
  | CategoryChannel
  | StoreChannel;
export type Channel = DMChannel | GuildChannels;

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

interface GuildMemberChunkInfo {
  index: number;
  amount: number;
  notFound?: Snowflake[];
  nonce?: string;
}

export type Events = {
  ready: [undefined];
  shardReady: [string];

  channelCreate: [GuildChannels];
  channelUpdate: [Channel | undefined, Channel];
  channelDelete: [Channel];
  channelPinsUpdate: [
    TextBasedChannel | {
      id: Snowflake;
      guildId?: Snowflake;
    },
    number | undefined,
    number | undefined,
  ];

  guildCreate: [GatewayGuild];
  guildUpdate: [GatewayGuild, GatewayGuild];
  guildDelete: [guild.UnavailableGuild];
  guildBanAdd: [Snowflake, User];
  guildBanRemove: [Snowflake, User];
  guildEmojiCreate: [GatewayGuild, GuildEmoji];
  guildEmojiUpdate: [GatewayGuild, GuildEmoji, GuildEmoji];
  guildEmojiDelete: [GatewayGuild, GuildEmoji];
  guildEmojiChange: [Snowflake, Map<Snowflake, GuildEmoji>];
  guildIntegrationsUpdate: [Snowflake];

  guildMemberAdd: [GatewayGuild | Snowflake, GuildMember];
  guildMemberUpdate: [
    GatewayGuild | Snowflake,
    GuildMember | undefined,
    | GuildMember
    | (
      & Pick<
        GuildMember,
        "roles" | "user" | "boostingSince" | "joinedAt" | "guildId"
      >
      & Partial<Pick<GuildMember, "nickname">>
    ),
  ];
  guildMemberRemove: [GatewayGuild | Snowflake, User];
  guildMembersChunk: [
    GatewayGuild | Snowflake,
    Map<Snowflake, GuildMember>,
    GuildMemberChunkInfo,
  ];

  guildRoleCreate: [GatewayGuild, Role];
  guildRoleUpdate: [GatewayGuild, Role, Role];
  guildRoleDelete: [GatewayGuild, Role];

  inviteCreate: [InviteCreate];
  inviteDelete: [Snowflake, Snowflake | undefined, string];

  messageCreate: [TextBasedChannel | undefined, Message];
  messageUpdate: [
    Message | undefined,
    Message | PartialEditedMessage,
  ];
  messageDelete: [Message | UnknownMessage];
  messageDeleteBulk: [Snowflake, Map<Snowflake, Message | Snowflake>];

  messageReactionAdd: [
    Snowflake,
    Message | Snowflake,
    Pick<Emoji, "id" | "name" | "animated">,
    User | Snowflake,
  ];
  messageReactionRemove: [
    Snowflake,
    Message | Snowflake,
    Pick<Emoji, "id" | "name" | "animated">,
    User | Snowflake,
  ];
  messageReactionRemoveAll: [Snowflake, Message | Snowflake];
  messageReactionRemoveEmoji: [
    Snowflake,
    Message | Snowflake,
    Pick<Emoji, "id" | "name" | "animated">,
  ];

  voiceStateUpdate: [State];

  presenceUpdate: [GatewayGuild | undefined, Presence | undefined, Presence];
  typingStart: [User | Snowflake, Snowflake, Snowflake | undefined];
  currentUserUpdate: [PrivateUser, PrivateUser];

  webhookUpdate: [Snowflake, Snowflake];
};

export interface RequestGuildMembersOptions {
  query?: string;
  limit: number;
  presences?: boolean;
  userIds?: Snowflake | Snowflake[];
  nonce?: string;
}

export class Client extends EventEmitter<Events> {
  gateway: ShardManager;
  rest = new RestClient();
  /** A map of cached guild channels, indexed by their id. */
  guildChannels = new Map<Snowflake, GuildChannels>();
  /** A map of cached (group) dm channels, indexed by their id. */
  dmChannels = new Map<Snowflake, DMChannel>(); // TODO: remove
  /** A map of cached guilds, indexed by their id. */
  guilds = new Map<Snowflake, GatewayGuild>();
  /** A map of cached users, indexed by their id. */
  users = new Map<Snowflake, User>();
  /**
   * A map of maps of cached messages indexed by their id,
   * indexed by the channel id.
   */
  messages = new Map<Snowflake, Map<Snowflake, Message>>();
  /** The current user. Is unset only before a shardReady event. */
  user?: PrivateUser;

  constructor({
    intents,
    shardAmount,
  }: {
    intents: Record<keyof typeof intentsMap, boolean> | number | boolean;
    shardAmount: number;
  } = {
    intents: true,
    shardAmount: 1,
  }) {
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

        case "GUILD_CREATE": {
          const guild = new GatewayGuild(this, e.data);
          for (const channel of e.data.channels) {
            this.guildChannels.set(
              channel.id,
              this.newChannelSwitch(channel) as TextBasedGuildChannels,
            );
          }
          for (const { user } of e.data.members) {
            this.users.set(user.id, new User(this, user));
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

        case "GUILD_ROLE_CREATE": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const role = new Role(this, e.data.role, e.data.guild_id);
          guild.roles.set(e.data.role.id, role);
          this.emit("guildRoleCreate", guild, role);
          break;
        }
        case "GUILD_ROLE_UPDATE": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const oldRole = guild.roles.get(e.data.role.id)!;
          const newRole = new Role(this, e.data.role, e.data.guild_id);
          guild.roles.set(e.data.role.id, newRole);
          this.emit("guildRoleUpdate", guild, oldRole, newRole);
          break;
        }
        case "GUILD_ROLE_DELETE": {
          const guild = this.guilds.get(e.data.guild_id)!;
          const role = guild.roles.get(e.data.role_id)!;
          guild.roles.delete(e.data.role_id);
          this.emit("guildRoleDelete", guild, role);
          break;
        }

        case "CHANNEL_CREATE": {
          const channel = this.newChannelSwitch(e.data) as GuildChannels;
          this.guildChannels.set(channel.id, channel);

          const guild = this.guilds.get(channel.guildId)!;
          guild.channels.set(channel.id, channel);
          this.emit("channelCreate", channel);
          break;
        }
        case "CHANNEL_UPDATE": {
          let oldChannel: Channel | undefined;
          const newChannel = this.newChannelSwitch(e.data);
          if (newChannel.type === "dm") {
            oldChannel = this.dmChannels.get(e.data.id);
            this.dmChannels.set(newChannel.id, newChannel);
          } else {
            oldChannel = this.guildChannels.get(e.data.id);
            this.guildChannels.set(newChannel.id, newChannel);

            const guild = this.guilds.get(newChannel.guildId)!;
            guild.channels.set(newChannel.id, newChannel);
          }
          this.emit("channelUpdate", oldChannel, newChannel);
          break;
        }
        case "CHANNEL_DELETE": {
          const channel = this.newChannelSwitch(e.data);
          if (channel.type === "dm") {
            this.dmChannels.delete(channel.id);
          } else {
            this.guildChannels.delete(channel.id);

            const guild = this.guilds.get(channel.guildId)!;
            guild.channels.delete(channel.id);
          }
          this.emit("channelDelete", channel);
          break;
        }
        case "CHANNEL_PINS_UPDATE": {
          let channel: Channel | undefined;
          const timestamp = e.data.last_pin_timestamp
            ? Date.parse(e.data.last_pin_timestamp)
            : undefined;
          let previousTimestamp: number | undefined;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            ) as TextBasedGuildChannels;
            if (channel) {
              previousTimestamp = channel.lastPinTimestamp;
              channel.lastPinTimestamp = timestamp;

              const guild = this.guilds.get(channel.guildId)!;
              const guildChannel = guild.channels.get(
                channel.id,
              )! as TextBasedGuildChannels;
              guildChannel.lastPinTimestamp = timestamp;
            }
          } else {
            channel = this.dmChannels.get(e.data.channel_id);
            if (channel) {
              previousTimestamp = channel.lastPinTimestamp;
              channel.lastPinTimestamp = timestamp;
            }
          }
          this.emit(
            "channelPinsUpdate",
            channel || {
              id: e.data.channel_id,
              guildId: e.data.guild_id,
            },
            previousTimestamp,
            timestamp,
          );
          break;
        }

        case "GUILD_MEMBER_ADD": {
          const member = new GuildMember(this, e.data, e.data.guild_id);
          this.users.set(member.user.id, member.user);
          const guild = this.guilds.get(e.data.guild_id);
          guild?.members.set(member.user.id, member);
          this.emit("guildMemberAdd", guild || e.data.guild_id, member);
          break;
        }
        case "GUILD_MEMBER_UPDATE": {
          const guild = this.guilds.get(e.data.guild_id);
          let oldMember: GuildMember | undefined;
          let newMember: GuildMember | undefined;
          const user = new User(this, e.data.user);
          this.users.set(user.id, user);
          if (guild) {
            oldMember = guild.members.get(e.data.user.id);
            if (oldMember) {
              newMember = new GuildMember(this, {
                ...oldMember.raw,
                ...e.data,
              }, e.data.guild_id);
              guild.members.set(e.data.user.id, newMember);
            }
          }
          this.emit(
            "guildMemberUpdate",
            guild || e.data.guild_id,
            oldMember,
            newMember || {
              roles: e.data.roles,
              user: user,
              boostingSince: e.data.premium_since
                ? Date.parse(e.data.premium_since)
                : null,
              joinedAt: Date.parse(e.data.joined_at),
              guildId: e.data.guild_id,
              nickname: e.data.nick,
            },
          );
          break;
        }
        case "GUILD_MEMBER_REMOVE": {
          const user = new User(this, e.data.user);
          this.users.set(user.id, user);
          const guild = this.guilds.get(e.data.guild_id);
          guild?.members.delete(user.id);
          this.emit("guildMemberRemove", guild || e.data.guild_id, user);
          break;
        }

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
          const guild = this.guilds.get(e.data.guild_id);
          const newEmojis = new Map<Snowflake, GuildEmoji>(
            e.data.emojis.map((emoji) => [emoji.id, parseEmoji(this, emoji)]),
          );
          if (guild) {
            guild.emojis = newEmojis;

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
          } else {
            this.emit("guildEmojiChange", e.data.guild_id, newEmojis);
          }
          break;
        }

        case "GUILD_INTEGRATIONS_UPDATE":
          this.emit("guildIntegrationsUpdate", e.data.guild_id);
          break;

        case "WEBHOOKS_UPDATE":
          this.emit("webhookUpdate", e.data.channel_id, e.data.guild_id);
          break;

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

        case "VOICE_STATE_UPDATE":
          this.emit("voiceStateUpdate", parseState(e.data, this));
          break;

        case "PRESENCE_UPDATE": {
          const newPresence = parsePresence(this, e.data);
          let guild;
          let oldPresence;
          if (e.data.guild_id) {
            guild = this.guilds.get(e.data.guild_id);
            if (guild) {
              oldPresence = guild.presences.get(e.data.user.id);
              guild.presences.set(e.data.user.id, newPresence);
            }
          }
          this.emit("presenceUpdate", guild, oldPresence, newPresence);
          break;
        }

        case "MESSAGE_CREATE": {
          const message = new Message(this, e.data);

          const channelMessages = this.messages.get(e.data.channel_id);
          if (!channelMessages) {
            this.messages.set(e.data.channel_id, new Map());
          }
          channelMessages!.set(e.data.id, message);

          let channel: TextBasedChannel | undefined;
          if (e.data.guild_id) {
            channel = this.guildChannels.get(
              e.data.channel_id,
            ) as TextBasedGuildChannels | undefined;

            if (channel) {
              channel.lastMessageId = e.data.id;

              this.guilds.get(channel.guildId)?.channels.set(
                channel.id,
                channel,
              );
            }
          } else {
            channel = this.dmChannels.get(e.data.channel_id);

            if (channel) {
              channel.lastMessageId = e.data.id;
            }
          }
          this.emit("messageCreate", channel, message);
          break;
        }
        case "MESSAGE_UPDATE": {
          let newMessage: Message | undefined;

          const channelMessages = this.messages.get(e.data.channel_id);
          if (!channelMessages) {
            this.messages.set(e.data.channel_id, new Map());
          }
          const oldMessage = channelMessages!.get(e.data.id);

          if (oldMessage) {
            newMessage = new Message(this, {
              ...oldMessage.raw,
              ...e.data,
            });
            channelMessages!.set(e.data.id, newMessage);
          }

          this.emit(
            "messageUpdate",
            oldMessage,
            newMessage || parsePartialMessage(this, e.data),
          );
          break;
        }
        case "MESSAGE_DELETE": {
          const channelMessages = this.messages.get(e.data.channel_id);
          const message = channelMessages?.get(e.data.id);
          channelMessages?.delete(e.data.id);

          this.emit(
            "messageDelete",
            message || {
              id: e.data.id,
              channelId: e.data.channel_id,
              guildId: e.data.guild_id,
            },
          );
          break;
        }
        case "MESSAGE_DELETE_BULK": {
          const deletedMessages = new Map<Snowflake, Message | Snowflake>();
          const channelMessages = this.messages.get(e.data.channel_id);

          for (const id of e.data.ids) {
            const message = channelMessages?.get(id);
            deletedMessages.set(id, message || id);
            channelMessages?.delete(id);
          }

          this.emit("messageDeleteBulk", e.data.channel_id, deletedMessages);
          break;
        }

        case "MESSAGE_REACTION_ADD": {
          const user = this.users.get(e.data.user_id);
          const channelMessages = this.messages.get(e.data.channel_id);
          const message = channelMessages?.get(e.data.message_id);
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
          }

          this.emit(
            "messageReactionAdd",
            e.data.channel_id,
            message || e.data.message_id,
            e.data.emoji,
            user || e.data.user_id,
          );
          break;
        }
        case "MESSAGE_REACTION_REMOVE": {
          const user = this.users.get(e.data.user_id);
          const channelMessages = this.messages.get(e.data.channel_id);
          const message = channelMessages?.get(e.data.message_id);
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
          }

          this.emit(
            "messageReactionRemove",
            e.data.channel_id,
            message || e.data.message_id,
            e.data.emoji,
            user || e.data.user_id,
          );
          break;
        }
        case "MESSAGE_REACTION_REMOVE_ALL": {
          const channelMessages = this.messages.get(e.data.channel_id);
          const message = channelMessages?.get(e.data.message_id);
          message?.reactions.clear();

          this.emit(
            "messageReactionRemoveAll",
            e.data.channel_id,
            message || e.data.message_id,
          );
          break;
        }
        case "MESSAGE_REACTION_REMOVE_EMOJI": {
          const channelMessages = this.messages.get(e.data.channel_id);
          const message = channelMessages?.get(e.data.message_id);
          message?.reactions.delete(e.data.emoji.id ?? e.data.emoji.name!);

          this.emit(
            "messageReactionRemoveEmoji",
            e.data.channel_id,
            message || e.data.message_id,
            e.data.emoji,
          );
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
        case "GUILD_MEMBERS_CHUNK": {
          const guild = this.guilds.get(e.data.guild_id);
          const members = new Map(
            e.data.members.map(
              (member) => [
                member.user.id,
                new GuildMember(this, member, e.data.guild_id),
              ],
            ),
          );
          if (guild) {
            guild.members = new Map({
              ...guild.members.entries(),
              ...members.entries(),
            });
            if (e.data.presences) {
              for (const presence of e.data.presences) {
                guild.presences.set(
                  presence.user.id,
                  parsePresence(this, presence),
                );
              }
            }
          }
          this.emit("guildMembersChunk", guild || e.data.guild_id, members, {
            index: e.data.chunk_index,
            amount: e.data.chunk_count,
            notFound: e.data.not_found,
            nonce: e.data.nonce,
          });
          break;
        }
        case "VOICE_SERVER_UPDATE":
          break;
      }
    });
  }

  /**
   * Connects the client to the gateway and sets the token for the rest client.
   * Resolves once all shards are connected.
   */
  async connect(token: string): Promise<void> {
    this.rest.token = token;
    await this.gateway.connect(token);
    this.emit("ready", undefined);
  }

  /** Creates a new guild. */
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
  } = {}): Promise<RestGuild> {
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

  /** Fetches the preview of the given guild id. */
  async getGuildPreview(guildId: Snowflake): Promise<guild.Preview> {
    return await this.rest.getGuildPreview(guildId);
  }

  /** Fetches the invite of the given invite code. */
  async getInvite(code: string): Promise<Invite> {
    return parseInvite(this, await this.rest.getInvite(code));
  }

  /** Deletes an invite. */
  async deleteInvite(code: string, reason?: string): Promise<Invite> {
    const invite = await this.rest.deleteInvite(code, reason);

    return parseInvite(this, invite);
  }

  /** Fetches an user with given id. */
  async getUser(userId: Snowflake): Promise<User> {
    const user = new User(this, await this.rest.getUser(userId));
    this.users.set(user.id, user);
    return user;
  }

  /** Fetches a webhook with given id. */
  async getWebhook(webhookId: Snowflake, token?: string): Promise<Webhook> {
    let webhook;
    if (token) {
      webhook = await this.rest.getWebhookWithToken(webhookId, token);
    } else {
      webhook = await this.rest.getWebhook(webhookId);
    }
    return parseWebhook(this, webhook);
  }

  /** Edits a webhook. */
  async editWebhook(
    webhookId: Snowflake,
    options: {
      name?: string;
      avatar?: string | null;
      channelId?: Snowflake;
    },
    token?: string,
    reason?: string,
  ): Promise<Webhook> {
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

  /** Deletes a webhook. */
  async deleteWebhook(
    webhookId: Snowflake,
    token?: string,
    reason?: string,
  ): Promise<void> {
    if (token) {
      await this.rest.deleteWebhookWithToken(webhookId, token, reason);
    } else {
      await this.rest.deleteWebhook(webhookId, reason);
    }
  }

  /** Executes a webhook. */
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

  // TODO: handle template

  /** Requests guild members. These then will be received through the guildMembersChunk event. */
  requestGuildMembers(
    shardNumber: number,
    guildIds: Snowflake | Snowflake[],
    options: RequestGuildMembersOptions,
  ): void {
    this.gateway.guildRequestMember(shardNumber, {
      guild_id: guildIds,
      query: options.query,
      limit: options.limit,
      presences: options.presences,
      user_ids: options.userIds,
      nonce: options.nonce,
    });
  }

  /** Updates the current user's status. */
  statusUpdate(shardNumber: number, data: {
    since: number | null;
    activities: Activity[] | null;
    status: presence.ActiveStatus;
    afk: boolean;
  }): void {
    this.gateway.statusUpdate(shardNumber, {
      since: data.since,
      activities: data.activities?.map((activity) =>
        unparseActivity(activity)
      ) ?? null,
      status: data.status,
      afk: data.afk,
    });
  }

  // utils

  newChannelSwitch(
    data: Exclude<channel.Channel, channel.GroupDMChannel>,
  ): Channel {
    switch (data.type) {
      case 0:
        return new TextChannel(this, data);
      case 1:
        return new DMChannel(this, data);
      case 2:
        return new VoiceChannel(this, data);
      case 4:
        return new CategoryChannel(this, data);
      case 5:
        return new NewsChannel(this, data);
      case 6:
        return new StoreChannel(this, data);
    }
  }

  /** Sends a new message to the specified channel. */
  async sendMessage(
    channelId: Snowflake,
    data: SendMessageOptions,
  ): Promise<Message> {
    let embed;
    if (data.embed) {
      embed = unparseEmbed(data.embed);
    }

    let convertedData: message.BaseCreate = {
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

    const message = await this.rest.createMessage(
      channelId,
      convertedData as message.Create,
    );

    return new Message(this, message);
  }

  async awaitMessages(
    channelId: string,
    filter: (msg: Message) => boolean,
    options: AwaitMessagesOptions,
  ): Promise<Message[]> {
    return new Promise((_resolve) => {
      const found: Message[] = [];
      let i = 0;
      function listener(_: unknown, message: Message) {
        if (message.channelId !== channelId) return;
        i++;
        if (filter(message)) found.push(message);
        if (options.max && found.length >= options.max) resolve(found);
        if (options.maxProcessed && i >= options.maxProcessed) resolve(found);
      }
      const resolve = (found: Message[]) => {
        this.off("messageCreate", listener);
        _resolve(found);
      };

      if (options.time) setTimeout(() => resolve(found), options.time);
      this.on("messageCreate", listener);
    });
  }
}
