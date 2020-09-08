import { SnowflakeBase } from "./Base.ts";
import type { Channel, Client, GuildChannels } from "../Client.ts";
import type {
  channel,
  guild,
  guildMember,
  role,
  Snowflake,
} from "../discord.ts";
import { ImageFormat, ImageSize, imageURLFormatter } from "../utils/utils.ts";
import { Role } from "./Role.ts";
import { GuildMember } from "./GuildMember.ts";
import { inverseTypeMap as channelInverseTypeMap } from "./BaseChannel.ts";
import type { DMChannel } from "./DMChannel.ts";
import type { GroupDMChannel } from "./GroupDMChannel.ts";
import type { PermissionOverwrite } from "./GuildChannel.ts";
import { unparsePermissionOverwrite } from "./GuildChannel.ts";
import { inverseActionType, parseAuditLog } from "./AuditLog.ts";
import { Integration, parseIntegration } from "./Integration.ts";
import { GuildEmoji, parseEmoji } from "./Emoji.ts";
import type { StoreChannel } from "./StoreChannel.ts";
import type { NewsChannel } from "./NewsChannel.ts";
import type { CategoryChannel } from "./CategoryChannel.ts";
import type { VoiceChannel } from "./VoiceChannel.ts";
import type { TextChannel } from "./TextChannel.ts";
import { parseState, State } from "./VoiceState.ts";
import { parsePresence, Presence } from "./Presence.ts";
import { parseMetadataInvite } from "./Invite.ts";

interface CreateChannel {
  type?: Exclude<keyof typeof channelInverseTypeMap, "DM" | "groupDM">;
  topic?: string;
  bitrate?: number;
  userLimit?: number;
  slowMode?: number;
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

const featuresMap = {
  "INVITE_SPLASH": "inviteSplash",
  "VIP_REGIONS": "vipRegions",
  "VANITY_URL": "vanityURL",
  "VERIFIED": "verified",
  "PARTNERED": "partnered",
  "PUBLIC": "public",
  "COMMERCE": "commerce",
  "NEWS": "news",
  "DISCOVERABLE": "discoverable",
  "FEATURABLE": "featurable",
  "ANIMATED_ICON": "animatedIcon",
  "BANNER": "banner",
  "PUBLIC_DISABLED": "publicDisabled",
} as const;

abstract class BaseGuild extends SnowflakeBase {
  name: string;
  icon: string | null;
  splash: string | null;
  discoverySplash: string | null;
  ownerId: Snowflake;
  region: string;
  afkChannelId: Snowflake | null;
  afkTimeout: number;
  verificationLevel: guild.VerificationLevel;
  defaultNotifyAllMessages: boolean;
  explicitContentFilter: guild.ExplicitContentFilter;
  roles: Map<Snowflake, Role>;
  emojis: Map<Snowflake, GuildEmoji>;
  features = {} as Record<typeof featuresMap[keyof typeof featuresMap], boolean>;
  requiresMFA: boolean;
  applicationId: Snowflake | null;
  widgetEnabled?: boolean;
  widgetChannelId?: Snowflake | null;
  systemChannelId: Snowflake | null;
  systemChannelFlags: number;
  rulesChannelId: Snowflake | null;
  maxPresences?: number | null;
  maxMembers?: number;
  vanityURLCode: string | null;
  description: string | null;
  banner: string | null;
  boostLevel: 0 | 1 | 2 | 3;
  boostCount?: number;
  preferredLocale: string;
  publicUpdatesChannelId: Snowflake | null;
  maxVideoChannelUsers?: number;

  protected constructor(client: Client, data: guild.BaseGuild) {
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
    this.systemChannelFlags = data.system_channel_flags;
    this.rulesChannelId = data.rules_channel_id;
    this.maxPresences = data.max_presences;
    this.maxMembers = data.max_members;

    this.vanityURLCode = data.vanity_url_code;
    this.description = data.description;
    this.banner = data.banner;
    this.boostLevel = data.premium_tier;
    this.boostCount = data.premium_subscription_count;
    this.preferredLocale = data.preferred_locale;
    this.publicUpdatesChannelId = data.public_updates_channel_id;
    this.maxVideoChannelUsers = data.max_video_channel_users;
  }

