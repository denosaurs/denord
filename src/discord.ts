// deno-lint-ignore-file no-namespace
export type Snowflake = string;
export type ISO8601 = string;

export namespace oauth2 {
  export type Scopes =
    | "bot"
    | "connections"
    | "email"
    | "identify"
    | "guilds"
    | "guilds.join"
    | "gdm.join"
    | "messages.read"
    | "rpc"
    | "rpc.api"
    | "rpc.notifications.read"
    | "webhook.incoming"
    | "applications.builds.upload"
    | "applications.builds.read"
    | "applications.store.update"
    | "applications.entitlements"
    | "relationships.read"
    | "activities.read"
    | "activities.write"
    | "applications.commands"
    | "applications.commands.update";

  export interface AccessTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }

  export type ClientCredentialsAccessTokenResponse = Omit<
    AccessTokenResponse,
    "refresh_token"
  >;

  export interface BotAuthParameters {
    client_id: Snowflake;
    scope: string;
    permissions: number;
    guild_id: Snowflake;
    disable_guild_select: boolean;
  }

  // TODO: https://discord.com/developers/docs/topics/oauth2#advanced-bot-authorization

  // TODO: https://discord.com/developers/docs/topics/oauth2#webhooks

  export interface Application {
    id: Snowflake;
    name: string;
    icon: string | null;
    description: string;
    rpc_origins?: string[];
    bot_public: boolean;
    bot_require_code_grant: boolean;
    owner: Partial<user.PublicUser>;
    summary: string;
    verify_key: string;
    team: teams.Team | null;
    guild_id?: Snowflake;
    primary_sku_id?: Snowflake;
    slug?: string;
    cover_image?: string;
    flags: number;
  }

  export type CurrentApplicationInformation = Omit<Application, "flags">;

  export interface GetCurrentAuthorizationInformation {
    application: Partial<Application>;
    scopes: string[];
    expires: ISO8601;
    user?: user.PublicUser;
  }
}

export namespace teams {
  export interface Team {
    icon: string | null;
    id: Snowflake;
    members: Member[];
    owner_user_id: Snowflake;
  }

  export interface Member {
    membership_state: MembershipState;
    permissions: ["*"];
    team_id: Snowflake;
    user: Pick<user.PublicUser, "avatar" | "discriminator" | "id" | "username">;
  }

  export type MembershipState = 1 | 2;
}

export namespace presence {
  export interface Presence {
    user: Pick<user.PublicUser, "id"> & Partial<user.PublicUser>;
    guild_id?: Snowflake;
    status?: Exclude<ActiveStatus, "invisible">;
    activities?: Activity[];
    client_status?: ClientStatus;
  }

  export interface Activity {
    name: string;
    type: Type;
    url?: string | null;
    created_at: number;
    timestamps?: Timestamps;
    application_id?: Snowflake;
    details?: string | null;
    state?: string | null;
    emoji?: emoji.Emoji | null;
    party?: Party;
    assets?: Assets;
    secrets?: Secrets;
    instance?: boolean;
    flags?: number;
    buttons?: Button[];
  }

  export type Type = 0 | 1 | 2 | 3 | 4 | 5;

  export interface Button {
    label: string;
    url: string;
  }

  export interface Timestamps {
    start?: number;
    end?: number;
  }

  export interface Party {
    id?: string;
    size?: [number, number];
  }

  export interface Assets {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  }

  export interface Secrets {
    join?: string;
    spectate?: string;
    match?: string;
  }

  export interface ClientStatus {
    desktop?: Exclude<ActiveStatus, "invisible" | "offline">;
    mobile?: Exclude<ActiveStatus, "invisible" | "offline">;
    web?: Exclude<ActiveStatus, "invisible" | "offline">;
  }

  export type ActiveStatus =
    | "idle"
    | "dnd"
    | "online"
    | "invisible"
    | "offline";
}

export namespace auditLog {
  export interface AuditLog {
    webhooks: webhook.Webhook[];
    users: user.PublicUser[];
    audit_log_entries: Entry[];
    integrations: Pick<
      integration.Integration,
      "id" | "name" | "type" | "account"
    >[];
  }

  export interface ChangeKey {
    name: string;
    description: string;
    icon_hash: string;
    splash_hash: string;
    discovery_splash_hash: string;
    banner_hash: string;
    owner_id: Snowflake;
    region: string;
    preferred_locale: string;
    afk_channel_id: Snowflake;
    afk_timeout: number;
    rules_channel_id: Snowflake;
    public_updates_channel_id: Snowflake;
    mfa_level: number;
    verification_level: number;
    explicit_content_filter: number;
    default_message_notifications: number;
    vanity_url_code: string;
    $add: Pick<role.Role, "id" | "name">[];
    $remove: Pick<role.Role, "id" | "name">[];
    prune_delete_days: number;
    widget_enabled: boolean;
    widget_channel_id: Snowflake;
    system_channel_id: Snowflake;
    position: number;
    topic: string;
    bitrate: number;
    permission_overwrites: channel.Overwrite[];
    nsfw: boolean;
    application_id: Snowflake;
    rate_limit_per_user: number;
    permissions: string;
    color: number;
    hoist: boolean;
    mentionable: boolean;
    allow: string;
    deny: string;
    code: string;
    channel_id: Snowflake;
    inviter_id: Snowflake;
    max_uses: number;
    uses: number;
    max_age: number;
    temporary: boolean;
    deaf: boolean;
    mute: boolean;
    nick: string;
    avatar_hash: string;
    id: Snowflake;
    type: number | string;
    enable_emoticons: boolean;
    expire_behavior: number;
    expire_grace_period: number;
    user_limit: number;
  }

