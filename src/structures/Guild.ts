import { SnowflakeBase } from "./Base.ts";
import type {
  Client,
  GuildChannels,
  RequestGuildMembersOptions,
} from "../Client.ts";
import type {
  channel,
  guild,
  guildMember,
  role,
  Snowflake,
} from "../discord/mod.ts";
import {
  ImageFormat,
  ImageSize,
  imageURLFormatter,
  inverseMap,
} from "../utils/utils.ts";
import { Role } from "./Role.ts";
import { GuildMember } from "./GuildMember.ts";
import type { PermissionOverwrite } from "./GuildChannel.ts";
import { unparsePermissionOverwrite } from "./GuildChannel.ts";
import { AuditLog, inverseActionType, parseAuditLog } from "./AuditLog.ts";
import { Integration, parseIntegration } from "./Integration.ts";
import { GuildEmoji, parseEmoji } from "./Emoji.ts";
import type { StoreChannel } from "./StoreChannel.ts";
import type { CategoryChannel } from "./CategoryChannel.ts";
import type { VoiceChannel } from "./VoiceChannel.ts";
import type { NewsChannel, TextChannel } from "./TextNewsChannel.ts";
import { parseState, State } from "./VoiceState.ts";
import { parsePresence, Presence } from "./Presence.ts";
import { MetadataInvite, parseMetadataInvite } from "./Invite.ts";
import { parseWebhook, Webhook } from "./Webhook.ts";
import {
  parseWelcomeScreen,
  WelcomeScreen,
  WelcomeScreenChannel,
} from "./WelcomeScreen.ts";

const channelTypeMap = {
  "text": 0,
  "dm": 1,
  "voice": 2,
  "category": 4,
  "news": 5,
  "store": 6,
} as const;

interface CreateChannel {
  type?: Exclude<keyof typeof channelTypeMap, "dm">;
  topic?: string;
  bitrate?: number;
  userLimit?: number;
  slowmode?: number;
  position?: number;
  permissionOverwrites?: PermissionOverwrite[];
  parentId?: Snowflake;
  nsfw?: boolean;
}

interface BasePrune {
  computePruneCount?: boolean;
  days?: number;
  includeRoles?: Snowflake[];
  dry?: boolean;
}

interface DryPrune extends BasePrune {
  computePruneCount: undefined;
  dry: true;
}

interface RealPrune extends BasePrune {
  dry?: false;
}

type Prune = DryPrune | RealPrune;

interface GuildPosition {
  id: Snowflake;
  position: number | null;
  lockPermissions: boolean | null;
  parentId: Snowflake | null;
}

const featuresMap = {
  "INVITE_SPLASH": "inviteSplash",
  "VIP_REGIONS": "vipRegions",
  "VANITY_URL": "vanityURL",
  "VERIFIED": "verified",
  "PARTNERED": "partnered",
  "COMMUNITY": "community",
  "COMMERCE": "commerce",
  "NEWS": "news",
  "DISCOVERABLE": "discoverable",
  "FEATURABLE": "featurable",
  "ANIMATED_ICON": "animatedIcon",
  "BANNER": "banner",
  "WELCOME_SCREEN_ENABLED": "welcomeScreenEnabled",
  "MEMBER_VERIFICATION_GATE_ENABLED": "memberVerificationGateEnabled",
  "PREVIEW_ENABLED": "previewEnabled",
} as const;

const inverseFeaturesMap = inverseMap(featuresMap);

export interface Widget {
  enabled: boolean;
  channelId: Snowflake | null;
}

const systemChannelFlags = {
  1: "suppressJoinNotifications",
  2: "suppressBoostNotifications",
  3: "suppressGuildReminderNotifications",
} as const;

export const inverseSystemChannelFlags = inverseMap(systemChannelFlags);