  get shardId() {
    return (+this.id / (2 ** 22)) % this.client.gateway.shardAmount;
  }

  async delete() {
    await this.client.rest.deleteGuild(this.id);
  }

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
    banner?: string | null;
    systemChannelId?: Snowflake | null;
    rulesChannelId?: Snowflake | null;
    publicUpdatesChannelId?: Snowflake | null;
    preferredLocale?: string | null;
  }, reason?: string) {
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
      banner: options.banner,
      system_channel_id: options.systemChannelId,
      rules_channel_id: options.rulesChannelId,
      public_updates_channel_id: options.publicUpdatesChannelId,
      preferred_locale: options.preferredLocale,
    }, reason);

    return new RestGuild(this.client, guild);
  }

  async unban(userId: Snowflake, reason?: string) {
    await this.client.rest.removeGuildBan(this.id, userId, reason);
  }

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
  ): Promise<Exclude<Channel, DMChannel | GroupDMChannel>> {
    const permissionOverwrites = options.permissionOverwrites?.map(
      ({ permissions, id, type }) => {
        const { allow, deny } = unparsePermissionOverwrite(permissions);

        return {
          id,
          type,
          allow,
          deny,
        };
      },
    );

    const channel = await this.client.rest.createGuildChannel(this.id, {
      name,
      type: options.type ? channelInverseTypeMap[options.type] : undefined,
      topic: options.topic,
      bitrate: options.bitrate,
      user_limit: options.userLimit,
      rate_limit_per_user: options.slowMode,
      position: options.position,
      permission_overwrites: permissionOverwrites,
      parent_id: options.parentId,
      nsfw: options.nsfw,
    }, reason);

    return this.client.newChannelSwitch(channel) as GuildChannels;
  }

  async editChannelsPositions(options: channel.GuildPosition[]) {
    await this.client.rest.modifyGuildChannelPositions(this.id, options);
  }

  async createEmoji(
    name: string,
    image: string,
    roles: Snowflake[] = [],
    reason?: string,
  ) {
    const emoji = await this.client.rest.createGuildEmoji(this.id, {
      name,
      image,
      roles,
    }, reason);

    return parseEmoji(this.client, emoji);
  }

  async modifyEmoji(emojiId: string, options: {
    name?: string;
    roles?: Snowflake[] | null;
  } = {}, reason?: string) {
    const emoji = await this.client.rest.modifyGuildEmoji(
      this.id,
      emojiId,
      options,
      reason,
    );

    return parseEmoji(this.client, emoji);
  }

  async deleteEmoji(emojiId: string, reason?: string) {
    await this.client.rest.deleteGuildEmoji(this.id, emojiId, reason);
  }

  async createRole(options: role.Create = {}, reason?: string) {
    const role = await this.client.rest.createGuildRole(
      this.id,
      options,
      reason,
    );

    return new Role(this.client, role, this.id);
  }

  async editRolesPositions(options: role.ModifyPosition[]) {
    await this.client.rest.modifyGuildRolePositions(this.id, options);
  }

  async getAuditLog(options: {
    userId: Snowflake;
    actionType: keyof typeof inverseActionType;
    before: Snowflake;
    limit: number;
  }) {
    return parseAuditLog(
      this.client,
      await this.client.rest.getGuildAuditLog(this.id, {
        user_id: options.userId,
        action_type: inverseActionType[options.actionType],
        before: options.before,
        limit: options.limit,
      }),
    );
  }

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

  async getIntegrations() {
    const integrations = await this.client.rest.getGuildIntegrations(this.id);

    return integrations.map((integration) =>
      parseIntegration(this.client, integration)
    );
  }

  async addIntegration(integrationId: Snowflake, type: string) {
    await this.client.rest.createGuildIntegration(this.id, {
      id: integrationId,
      type,
    });
  }

  async syncIntegration(integrationId: Snowflake) {
    await this.client.rest.syncGuildIntegration(this.id, integrationId);
  }

  async editIntegration(
    integrationId: Snowflake,
    options: Pick<
      Integration,
      "expireBehavior" | "expireGracePeriod" | "enableEmoticons"
      >,
  ) {
    await this.client.rest.modifyGuildIntegration(this.id, integrationId, {
      expire_behavior: options.expireBehavior,
      expire_grace_period: options.expireGracePeriod,
      enable_emoticons: options.enableEmoticons,
    });
  }

  async removeIntegration(integrationId: Snowflake) {
    await this.client.rest.deleteGuildIntegration(this.id, integrationId);
  }

  async getWidget() {
    return this.client.rest.getGuildWidget(this.id);
  }

  async editWidget(options: {
    enabled?: boolean;
    channelId?: Snowflake | null;
  }) {
    return this.client.rest.modifyGuildWidget(this.id, {
      enabled: options.enabled,
      channel_id: options.channelId,
    });
  }

  async leave() {
    await this.client.rest.leaveGuild(this.id);
  }

  async addMember(
    userId: Snowflake,
    accessToken: string,
    options: Omit<guildMember.Add, "access_token"> = {},
  ) {
    await this.client.rest.addGuildMember(this.id, userId, {
      access_token: accessToken,
      ...options,
    });
  }

  async getInvites() {
    const invites = await this.client.rest.getGuildInvites(this.id);

    return invites.map(invite => parseMetadataInvite(this.client, invite));
  }

  iconURL(options: {
    format?: ImageFormat;
    size?: ImageSize;
  } = {}) {
    return this.icon
      ? imageURLFormatter(`icons/${this.id}/${this.icon}`, options)
      : null;
  }

  bannerURL(options: {
    format?: Exclude<ImageFormat, "gif">;
    size?: ImageSize;
  } = {}) {
    return this.banner
      ? imageURLFormatter(`icons/${this.id}/${this.banner}`, options)
      : null;
  }

  splashURL(options: {
    format?: Exclude<ImageFormat, "gif">;
    size?: ImageSize;
  } = {}) {
    return this.splash
      ? imageURLFormatter(`icons/${this.id}/${this.splash}`, options)
      : null;
  }

  discoverySplashURL(options: {
    format?: Exclude<ImageFormat, "gif">;
    size?: ImageSize;
  } = {}) {
    return this.discoverySplash
      ? imageURLFormatter(`icons/${this.id}/${this.discoverySplash}`, options)
      : null;
  }
}