  export interface UnspecificChange<T extends keyof ChangeKey> {
    new_value?: ChangeKey[T];
    old_value?: ChangeKey[T];
    key: T;
  }

  type SpecificChange<T extends keyof ChangeKey> = T extends keyof ChangeKey
    ? UnspecificChange<T>
    : never;

  export type Change = SpecificChange<keyof ChangeKey>;

  type ActionType =
    | 1
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 30
    | 31
    | 32
    | 40
    | 41
    | 42
    | 50
    | 51
    | 52
    | 60
    | 61
    | 62
    | 72
    | 73
    | 74
    | 75
    | 80
    | 81
    | 82;

  interface BaseEntry {
    target_id: string | null;
    changes?: Change[];
    user_id: Snowflake | null;
    id: Snowflake;
    action_type: ActionType;
    options: unknown;
    reason?: string;
  }

  interface NonOptionsEntry extends BaseEntry {
    action_type: Exclude<
      ActionType,
      13 | 14 | 15 | 21 | 26 | 27 | 72 | 73 | 74 | 75
    >;
    options: undefined;
  }

  interface ChannelOverwriteEntry extends BaseEntry {
    action_type: 13 | 14 | 15;
    options: ChannelOverwriteMember | ChannelOverwriteRole;
  }

  interface ChannelOverwriteMember {
    id: Snowflake;
    type: "1";
    role_name: undefined;
  }

  interface ChannelOverwriteRole {
    id: Snowflake;
    type: "0";
    role_name: string;
  }

  interface MemberPruneEntry extends BaseEntry {
    action_type: 21;
    options: {
      delete_member_days: string;
      members_removed: string;
    };
  }

  interface MemberMoveEntry extends BaseEntry {
    action_type: 26;
    options: {
      channel_id: Snowflake;
      count: string;
    };
  }

  interface MemberDisconnectEntry extends BaseEntry {
    action_type: 27;
    options: {
      count: string;
    };
  }

  interface MessageDeleteEntry extends BaseEntry {
    action_type: 72;
    options: {
      channel_id: Snowflake;
      count: string;
    };
  }

  interface MessageBulkDeleteEntry extends BaseEntry {
    action_type: 73;
    options: {
      count: string;
    };
  }

  interface MessagePinEntry extends BaseEntry {
    action_type: 74 | 75;
    options: {
      channel_id: Snowflake;
      message_id: Snowflake;
    };
  }

  export type Entry =
    | MemberPruneEntry
    | MemberMoveEntry
    | MessagePinEntry
    | MessageDeleteEntry
    | MessageBulkDeleteEntry
    | MemberDisconnectEntry
    | ChannelOverwriteEntry
    | NonOptionsEntry;

  export interface Params {
    user_id?: Snowflake;
    action_type?: number;
    before?: Snowflake;
    limit?: number;
  }
}

export namespace channel {
  export interface BaseChannel {
    id: Snowflake;
    type: Type;
  }

  export type Type = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 13;

  export interface DMChannel extends BaseChannel {
    type: 1;
    last_message_id: Snowflake | null;
    recipients: [user.PublicUser];
    last_pin_timestamp?: ISO8601 | null;
  }

  export interface GroupDMChannel extends BaseChannel {
    type: 3;
    last_message_id: Snowflake | null;
    recipients: user.PublicUser[];
    last_pin_timestamp?: ISO8601 | null;
    application_id?: Snowflake;
    name: string | null;
    icon: string | null;
    owner_id: Snowflake;
  }

  export interface GuildChannel extends BaseChannel {
    type: Exclude<Type, 1 | 3>;
    name: string;
    position: number;
    parent_id: Snowflake | null;
    guild_id: Snowflake;
    permission_overwrites: Overwrite[];
    nsfw: boolean;
  }

  export interface TextBasedGuildChannel extends GuildChannel {
    type: Extract<Type, 0 | 5>;
    last_pin_timestamp?: ISO8601 | null;
    last_message_id: Snowflake | null;
    topic: string | null;
  }

  export interface TextChannel extends TextBasedGuildChannel {
    type: 0;
    rate_limit_per_user: number;
  }

  export interface VoiceChannel extends GuildChannel {
    type: 2;
    bitrate: number;
    user_limit: number;
    nsfw: false;
    rtc_region?: string | null;
    video_quality_mode?: VideoQualityMode;
  }

  export type VideoQualityMode = 1 | 2;

  export interface CategoryChannel extends GuildChannel {
    type: 4;
    parent_id: null;
    nsfw: false;
  }

  export interface NewsChannel extends TextBasedGuildChannel {
    type: 5;
  }

  export interface StoreChannel extends GuildChannel {
    type: 6;
  }

  // @ts-ignore
  export interface StageVoiceChannel extends VoiceChannel {
    type: 13;
  }