abstract class BaseGuild<T extends guild.BaseGuild> extends SnowflakeBase<T> {
  /** The name of the guild. */
  name: string;
  /** The icon hash of the guild. Null if no icon is set. */
  icon: string | null;
  /** The splash hash of the guild. Null if no splash is set. */
  splash: string | null;
  /** The discovery splash hash of the guild. Null if no discovery splash is set. */
  discoverySplash: string | null;
  /** The id of the owner of the guild. */
  ownerId: Snowflake;
  /** The region the server for this guild is located in. */
  region: string;
  /** The id for the voice AFK channel. Null if not set. */
  afkChannelId: Snowflake | null;
  /** The duration someone is moved to the AFK channel since they have been AFK. */
  afkTimeout: number;
  /** The level of verification the guild is set to for users to be able to join. */
  verificationLevel: guild.VerificationLevel;
  /** Whether or not notification for all messages is enabled. */
  defaultNotifyAllMessages: boolean;
  /** The level at which explicit messages are deleted. */
  explicitContentFilter: guild.ExplicitContentFilter;
  /** A map of all roles in a guild, indexed by their id. */
  roles: Map<Snowflake, Role>;
  /** A map of all emojis in a guild, indexed by their id. */
  emojis: Map<Snowflake, GuildEmoji>;
  /**
   * An object of features the guild can have.
   * If the guild has a feature, that feature is set to true.
   */
  features = {} as Record<keyof typeof inverseFeaturesMap, boolean>;
  /** Whether or not the guild requires MFA enabled for moderation. */
  requiresMFA: boolean;
  /**
   * The id of the application that made this guild.
   * Null if the guild wasn't made by an application.
   */
  applicationId: Snowflake | null;
  /**
   * Whether or not the widget for this guild is enabled.
   * Only passed in RESTGuild and on guildUpdate event.
   * If the guild was updated & cached, then it is also in the cached guild instance.
   */
  widgetEnabled?: boolean;
  /**
   * The id for the channel the widget uses for this guild.
   * Null if widget is not enabled.
   * Only passed in RESTGuild and on guildUpdate event.
   * If the guild was updated & cached, then it is also in the cached guild instance.
   */
  widgetChannelId?: Snowflake | null;
  /** The id of the channel in which system messages are sent in. Null if none is set. */
  systemChannelId: Snowflake | null;
  /**
   * An object of flags the system channel the guild can have.
   * If the system channel has a flag, that flag is set to true.
   */
  systemChannelFlags = {} as Record<
    keyof typeof inverseSystemChannelFlags,
    boolean
  >;
  /** The id of the channel in which rules for the guild are described. Null if none is set. */
  rulesChannelId: Snowflake | null;
  /**
   * the maximum number of presences for the guild.
   * Only passed in RESTGuild and on guildUpdate event.
   * If the guild was updated & cached, then it is also in the cached guild instance.
   */
  maxPresences?: number;
  /**
   * the maximum number of members that can be in the guild.
   * Only passed in RESTGuild and on guildUpdate event.
   * If the guild was updated & cached, then it is also in the cached guild instance.
   */
  maxMembers?: number;
  /** The vanity url code for the guild. Null if there is no vanity url code. */
  vanityURLCode: string | null;
  /** The description for the guild. Null if there is no description. */
  description: string | null;
  /** The banner hash of the guild. Null if no discovery banner is set. */
  banner: string | null;
  /** The boost level this guild has. */
  boostLevel: 0 | 1 | 2 | 3;
  /** The amount of members have boosted this guild. */
  boostCount?: number;
  /** The preferred locale for this guild. */
  preferredLocale: string;
  /**
   * The id of the channel in which moderators receive updates from discord.
   * Null if none is set.
   */
  publicUpdatesChannelId: Snowflake | null;
  /** The maximum amount of users that can be in a video channel. */
  maxVideoChannelUsers?: number;
  /** the welcome screen of a Community guild, shown to new members. */
  welcomeScreen?: WelcomeScreen;