export class RestGuild extends BaseGuild {
  widgetEnabled!: boolean;
  widgetChannelId!: Snowflake | null;
  maxPresences!: number | null;
  maxMembers!: number;

  constructor(client: Client, data: guild.RESTGuild) {
    super(client, data);
  }
}

export class GatewayGuild extends BaseGuild {
  joinedAt: number;
  large: boolean;
  unavailable: boolean;
  memberCount: number;
  voiceStates: Map<Snowflake, State>;
  members: Map<Snowflake, GuildMember>;
  channels: Map<Snowflake, GuildChannels>;
  presences: Map<Snowflake, Presence>;

  constructor(client: Client, data: guild.GatewayGuild) {
    super(client, data);

    this.joinedAt = Date.parse(data.joined_at);
    this.large = data.large;
    this.unavailable = data.unavailable;
    this.memberCount = data.member_count;
    this.voiceStates = new Map(data.voice_states.map(state => [state.user_id, parseState(state, client)]));
    this.members = new Map(data.members.map((member) => [member.user.id, new GuildMember(client, member, data.id)]));
    this.channels = new Map(
      data.channels.map(
        (channel) => [
          channel.id,
          client.newChannelSwitch(channel) as GuildChannels,
        ],
      ),
    );
    this.presences = new Map(data.presences.map(presence => [presence.user.id, parsePresence(client, presence)]));
  }
}