  export type GuildChannels =
    | TextChannel
    | VoiceChannel
    | CategoryChannel
    | NewsChannel
    | StoreChannel
    | StageVoiceChannel;

  export type DMChannels = DMChannel | GroupDMChannel;

  export type Channel = GuildChannels | DMChannels;

  export interface Overwrite {
    id: Snowflake;
    type: 0 | 1;
    allow: string;
    deny: string;
  }

  export interface Mention {
    id: Snowflake;
    guild_id: Snowflake;
    type: Type;
    name: string;
  }

  export interface GetMessages {
    around?: Snowflake;
    before?: Snowflake;
    after?: Snowflake;
    limit?: number;
  }

  export interface GetReactions {
    after?: Snowflake;
    limit?: number;
  }

  export interface BulkDelete {
    messages: Snowflake[];
  }

  export interface FollowedChannel {
    channel_id: Snowflake;
    webhook_id: Snowflake;
  }

  export interface FollowNewsChannel {
    webhook_channel_id: Snowflake;
  }

  export interface GroupDMAddRecipient {
    access_token: string;
    nick?: string;
  }

  export interface CreateGuildChannel {
    name: string;
    type?: Exclude<Type, 1 | 3>;
    topic?: string;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    position?: number;
    permission_overwrites?: Overwrite[];
    parent_id?: Snowflake;
    nsfw?: boolean;
  }

  export interface Modify {
    name?: string;
    type?: 0 | 5;
    position?: number | null;
    topic?: string | null;
    nsfw?: boolean | null;
    rate_limit_per_user?: number | null;
    bitrate?: number | null;
    user_limit?: number | null;
    permission_overwrites?: Overwrite[] | null;
    parent_id?: Snowflake | null;
    rtc_region?: string | null;
    video_quality_mode?: VideoQualityMode | null;
  }

  export interface GuildPosition {
    id: Snowflake;
    position: number | null;
    lock_permissions: boolean | null;
    parent_id: Snowflake | null;
  }

  export interface CreateDM {
    recipient_id: Snowflake;
  }

  export interface CreateGroupDM {
    access_tokens: string[];
    nicks: { [key: string]: string };
  }

  export interface PinsUpdateEvent {
    guild_id?: Snowflake;
    channel_id: Snowflake;
    last_pin_timestamp?: ISO8601 | null;
  }

  export interface DeleteBulkEvent {
    ids: Snowflake[];
    channel_id: Snowflake;
    guild_id?: Snowflake;
  }

  export interface TypingStartEvent {
    channel_id: Snowflake;
    guild_id?: Snowflake;
    user_id: Snowflake;
    timestamp: number;
    member?: guildMember.GuildMember;
  }
}

export namespace embed {
  export interface Embed {
    title?: string;
    type?: "rich" | "image" | "video" | "gifv" | "article" | "link";
    description?: string;
    url?: string;
    timestamp?: ISO8601;
    color?: number;
    footer?: Footer;
    image?: Image;
    thumbnail?: Thumbnail;
    video?: Video;
    provider?: Provider;
    author?: Author;
    fields?: Field[];
  }

  export interface Footer {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  }

  export interface Image {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  }

  export interface Thumbnail {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  }

  export interface Video {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  }

  export interface Provider {
    name?: string;
    url?: string;
  }

  export interface Author {
    name?: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  }

  export interface Field {
    name: string;
    value: string;
    inline?: boolean;
  }
}

export namespace emoji {
  export interface BaseEmoji {
    id: Snowflake | null;
    name: string | null;
    roles?: Snowflake[];
    user?: user.PublicUser;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
    available?: boolean;
  }

  interface idEmoji extends BaseEmoji {
    id: Snowflake;
  }

  interface nameEmoji extends BaseEmoji {
    name: string;
  }

  export type Emoji = idEmoji | nameEmoji;

  export type GuildEmoji = idEmoji & nameEmoji;

  export interface Create {
    name: string;
    image: string;
    roles: Snowflake[];
  }

  export interface Modify {
    name?: string;
    roles?: Snowflake[] | null;
  }
}

export namespace guild {
  export interface BaseGuild {
    id: Snowflake;
    name: string;
    icon: string | null;
    splash: string | null;
    discovery_splash: string | null;
    owner_id: Snowflake;
    region: string;
    afk_channel_id: Snowflake | null;
    afk_timeout: number;
    verification_level: VerificationLevel;
    default_message_notifications: DefaultMessageNotifications;
    explicit_content_filter: ExplicitContentFilter;
    roles: role.Role[];
    emojis: emoji.GuildEmoji[];
    features: Features[];
    mfa_level: 0 | 1;
    application_id: Snowflake | null;
    widget_enabled?: boolean; // Only on fetch & UPDATE
    widget_channel_id?: Snowflake | null; // Only on fetch & UPDATE
    system_channel_id: Snowflake | null;
    system_channel_flags: number;
    rules_channel_id: Snowflake | null;
    max_presences?: number | null; // Only on fetch & UPDATE
    max_members?: number; // Only on fetch & UPDATE
    vanity_url_code: string | null;
    description: string | null;
    banner: string | null;
    premium_tier: 0 | 1 | 2 | 3;
    premium_subscription_count?: number;
    preferred_locale: string;
    public_updates_channel_id: Snowflake | null;
    max_video_channel_users?: number;
    welcome_screen?: WelcomeScreen;
  }