  protected constructor(client: Client, data: T) {
    super(client, data);

    this.name = data.name;
    this.icon = data.icon;
    this.splash = data.splash;
    this.discoverySplash = data.discovery_splash;
    this.ownerId = data.owner_id;
    this.region = data.region;
    this.afkChannelId = data.afk_channel_id;
    this.afkTimeout = data.afk_timeout;
    this.verificationLevel = data.verification_level;
    this.defaultNotifyAllMessages = !data.default_message_notifications;
    this.explicitContentFilter = data.explicit_content_filter;
    this.roles = new Map(
      data.roles.map((role) => [role.id, new Role(client, role, data.id)]),
    );
    this.emojis = new Map(
      data.emojis.map((emoji) => [emoji.id, parseEmoji(client, emoji)]),
    );

    for (const [key, val] of Object.entries(featuresMap)) {
      this.features[val] = data.features.includes(key as guild.Features);
    }

    this.requiresMFA = !!data.mfa_level;
    this.applicationId = data.application_id;
    this.widgetEnabled = data.widget_enabled;
    this.widgetChannelId = data.widget_channel_id;
    this.systemChannelId = data.system_channel_id;

    for (const [key, val] of Object.entries(systemChannelFlags)) {
      this.systemChannelFlags[val] =
        ((data.system_channel_flags & +key) === +key);
    }

    this.rulesChannelId = data.rules_channel_id;
    this.maxPresences = data.max_presences === null
      ? 25000
      : data.max_presences;
    this.maxMembers = data.max_members;

    this.vanityURLCode = data.vanity_url_code;
    this.description = data.description;
    this.banner = data.banner;
    this.boostLevel = data.premium_tier;
    this.boostCount = data.premium_subscription_count;
    this.preferredLocale = data.preferred_locale;
    this.publicUpdatesChannelId = data.public_updates_channel_id;
    this.maxVideoChannelUsers = data.max_video_channel_users;
    this.welcomeScreen = data.welcome_screen &&
      parseWelcomeScreen(data.welcome_screen);
  }

  /** The number of the shard this guild belongs to. */
  get shardNumber(): number {
    return (+this.id / (2 ** 22)) % this.client.gateway.shardAmount;
  }

  requestGuildMembers(options: RequestGuildMembersOptions) {
    this.client.requestGuildMembers(this.shardNumber, this.id, options);
  }

  /** Deletes this guild. */
  async delete(): Promise<void> {
    await this.client.rest.deleteGuild(this.id);
  }

  /**
   * Deletes this guild.
   * Returns a RestGuild, even if the current instance is an instance of GatewayGuild.
   */
  async edit(options: {
    name?: string;
    region?: string | null;
    verificationLevel?: guild.VerificationLevel | null;
    defaultNotifyAllMessages?: boolean | null;
    explicitContentFilter?: guild.ExplicitContentFilter | null;
    afkChannelId?: Snowflake | null;
    afkTimeout?: number;
    icon?: string | null;
    ownerId?: Snowflake;
    splash?: string | null;
    discoverySplash?: string | null;
    banner?: string | null;
    systemChannelId?: Snowflake | null;
    systemChannelFlags?: (keyof typeof inverseSystemChannelFlags)[];
    rulesChannelId?: Snowflake | null;
    publicUpdatesChannelId?: Snowflake | null;
    preferredLocale?: string | null;
    features?: (keyof typeof inverseFeaturesMap)[];
    description?: string | null;
  }, reason?: string): Promise<RestGuild> {
    const guild = await this.client.rest.modifyGuild(this.id, {
      name: options.name,
      region: options.region,
      verification_level: options.verificationLevel,
      default_message_notifications:
        typeof options.defaultNotifyAllMessages === "boolean"
          ? +!options.defaultNotifyAllMessages as 0 | 1
          : options.defaultNotifyAllMessages,
      explicit_content_filter: options.explicitContentFilter,
      afk_channel_id: options.afkChannelId,
      afk_timeout: options.afkTimeout,
      icon: options.icon,
      owner_id: options.ownerId,
      splash: options.splash,
      discovery_splash: options.discoverySplash,
      banner: options.banner,
      system_channel_id: options.systemChannelId,
      system_channel_flags: options.systemChannelFlags?.reduce(
        (acc, flag) => acc + Number(inverseSystemChannelFlags[flag]),
        0,
      ),
      rules_channel_id: options.rulesChannelId,
      public_updates_channel_id: options.publicUpdatesChannelId,
      preferred_locale: options.preferredLocale,
      features: options.features?.map((feature) => inverseFeaturesMap[feature]),
      description: options.description,
    }, reason);

    return new RestGuild(this.client, guild);
  }

