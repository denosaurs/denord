import { SnowflakeBase } from "./Base.ts";
import { Client } from "../Client.ts";
import type {
  channel,
  emoji,
  guild,
  guildMember,
  role,
  Snowflake,
} from "../discord.ts";
import { ImageFormat, ImageSize, imageURLFormatter } from "../utils/utils.ts";
import { Role } from "./Role.ts";
import { GuildMember } from "./GuildMember.ts";
import { inverseTypeMap as channelInverseTypeMap } from "./BaseChannel.ts";

export class Guild extends SnowflakeBase {
  name: string;
  icon: string | null;
  splash: string | null;
  discoverySplash: string | null;
  amOwner: boolean;
  ownerId: Snowflake;
  permissions: bigint;
  region: string;
  afkChannelId: Snowflake | null;
  afkTimeout: number;
  verificationLevel: guild.VerificationLevel;
  defaultNotifyAllMessages: boolean;
  explicitContentFilter: guild.ExplicitContentFilter;
  roles: Map<Snowflake, Role>;
  requiresMFA: boolean;
  applicationId: Snowflake | null;
  systemChannelId: Snowflake | null;
  systemChannelFlags: number;
  rulesChannelId: Snowflake | null;
  joinedAt: number;
  large: boolean;
  unavailable: boolean;
  memberCount: number;
  members: GuildMember[];
  vanityURLCode: string | null;
  description: string | null;
  banner: string | null;
  boostLevel: 0 | 1 | 2 | 3;
  preferredLocale: string;
  publicUpdatesChannelId: Snowflake | null;

  constructor(client: Client, data: guild.GatewayGuild) {
    super(client, data);

    this.name = data.name;
    this.icon = data.icon;
    this.splash = data.splash;
    this.discoverySplash = data.discovery_splash;
    this.amOwner = data.owner;
    this.ownerId = data.owner_id;
    this.permissions = data.permissions_new;
    this.region = data.region;
    this.afkChannelId = data.afk_channel_id;
    this.afkTimeout = data.afk_timeout;
    this.verificationLevel = data.verification_level;
    this.defaultNotifyAllMessages = !data.default_message_notifications;
    this.explicitContentFilter = data.explicit_content_filter;
    this.roles = new Map<Snowflake, Role>(
      data.roles.map((role) => [role.id, new Role(client, role, data.id)]),
    );
    this.emojis = new Map<Snowflake, emoji.Emoji>(
      data.emojis.map((emoji) => [emoji.id!, emoji]),
    );
    this.features = data.features;
    this.requiresMFA = data.mfa_level;
    this.applicationId = data.application_id;
    this.widgetEnabled = data.widget_enabled;
    this.widgetChannelId = data.widget_channel_id;
    this.systemChannelId = data.system_channel_id;
    this.systemChannelFlags = data.system_channel_flags;
    this.rulesChannelId = data.rules_channel_id;

    this.joinedAt = Date.parse(data.joined_at);
    this.large = data.large;
    this.unavailable = data.unavailable;
    this.memberCount = data.member_count;
    this.voiceStates = data.voice_states;
    this.members = data.members.map((member) =>
      new GuildMember(client, member, data.id)
    );
    this.channels = data.channels;
    this.presences = data.presences;

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
  }) {
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
    });

    return new Guild(this.client, guild);
  }

  async unban(userId: Snowflake) {
    await this.client.rest.removeGuildBan(this.id, userId);
  }

  async createChannel(name: string, options: {
    type?: Exclude<keyof typeof channelInverseTypeMap, "DM" | "groupDM">;
    topic?: string;
    bitrate?: number;
    userLimit?: number;
    rateLimitPerUser?: number;
    position?: number;
    permissionOverwrites?: channel.OverwriteSend[];
    parentId?: Snowflake;
    nsfw?: boolean;
  }) {
    const channel = await this.client.rest.createGuildChannel(this.id, {
      name,
      type: options.type ? channelInverseTypeMap[options.type] : undefined,
      topic: options.topic,
      bitrate: options.bitrate,
      user_limit: options.userLimit,
      rate_limit_per_user: options.rateLimitPerUser,
      position: options.position,
      permission_overwrites: options.permissionOverwrites,
      parent_id: options.parentId,
      nsfw: options.nsfw,
    });

    return this.client.newChannelSwitch(channel);
  }

  async editChannelsPositions(options: channel.GuildPosition[]) {
    await this.client.rest.modifyGuildChannelPositions(this.id, options);
  }

  async createEmoji(name: string, image: string, roles: Snowflake[] = []) {
    const emoji = await this.client.rest.createGuildEmoji(this.id, {
      name,
      image,
      roles,
    });

    return emoji; //TODO
  }

  async modifyEmoji(emojiId: string, options: {
    name?: string;
    roles?: Snowflake[] | null;
  } = {}) {
    const emoji = await this.client.rest.modifyGuildEmoji(
      this.id,
      emojiId,
      options,
    );

    return emoji; //TODO
  }

  async deleteEmoji(emojiId: string) {
    await this.client.rest.deleteGuildEmoji(this.id, emojiId);
  }

  async createRole(options: role.Create = {}) {
    const role = await this.client.rest.createGuildRole(this.id, options);

    return new Role(this.client, role, this.id);
  }

  async editRolesPositions(options: role.ModifyPosition[]) {
    await this.client.rest.modifyGuildRolePositions(this.id, options);
  }

  async getAuditLog(options: {
    userId: Snowflake;
    actionType: number;
    before: Snowflake;
    limit: number;
  }) {
    return this.client.rest.getGuildAuditLog(this.id, { //TODO
      user_id: options.userId,
      action_type: options.actionType,
      before: options.before,
      limit: options.limit,
    });
  }

  async prune(options: {
    computePruneCount?: boolean;
    days?: number;
    includeRoles?: Snowflake[];
    dry?: boolean;
  } = { dry: false }) {
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
      });
    }

    return prune.pruned;
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

  async editIntegration(integrationId: Snowflake, options: {
    expireBehavior?: 0 | 1;
    expireGracePeriod?: number;
    enableEmoticons?: boolean;
  }) {
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
    return this.client.rest.getGuildInvites(this.id);
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