  export interface CurrentUserGuild extends BaseGuild {
    owner: boolean;
    permissions: string;
  }

  export interface RESTGuild extends BaseGuild {
    widget_enabled: boolean;
    widget_channel_id: Snowflake | null;
    max_presences: number | null;
    max_members: number;

    approximate_member_count?: number;
    approximate_presence_count?: number;
  }

  export interface GatewayGuild extends BaseGuild {
    joined_at: ISO8601;
    large: boolean;
    unavailable: boolean;
    member_count: number;
    voice_states: Omit<voice.State, "guild_id">[];
    members: guildMember.GuildMember[];
    channels: channel.GuildChannels[];
    presences: presence.Presence[];
  }

  export type VerificationLevel = 0 | 1 | 2 | 3 | 4;
  export type ExplicitContentFilter = 0 | 1 | 2;
  export type DefaultMessageNotifications = 0 | 1;

  export type Features =
    | "INVITE_SPLASH"
    | "VIP_REGIONS"
    | "VANITY_URL"
    | "VERIFIED"
    | "PARTNERED"
    | "COMMUNITY"
    | "COMMERCE"
    | "NEWS"
    | "DISCOVERABLE"
    | "FEATURABLE"
    | "ANIMATED_ICON"
    | "BANNER"
    | "WELCOME_SCREEN_ENABLED"
    | "MEMBER_VERIFICATION_GATE_ENABLED"
    | "PREVIEW_ENABLED";

  export type Preview = Required<
    Pick<
      RESTGuild,
      | "id"
      | "name"
      | "icon"
      | "splash"
      | "discovery_splash"
      | "emojis"
      | "features"
      | "description"
      | "approximate_member_count"
      | "approximate_presence_count"
    >
  >;

  export interface WidgetSettings {
    enabled: boolean;
    channel_id: Snowflake | null;
  }

  export interface Ban {
    reason: string | null;
    user: user.PublicUser;
  }

  export interface Create {
    name: string;
    region?: string;
    icon?: string;
    verification_level?: VerificationLevel;
    default_message_notifications?: DefaultMessageNotifications;
    explicit_content_filter?: ExplicitContentFilter;
    roles?: role.Role[];
    channels?:
      (Partial<channel.GuildChannels> & Pick<channel.GuildChannels, "name">)[];
    afk_channel_id?: Snowflake;
    afk_timeout?: number;
    system_channel_id?: Snowflake;
    system_channel_flags?: number;
  }

  export interface Modify extends
    Partial<
      Pick<
        BaseGuild,
        | "name"
        | "afk_channel_id"
        | "afk_timeout"
        | "icon"
        | "owner_id"
        | "splash"
        | "discovery_splash"
        | "banner"
        | "system_channel_id"
        | "system_channel_flags"
        | "rules_channel_id"
        | "public_updates_channel_id"
        | "features"
        | "description"
      >
    > {
    region?: string | null;
    verification_level?: VerificationLevel | null;
    default_message_notifications?: DefaultMessageNotifications | null;
    explicit_content_filter?: ExplicitContentFilter | null;
    preferred_locale?: string | null;
  }

  export type BanDeleteMessageDays = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

  export interface CreateBan {
    delete_message_days?: BanDeleteMessageDays;
    reason?: string;
  }

  export interface PruneCount {
    days?: number;
    include_roles?: string;
  }

  export interface BeginPrune {
    days?: number;
    compute_prune_count?: boolean;
    include_roles?: Snowflake[];
  }

  export interface DryPruneData {
    pruned: number;
  }

  export interface PruneData {
    pruned: number | null;
  }

  export type WidgetModify = Partial<WidgetSettings>;

  export type UnavailableGuild = Pick<GatewayGuild, "id" | "unavailable">;

  export interface BanEvent {
    guild_id: Snowflake;
    user: user.PublicUser;
  }

  export interface EmojisUpdateEvent {
    guild_id: Snowflake;
    emojis: emoji.GuildEmoji[];
  }

  export interface IntegrationsUpdateEvent {
    guild_id: Snowflake;
  }

  export interface MemberAddEvent extends guildMember.GuildMember {
    guild_id: Snowflake;
  }

  export interface MemberRemoveEvent {
    guild_id: Snowflake;
    user: user.PublicUser;
  }

  export interface MemberUpdateEvent extends
    Pick<
      guildMember.GuildMember,
      "roles" | "user" | "premium_since" | "joined_at"
    >,
    Partial<Pick<guildMember.GuildMember, "nick">> {
    guild_id: Snowflake;
    deaf?: boolean;
    mute?: boolean;
    pending?: boolean;
  }

  export interface MembersChunkEvent {
    guild_id: Snowflake;
    members: guildMember.GuildMember[];
    chunk_index: number;
    chunk_count: number;
    not_found?: Snowflake[];
    presences?: presence.Presence[];
    nonce?: string;
  }

  export interface Params {
    with_counts?: boolean;
  }

  export interface WelcomeScreen {
    description: string | null;
    welcome_channels: WelcomeScreenChannel[];
  }