  /** Creates a new channel. */
  async createChannel(
    name: string,
    options?: CreateChannel & { type?: "text" },
    reason?: string,
  ): Promise<TextChannel>;
  async createChannel(
    name: string,
    options?: CreateChannel & { type: "voice" },
    reason?: string,
  ): Promise<VoiceChannel>;
  async createChannel(
    name: string,
    options?: CreateChannel & { type: "category" },
    reason?: string,
  ): Promise<CategoryChannel>;
  async createChannel(
    name: string,
    options?: CreateChannel & { type: "news" },
    reason?: string,
  ): Promise<NewsChannel>;
  async createChannel(
    name: string,
    options?: CreateChannel & { type: "store" },
    reason?: string,
  ): Promise<StoreChannel>;
  async createChannel(
    name: string,
    options: CreateChannel = {},
    reason?: string,
  ): Promise<GuildChannels> {
    const permissionOverwrites: channel.Overwrite[] | null | undefined = options
      .permissionOverwrites?.map(
        ({ permissions, id, type }) => {
          const { allow, deny } = unparsePermissionOverwrite(permissions);

          return {
            id,
            type: type === "member" ? 1 : 0,
            allow,
            deny,
          };
        },
      );

    const channel = await this.client.rest.createGuildChannel(this.id, {
      name,
      type: options.type ? channelTypeMap[options.type] : undefined,
      topic: options.topic,
      bitrate: options.bitrate,
      user_limit: options.userLimit,
      rate_limit_per_user: options.slowmode,
      position: options.position,
      permission_overwrites: permissionOverwrites,
      parent_id: options.parentId,
      nsfw: options.nsfw,
    }, reason);

    return this.client.newChannelSwitch(channel) as GuildChannels;
  }

  /** Edits the position of channels. */
  async editChannelsPositions(options: GuildPosition[]): Promise<void> {
    await this.client.rest.modifyGuildChannelPositions(
      this.id,
      options.map((p) => ({
        id: p.id,
        position: p.position,
        lock_permissions: p.lockPermissions,
        parent_id: p.parentId,
      })),
    );
  }

  /** Unbans a user. */
  async unban(userId: Snowflake, reason?: string): Promise<void> {
    await this.client.rest.removeGuildBan(this.id, userId, reason);
  }

  /** Creates a new emoji. */
  async createEmoji(
    name: string,
    image: string,
    roles: Snowflake[] = [],
    reason?: string,
  ): Promise<GuildEmoji> {
    const emoji = await this.client.rest.createGuildEmoji(this.id, {
      name,
      image,
      roles,
    }, reason);

    return parseEmoji(this.client, emoji);
  }

  /** Edits an emoji. */
  async modifyEmoji(emojiId: string, options: {
    name?: string;
    roles?: Snowflake[] | null;
  } = {}, reason?: string): Promise<GuildEmoji> {
    const emoji = await this.client.rest.modifyGuildEmoji(
      this.id,
      emojiId,
      options,
      reason,
    );

    return parseEmoji(this.client, emoji);
  }

  /** Deletes an emoji. */
  async deleteEmoji(emojiId: string, reason?: string): Promise<void> {
    await this.client.rest.deleteGuildEmoji(this.id, emojiId, reason);
  }

  /** Creates a new role. */
  async createRole(options: role.Create = {}, reason?: string): Promise<Role> {
    const role = await this.client.rest.createGuildRole(
      this.id,
      options,
      reason,
    );

    return new Role(this.client, role, this.id);
  }

  /** Edits the position of roles. */
  async editRolesPositions(options: role.ModifyPosition[]): Promise<void> {
    await this.client.rest.modifyGuildRolePositions(this.id, options);
  }

  /** Fetches the audit log. */
  async getAuditLog(options: {
    userId?: Snowflake;
    actionType?: keyof typeof inverseActionType;
    before?: Snowflake;
    limit?: number;
  } = {}): Promise<AuditLog> {
    return parseAuditLog(
      this.client,
      await this.client.rest.getGuildAuditLog(this.id, {
        user_id: options.userId,
        action_type: options.actionType &&
          inverseActionType[options.actionType],
        before: options.before,
        limit: options.limit,
      }),
    );
  }

  /**
   * Prunes members.
   * If dry is set to true, it wont prune any members and return the amount of
   * members that would have been pruned.
   */
  async prune(
    options: Prune & { dry?: false },
    reason?: string,
  ): Promise<number | null>;
  async prune(options: Prune & { dry: true }): Promise<number>;
  async prune(
    options: Prune = { dry: false },
    reason?: string,
  ): Promise<number | null> {
    let prune;

    if (options.dry) {
      prune = await this.client.rest.getGuildPruneCount(this.id, {
        days: options.days,
        include_roles: options.includeRoles?.join(","),
      });
    } else {
      prune = await this.client.rest.beginGuildPrune(this.id, {
        compute_prune_count: options.computePruneCount,
        days: options.days,
        include_roles: options.includeRoles,
      }, reason);
    }

    return prune.pruned;
  }

  /** Fetches an array of integrations connected to this guild. */
  async getIntegrations(): Promise<Integration[]> {
    const integrations = await this.client.rest.getGuildIntegrations(this.id);

    return integrations.map((integration) =>
      parseIntegration(this.client, integration)
    );
  }

  /** Removes an integration from this guild. */
  async removeIntegration(integrationId: Snowflake): Promise<void> {
    await this.client.rest.deleteGuildIntegration(this.id, integrationId);
  }

  /** Fetches the widget for this guild. */
  async getWidgetSettings(): Promise<Widget> {
    const widget = await this.client.rest.getGuildWidgetSettings(this.id);

    return {
      enabled: widget.enabled,
      channelId: widget.channel_id,
    };
  }

  /** Edits the widget for this guild. */
  async editWidget(options: Partial<Widget>): Promise<Widget> {
    const widget = await this.client.rest.modifyGuildWidget(this.id, {
      enabled: options.enabled,
      channel_id: options.channelId,
    });

    return {
      enabled: widget.enabled,
      channelId: widget.channel_id,
    };
  }

  /** Leave the guild. */
  async leave(): Promise<void> {
    await this.client.rest.leaveGuild(this.id);
  }

  /** Add a new member to the guild. */
  async addMember(
    userId: Snowflake,
    accessToken: string,
    options: Omit<guildMember.Add, "access_token"> = {},
  ): Promise<GuildMember | undefined> {
    const member = await this.client.rest.addGuildMember(this.id, userId, {
      access_token: accessToken,
      ...options,
    });

    return member && new GuildMember(this.client, member, this.id);
  }

  /** Fetches an array of all invites for this guild. */
  async getInvites(): Promise<MetadataInvite[]> {
    const invites = await this.client.rest.getGuildInvites(this.id);

    return invites.map((invite) => parseMetadataInvite(this.client, invite));
  }

  /** Fetches an array of all webhooks in this guild. */
  async getWebhooks(): Promise<Webhook[]> {
    const webhooks = await this.client.rest.getGuildWebhooks(this.id);

    return webhooks.map((webhook) => parseWebhook(this.client, webhook));
  }