  export interface ModifyWelcomeScreen {
    enabled?: boolean | null;
    welcome_channels?: WelcomeScreenChannel[] | null;
    description?: string | null;
  }

  export interface WelcomeScreenChannel {
    channel_id: Snowflake;
    description: string;
    emoji_id: Snowflake | null;
    emoji_name: string | null;
  }
}

export namespace guildMember {
  export interface GuildMember {
    user: user.PublicUser;
    nick?: string | null;
    roles: Snowflake[];
    joined_at: ISO8601;
    premium_since?: ISO8601 | null;
    deaf: boolean;
    mute: boolean;
    pending?: boolean;
    permissions?: string;
  }

  export interface List {
    limit?: number;
    after?: Snowflake;
  }

  export interface Search {
    query: string;
    limit?: number;
  }

  export interface Add {
    access_token: string;
    nick?: string;
    roles?: Snowflake[];
    mute?: boolean;
    deaf?: boolean;
  }

  export interface ModifyCurrentNick {
    nick?: string | null;
  }

  export type ModifyCurrentNickResponse = Required<ModifyCurrentNick>;

  export interface Modify extends ModifyCurrentNick {
    roles?: Snowflake[] | null;
    deaf?: boolean | null;
    mute?: boolean | null;
    channel_id?: Snowflake | null;
  }
}

export namespace integration {
  export interface Integration {
    id: Snowflake;
    name: string;
    type: string;
    enabled: boolean;
    syncing?: boolean;
    role_id?: Snowflake;
    enable_emoticons?: boolean;
    expire_behavior?: 0 | 1;
    expire_grace_period?: number;
    user?: user.PublicUser;
    account: Account;
    synced_at?: ISO8601;
    subscriber_count?: number;
    revoked?: boolean;
    application?: Application;
  }

  export interface Account {
    id: string;
    name: string;
  }

  export interface Application {
    id: Snowflake;
    name: string;
    icon: string | null;
    description: string;
    summary: string;
    bot?: user.PublicUser;
  }

  export interface DeleteEvent {
    id: Snowflake;
    guild_id: Snowflake;
    application_id?: Snowflake;
  }
}

export namespace invite {
  export interface Invite {
    code: string;
    guild?: Partial<guild.RESTGuild>;
    channel: Partial<channel.GuildChannels>;
    inviter?: user.PublicUser;
    target_type?: TargetType;
    target_user?: Partial<user.PublicUser>;
    target_application?: Partial<oauth2.Application>;
    approximate_presence_count?: number;
    approximate_member_count?: number;
  }

  export type TargetType = 1 | 2;

  export interface Metadata {
    uses: number;
    max_uses: number;
    max_age: number;
    temporary: boolean;
    created_at: ISO8601;
  }

  export type MetadataInvite = Invite & Metadata;

  export interface Create extends
    Partial<
      Pick<
        MetadataInvite,
        "max_age" | "max_uses" | "temporary" | "target_type"
      >
    > {
    unique?: boolean;
    target_user_id?: Snowflake;
    target_application_id?: Snowflake;
  }

  export type VanityURL = Pick<MetadataInvite, "code" | "uses">;

  export interface CreateEvent
    extends
      Pick<
        Invite,
        | "code"
        | "inviter"
        | "target_user"
        | "target_type"
        | "target_application"
      >,
      Metadata {
    channel_id: Snowflake;
    guild_id?: Snowflake;
  }

  export interface DeleteEvent {
    channel_id: Snowflake;
    guild_id?: Snowflake;
    code: string;
  }
}

export namespace template {
  export interface Template {
    code: string;
    name: string;
    description: string | null;
    usage_count: number;
    creator_id: Snowflake;
    creator: user.PublicUser;
    created_at: ISO8601;
    updated_at: ISO8601;
    source_guild_id: Snowflake;
    serialized_source_guild: Partial<guild.BaseGuild>;
    is_dirty: boolean | null;
  }

  export interface createGuildTemplate {
    name: string;
    description?: string | null;
  }

  export type modifyGuildTemplate = Partial<createGuildTemplate>;

  export interface createGuildFromTemplate {
    name: string;
    icon?: string;
  }
}

export namespace message {
  export interface Message {
    id: Snowflake;
    channel_id: Snowflake;
    guild_id?: Snowflake;
    author: user.PublicUser;
    member?: Omit<guildMember.GuildMember, "user">;
    content: string;
    timestamp: ISO8601;
    edited_timestamp: ISO8601 | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions:
      (user.PublicUser & { member?: Omit<guildMember.GuildMember, "user"> })[];
    mention_roles: Snowflake[];
    mention_channels?: channel.Mention[];
    attachments: Attachment[];
    embeds: embed.Embed[];
    reactions?: Reaction[];
    nonce?: number | string;
    pinned: boolean;
    webhook_id?: Snowflake;
    type: Type;
    activity?: Activity;
    application?: Partial<oauth2.Application>;
    message_reference?: Reference;
    flags?: number;
    stickers?: Sticker[];
    referenced_message?: Message | null;
    interaction?: interaction.MessageInteraction;
  }

  export type Type =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 14
    | 15
    | 16
    | 17
    | 19
    | 20
    | 22;