  /** Returns the url for the guild icon. Null if no icon is set. */
  iconURL(options: {
    format?: ImageFormat;
    size?: ImageSize;
  } = {}): string | null {
    return this.icon
      ? imageURLFormatter(`icons/${this.id}/${this.icon}`, options)
      : null;
  }

  /** Returns the url for the guild banner. Null if no banner is set. */
  bannerURL(options: {
    format?: Exclude<ImageFormat, "gif">;
    size?: ImageSize;
  } = {}): string | null {
    return this.banner
      ? imageURLFormatter(`icons/${this.id}/${this.banner}`, options)
      : null;
  }

  /** Returns the url for the guild splash. Null if no splash is set. */
  splashURL(options: {
    format?: Exclude<ImageFormat, "gif">;
    size?: ImageSize;
  } = {}): string | null {
    return this.splash
      ? imageURLFormatter(`icons/${this.id}/${this.splash}`, options)
      : null;
  }

  /** Returns the url for the guild discovery splash. Null if no discovery splash is set. */
  discoverySplashURL(options: {
    format?: Exclude<ImageFormat, "gif">;
    size?: ImageSize;
  } = {}): string | null {
    return this.discoverySplash
      ? imageURLFormatter(`icons/${this.id}/${this.discoverySplash}`, options)
      : null;
  }

  async modifyWelcomeScreen(data: {
    enabled?: boolean | null;
    channels?: WelcomeScreenChannel[] | null;
    description?: string | null;
  }) {
    const welcomeScreen = await this.client.rest.modifyGuildWelcomeScreen(
      this.id,
      {
        enabled: data.enabled,
        welcome_channels: data.channels?.map((channel) => ({
          channel_id: channel.channelId,
          description: channel.description,
          emoji_id: channel.emojiId,
          emoji_name: channel.emojiName,
        })),
        description: data.description,
      },
    );
    this.welcomeScreen = parseWelcomeScreen(welcomeScreen);
    return this;
  }
}

export class RestGuild<T extends guild.RESTGuild = guild.RESTGuild>
  extends BaseGuild<T> {
  widgetEnabled!: boolean;
  widgetChannelId!: Snowflake | null;
  maxPresences!: number;
  maxMembers!: number;

  constructor(client: Client, data: T) {
    super(client, data);
  }
}

export class GatewayGuild<T extends guild.GatewayGuild = guild.GatewayGuild>
  extends BaseGuild<T> {
  /** The unix timestamp the current user joined the guild. */
  joinedAt: number;
  /** Whether or not this guild is large. */
  large: boolean;
  /** Whether or not this guild is unavailable. */
  unavailable: boolean;
  /** The amount of members in this guild. */
  memberCount: number;
  /** A map of voice states in this guild, indexed by user id. */
  voiceStates: Map<Snowflake, State>;
  /** A map of members in this guild, indexed by their user id. */
  members: Map<Snowflake, GuildMember>;
  /** A map of channels in this guild, indexed by their id. */
  channels: Map<Snowflake, GuildChannels>;
  /** A map of presences in this guild, indexed by by user id. */
  presences: Map<Snowflake, Presence>;

  constructor(client: Client, data: T) {
    super(client, data);

    this.joinedAt = Date.parse(data.joined_at);
    this.large = data.large;
    this.unavailable = data.unavailable;
    this.memberCount = data.member_count;
    this.voiceStates = new Map(
      data.voice_states.map(
        (state) => [
          state.user_id,
          parseState({
            ...state,
            guild_id: data.id,
          }, client),
        ],
      ),
    );
    this.members = new Map(
      data.members.map((
        member,
      ) => [member.user.id, new GuildMember(client, member, data.id)]),
    );
    this.channels = new Map(
      data.channels.map(
        (channel) => [
          channel.id,
          client.newChannelSwitch(channel) as GuildChannels,
        ],
      ),
    );
    this.presences = new Map(
      data.presences.map(
        (presence) => [presence.user.id, parsePresence(client, presence)],
      ),
    );
  }
}