  export interface Attachment {
    id: Snowflake;
    filename: string;
    content_type?: string;
    size: number;
    url: string;
    proxy_url: string;
    height?: number | null;
    width?: number | null;
  }

  export interface Reaction {
    count: number;
    me: boolean;
    emoji: Pick<emoji.Emoji, "id" | "name" | "animated">;
  }

  export interface Activity {
    type: 1 | 2 | 3 | 5;
    party_id?: string;
  }

  export interface AllowedMentions {
    parse: ["roles"?, "users"?, "everyone"?];
    roles: Snowflake[];
    users: Snowflake[];
    replied_user: boolean;
  }

  export interface Reference {
    message_id?: Snowflake;
    channel_id?: Snowflake;
    guild_id?: Snowflake;
    fail_if_not_exists?: boolean;
  }

  export interface Sticker {
    id: Snowflake;
    pack_id: Snowflake;
    name: string;
    description: string;
    tags?: string;
    asset: string;
    preview_asset: string | null;
    format_type: 1 | 2 | 3;
  }

  export interface BaseCreate {
    content?: string;
    nonce?: number | string;
    tts?: boolean;
    file?: File;
    embed?: embed.Embed;
    payload_json?: string;
    allowed_mentions?: AllowedMentions;
    message_reference?: Reference & Required<Pick<Reference, "message_id">>;
  }

  export type Create =
    | BaseCreate & Required<Pick<BaseCreate, "embed">>
    | BaseCreate & Required<Pick<BaseCreate, "file">>
    | BaseCreate & Required<Pick<BaseCreate, "content">>;

  export interface Edit {
    content?: string | null;
    embed?: embed.Embed | null;
    flags?: number | null;
    allowed_mentions?: AllowedMentions | null;
  }

  export type DeleteEvent = Pick<Message, "id" | "channel_id" | "guild_id">;

  export interface ReactionAddEvent {
    user_id: Snowflake;
    channel_id: Snowflake;
    message_id: Snowflake;
    guild_id?: Snowflake;
    member?: guildMember.GuildMember;
    emoji: Pick<emoji.Emoji, "id" | "name" | "animated">;
  }

  export type ReactionRemoveEvent = Omit<ReactionAddEvent, "member">;

  export type ReactionRemoveAllEvent = Omit<
    ReactionRemoveEvent,
    "emoji" | "user_id"
  >;

  export type ReactionRemoveEmojiEvent = Omit<ReactionRemoveEvent, "user_id">;
}

export namespace richPresence {
  export interface RichPresence {
    state: string;
    details: string;
    startTimestamp: number;
    endTimestamp: number;
    largeImageKey: string;
    largeImageText: string;
    smallImageKey: string;
    smallImageText: string;
    partyId: string;
    partySize: number;
    partyMax: number;
    matchSecret: string;
    spectateSecret: string;
    joinSecret: string;
    instance: number;
  }
}

export namespace role {
  export interface Role {
    id: Snowflake;
    name: string;
    color: number;
    hoist: boolean;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    tags?: Tags;
  }

  export interface Tags {
    bot_id?: Snowflake;
    integration_id?: Snowflake;
    premium_subscriber?: null;
  }

  export interface Create
    extends Partial<Pick<Role, "name" | "color" | "hoist" | "mentionable">> {
    permissions?: string;
  }

  export type ModifyPosition = Pick<Role, "id" | "position">;

  export type Modify = Create;

  export interface UpdateEvent {
    guild_id: Snowflake;
    role: Role;
  }

  export interface DeleteEvent {
    guild_id: Snowflake;
    role_id: Snowflake;
  }
}

export namespace user {
  export interface PublicUser {
    id: Snowflake;
    username: string;
    discriminator: string;
    avatar: string | null;
    bot?: boolean;
    system?: boolean;
    public_flags?: number;
  }

  export interface PrivateUser extends PublicUser {
    mfa_enabled: boolean;
    locale: string;
    verified: boolean;
    email: string | null;
    flags?: number;
    premium_type?: 0 | 1 | 2;
  }

  export interface Connection {
    id: string;
    name: string;
    type: string;
    revoked: boolean;
    integrations: Partial<integration.Integration>[];
    verified: boolean;
    friend_sync: boolean;
    show_activity: boolean;
    visibility: 0 | 1;
  }

  export type Modify = Partial<Pick<PrivateUser, "username" | "avatar">>;

  export interface GetGuilds {
    before?: Snowflake;
    after?: Snowflake;
    limit?: number;
  }
}

export namespace voice {
  export interface State {
    guild_id?: Snowflake;
    channel_id: Snowflake | null;
    user_id: Snowflake;
    member?: guildMember.GuildMember;
    session_id: string;
    deaf: boolean;
    mute: boolean;
    self_deaf: boolean;
    self_mute: boolean;
    self_stream?: boolean;
    self_video: boolean;
    suppress: boolean;
    request_to_speak_timestamp: ISO8601 | null;
  }

  export interface Region {
    id: string;
    name: string;
    vip: boolean;
    optimal: boolean;
    deprecated: boolean;
    custom: boolean;
  }

  export interface ServerUpdateEvent {
    token: string;
    guild_id: Snowflake;
    endpoint: string | null;
  }

  export interface CurrentUserUpdateState {
    channel_id: Snowflake;
    suppress?: boolean;
    request_to_speak_timestamp?: ISO8601 | null;
  }

  export type UserUpdateState = Omit<
    CurrentUserUpdateState,
    "request_to_speak_timestamp"
  >;
}

export namespace webhook {
  export interface Webhook {
    id: Snowflake;
    type: 1 | 2;
    guild_id: Snowflake; // discord-api-docs#2048
    channel_id: Snowflake;
    user?: user.PublicUser;
    name: string | null;
    avatar: string | null;
    token?: string;
    application_id: Snowflake | null;
    source_guild?: Pick<guild.BaseGuild, "id" | "name" | "icon">;
    source_channel?: Pick<channel.GuildChannels, "id" | "name">;
    url?: string;
  }

  export interface Create {
    name: string;
    avatar?: string | null;
  }

  export interface Modify extends Partial<Create> {
    channel_id?: Snowflake;
  }

  export interface ExecuteParams {
    wait?: boolean;
  }

  export interface ExecuteBody
    extends Omit<message.Create, "embed" | "nonce" | "message_reference"> {
    username?: string;
    avatar_url?: string;
    embeds?: embed.Embed[];
  }

  export interface EditMessage {
    content?: string | null;
    embeds?: embed.Embed[] | null;
    file?: File | null;
    payload_json?: string | null;
    allowed_mentions?: message.AllowedMentions | null;
  }

  export interface UpdateEvent {
    guild_id: Snowflake;
    channel_id: Snowflake;
  }
}

export namespace gateway {
  export interface Gateway {
    url: string;
  }

  export interface GatewayBot extends Gateway {
    shards: number;
    session_start_limit: {
      total: number;
      remaining: number;
      reset_after: number;
      max_concurrency: number;
    };
  }

  interface EventPayload<T extends keyof Events> {
    op: 0;
    d: Events[T];
    s: number;
    t: T;
  }

  export type SpecificEventPayload<T extends keyof Events> = T extends
    keyof Events ? EventPayload<T>
    : never;

  export type SpecificEvent = SpecificEventPayload<keyof Events>;

  interface OpPayload<T extends keyof Ops> {
    op: T;
    d: Ops[T];
    s: null;
    t: null;
  }

  type SpecificOpPayload<T extends keyof Ops> = T extends keyof Ops
    ? OpPayload<T>
    : never;

  export type SpecificOp = SpecificOpPayload<keyof Ops>;

  export type Payload =
    | SpecificEvent
    | SpecificOp;

  export interface Ops {
    1: number;
    2: { // Voice
      ssrc: number;
      ip: string;
      port: number;
      modes: string[];
      heartbeat_interval: number;
    };
    6: number; // Voice
    7: undefined;
    8: { // Voice
      heartbeat_interval: number;
    };
    9: boolean;
    10: {
      heartbeat_interval: number;
    };
    11: undefined;
  }

  export interface Events {
    READY: ReadyEvent;
    RESUMED: undefined;
    RECONNECT: undefined;

    CHANNEL_CREATE: channel.GuildChannels;
    CHANNEL_UPDATE: Exclude<channel.Channel, channel.GroupDMChannel>;
    CHANNEL_DELETE: Exclude<channel.Channel, channel.GroupDMChannel>;
    CHANNEL_PINS_UPDATE: channel.PinsUpdateEvent;

    GUILD_CREATE: guild.GatewayGuild;
    GUILD_UPDATE: guild.GatewayGuild;
    GUILD_DELETE: guild.UnavailableGuild;
    GUILD_BAN_ADD: guild.BanEvent;
    GUILD_BAN_REMOVE: guild.BanEvent;
    GUILD_EMOJIS_UPDATE: guild.EmojisUpdateEvent;
    GUILD_INTEGRATIONS_UPDATE: guild.IntegrationsUpdateEvent;
    GUILD_MEMBER_ADD: guild.MemberAddEvent;
    GUILD_MEMBER_REMOVE: guild.MemberRemoveEvent;
    GUILD_MEMBER_UPDATE: guild.MemberUpdateEvent;
    GUILD_MEMBERS_CHUNK: guild.MembersChunkEvent;
    GUILD_ROLE_CREATE: role.UpdateEvent;
    GUILD_ROLE_UPDATE: role.UpdateEvent;
    GUILD_ROLE_DELETE: role.DeleteEvent;

    INTEGRATION_CREATE: integration.Integration & { guild_id: Snowflake };
    INTEGRATION_UPDATE: integration.Integration & { guild_id: Snowflake };
    INTEGRATION_DELETE: integration.DeleteEvent;

    INVITE_CREATE: invite.CreateEvent;
    INVITE_DELETE: invite.DeleteEvent;

    MESSAGE_CREATE: message.Message;
    MESSAGE_UPDATE:
      & Partial<message.Message>
      & Pick<message.Message, "id" | "channel_id">;
    MESSAGE_DELETE: message.DeleteEvent;
    MESSAGE_DELETE_BULK: channel.DeleteBulkEvent;
    MESSAGE_REACTION_ADD: message.ReactionAddEvent;
    MESSAGE_REACTION_REMOVE: message.ReactionRemoveEvent;
    MESSAGE_REACTION_REMOVE_ALL: message.ReactionRemoveAllEvent;
    MESSAGE_REACTION_REMOVE_EMOJI: message.ReactionRemoveEmojiEvent;

    PRESENCE_UPDATE: presence.Presence;
    TYPING_START: channel.TypingStartEvent;
    USER_UPDATE: user.PrivateUser;

    VOICE_STATE_UPDATE: voice.State;
    VOICE_SERVER_UPDATE: voice.ServerUpdateEvent;

    WEBHOOKS_UPDATE: webhook.UpdateEvent;

    APPLICATION_COMMAND_CREATE: interaction.ApplicationCommand & {
      guild_id?: Snowflake;
    };
    APPLICATION_COMMAND_UPDATE: interaction.ApplicationCommand & {
      guild_id?: Snowflake;
    };
    APPLICATION_COMMAND_DELETE: interaction.ApplicationCommand & {
      guild_id?: Snowflake;
    };

    INTERACTION_CREATE: interaction.Interaction;
  }

  export interface ReadyEvent {
    v: number;
    user: user.PrivateUser;
    private_channels: [];
    guilds: guild.UnavailableGuild[];
    session_id: string;
    shard?: [number, number];
    application: Pick<oauth2.Application, "id" | "flags">;
  }

  export interface GuildRequestMembers {
    guild_id: Snowflake;
    query?: string;
    limit: number;
    presences?: boolean;
    user_ids?: Snowflake | Snowflake[];
    nonce?: string;
  }

  export interface PresenceUpdate {
    since: number | null;
    activities: presence.Activity[];
    status: presence.ActiveStatus;
    afk: boolean;
  }
}

export namespace interaction {
  export interface ApplicationCommand {
    id: Snowflake;
    application_id: Snowflake;
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
    default_permission?: boolean;
  }

  export interface ApplicationCommandOption {
    type: ApplicationCommandOptionType;
    name: string;
    description: string;
    default?: boolean;
    required?: boolean;
    choices?: ApplicationCommandOptionChoice[];
    options?: ApplicationCommandOption[];
  }

  export type ApplicationCommandOptionType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

  export interface ApplicationCommandOptionChoice {
    name: string;
    value: string | number;
  }

  export interface Interaction {
    id: Snowflake;
    application_id: Snowflake;
    type: InteractionType;
    data?: ApplicationCommandInteractionData;
    guild_id?: Snowflake;
    channel_id?: Snowflake;
    member?: guildMember.GuildMember;
    user?: user.PublicUser;
    token: string;
    version: 1;
  }

  export type InteractionType = 1 | 2;

  export interface ApplicationCommandInteractionData {
    id: Snowflake;
    name: string;
    options?: ApplicationCommandInteractionDataOption[];
  }

  export interface ApplicationCommandInteractionDataOptionBase {
    name: string;
    type: ApplicationCommandOptionType;
  }

  export interface ApplicationCommandInteractionDataOptionValue
    extends ApplicationCommandInteractionDataOptionBase {
    value: Snowflake | string | number | boolean;
  }
  export interface ApplicationCommandInteractionDataOptionOptions
    extends ApplicationCommandInteractionDataOptionBase {
    options: ApplicationCommandInteractionDataOption[];
  }

  export type ApplicationCommandInteractionDataOption =
    | ApplicationCommandInteractionDataOptionValue
    | ApplicationCommandInteractionDataOptionOptions;

  export interface ResponseBase {
    type: InteractionResponseType;
  }

  export interface ResponseData extends ResponseBase {
    type: 4;
    data: InteractionApplicationCommandCallbackData;
  }

  export interface ResponseNoData extends ResponseBase {
    type: Exclude<InteractionResponseType, 4>;
  }

  export type Response = ResponseData | ResponseNoData;

  export type InteractionResponseType = 1 | 4 | 5;

  export type InteractionApplicationCommandCallbackData =
    & Pick<message.BaseCreate, "tts" | "allowed_mentions" | "content">
    & {
      embeds?: embed.Embed[];
      flags?: number;
    };

  export interface CreateGlobalApplicationCommand {
    name: string;
    description: string;
    options?: ApplicationCommandOption[];
    default_permission?: boolean;
  }

  export interface EditGlobalApplicationCommand {
    name?: string;
    description?: string;
    options?: ApplicationCommandOption[] | null;
    default_permission?: boolean;
  }

  export type CreateGuildApplicationCommand = CreateGlobalApplicationCommand;

  export type EditGuildApplicationCommand = EditGlobalApplicationCommand;

  export interface MessageInteraction {
    id: Snowflake;
    type: InteractionType;
    name: string;
    user: user.PublicUser;
  }

  export interface GuildApplicationCommandPermissions {
    id: Snowflake;
    application_id: Snowflake;
    guild_id: Snowflake;
    permissions: ApplicationCommandPermissions[];
  }

  export interface ApplicationCommandPermissions {
    id: Snowflake;
    type: ApplicationCommandPermissionType;
    permission: boolean;
  }

  export type ApplicationCommandPermissionType = 1 | 2;

  export interface EditApplicationCommandPermissions {
    permissions: ApplicationCommandPermissions[];
  }

  export type BatchEditApplicationCommandPermissions = Pick<
    GuildApplicationCommandPermissions,
    "id" | "permissions"
  >[];
}
