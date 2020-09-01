export type Snowflake = string;
export type ISO8601 = string;

export namespace activity {
  export interface Activity {
    name: string;
    type: 0 | 1 | 2 | 4;
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
}

export namespace attachment {
  export interface Attachment {
    id: Snowflake;
    filename: string;
    size: number;
    url: string;
    proxy_url: string;
    height: number | null;
    width: number | null;
  }
}

export namespace auditLog {
  export interface AuditLog {
    webhooks: webhook.Webhook[];
    users: user.PublicUser[];
    audit_log_entries: Entry[];
    integrations: Partial<integration.Integration>[];
  }

  export interface ChangeKey {
    name: string;
    icon_hash: string;
    splash_hash: string;
    owner_id: Snowflake;
    region: string;
    afk_channel_id: Snowflake;
    afk_timeout: number;
    mfa_level: number;
    verification_level: number;
    explicit_content_filter: number;
    default_message_notifications: number;
    vanity_url_code: string;
    $add: Partial<role.Role>[];
    $remove: Partial<role.Role>[];
    prune_delete_days: number;
    widget_enabled: boolean;
    widget_channel_id: Snowflake;
    system_channel_id: Snowflake;
    position: number;
    topic: string;
    bitrate: number;
    permission_overwrites: channel.OverwriteReceive[];
    nsfw: boolean;
    application_id: Snowflake;
    rate_limit_per_user: number;
    permissions: number;
    permissions_new: string;
    color: number;
    hoist: boolean;
    mentionable: boolean;
    allow: number;
    allow_new: string;
    deny: number;
    deny_new: string;
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

  export interface EntryInfo {
    delete_member_days: string;
    members_removed: string;
    channel_id: Snowflake;
    message_id: Snowflake;
    count: string;
    id: Snowflake;
    type: "member" | "role";
    role_name: string;
  }

  export interface Entry {
    target_id: string | null;
    changes?: Change[];
    user_id: Snowflake;
    id: Snowflake;
    action_type:
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
    options?: EntryInfo;
    reason?: string;
  }
}

export namespace channel {
  export interface Channel {
    id: Snowflake;
    type: Type;
    guild_id?: Snowflake;
    position?: number;
    permission_overwrites?: OverwriteReceive[];
    name?: string;
    topic?: string | null;
    nsfw?: boolean;
    last_message_id?: Snowflake | null;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    recipients?: user.PublicUser[];
    icon?: string | null;
    owner_id?: Snowflake;
    application_id?: Snowflake;
    parent_id?: Snowflake | null;
    last_pin_timestamp?: ISO8601;
  }

  export type Type = 0 | 1 | 2 | 3 | 4 | 5 | 6;

  export interface OverwriteReceive {
    id: Snowflake;
    type: "role" | "member";
    allow: number;
    allow_new: string;
    deny: number;
    deny_new: string;
  }

  export interface OverwriteSend {
    id: Snowflake;
    type: "role" | "member";
    allow: number | string;
    deny: number | string;
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
    before?: Snowflake;
    after?: Snowflake;
    limit?: number;
  }

  export interface BulkDelete {
    messages: Snowflake[];
  }

  export interface GroupDMAddRecipient {
    access_token: string;
    nick: string;
  }

  export interface CreateGuildChannel {
    name: string;
    type?: Type;
    topic?: string;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    position?: number;
    permission_overwrites?: OverwriteSend[];
    parent_id?: Snowflake;
    nsfw?: boolean;
  }

  export type Modify = Partial<Omit<CreateGuildChannel, "type">>;

  export interface GuildPosition {
    id: Snowflake;
    position: number;
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
    last_pin_timestamp?: ISO8601;
  }

  export interface DeleteBulkEvent {
    ids: Snowflake[];
    channel_id: Snowflake;
    guild_id: Snowflake;
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
  export interface Emoji {
    id: Snowflake | null;
    name: string | null;
    roles?: Snowflake[];
    user?: user.PublicUser;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
  }

  export interface Create extends NonNullable<Pick<Emoji, "name" | "roles">> {
    image: string;
  }

  export type Modify = Pick<Create, "name" | "roles">;
}

export namespace guild {
  export interface Guild {
    id: Snowflake;
    name: string;
    icon: string | null;
    splash: string | null;
    discovery_splash: string | null;
    owner?: boolean;
    owner_id: Snowflake;
    permissions?: number;
    permissions_new?: string;
    region: string;
    afk_channel_id: Snowflake | null;
    afk_timeout: number;
    verification_level: 0 | 1 | 2 | 3 | 4;
    default_message_notifications: 0 | 1;
    explicit_content_filter: 0 | 1 | 2;
    roles: role.Role[];
    emojis: emoji.Emoji[];
    features: Features[];
    mfa_level: 0 | 1;
    application_id: Snowflake | null;
    widget_enabled?: boolean;
    widget_channel_id?: Snowflake | null;
    system_channel_id: Snowflake | null;
    system_channel_flags: number;
    rules_channel_id: Snowflake | null;
    joined_at?: ISO8601;
    large?: boolean;
    unavailable?: boolean;
    member_count?: number;
    voice_states?: Partial<Omit<voice.State, "guild_id">>[];
    members?: guildMember.GuildMember[];
    channels?: channel.Channel[];
    presences?: Partial<PresenceUpdateEvent>[];
    max_presences?: number | null;
    max_members?: number;
    vanity_url_code: string | null;
    description: string | null;
    banner: string | null;
    premium_tier: 0 | 1 | 2 | 3;
    premium_subscription_count?: number;
    preferred_locale: string;
    public_updates_channel_id: Snowflake | null;
    max_video_channel_users?: number;
    approximate_member_count?: number;
    approximate_presence_count?: number;
  }

  export type Features =
    | "INVITE_SPLASH"
    | "VIP_REGIONS"
    | "VANITY_URL"
    | "VERIFIED"
    | "PARTNERED"
    | "PUBLIC"
    | "COMMERCE"
    | "NEWS"
    | "DISCOVERABLE"
    | "FEATURABLE"
    | "ANIMATED_ICON"
    | "BANNER"
    | "PUBLIC_DISABLED";

  export type Preview = Pick<
    Guild,
    | "id"
    | "name"
    | "icon"
    | "splash"
    | "discovery_splash"
    | "emojis"
    | "features"
    | "approximate_member_count"
    | "approximate_presence_count"
    | "description"
  >;

  export interface Widget {
    enabled: boolean;
    channel_id: Snowflake | null;
  }

  export interface Ban {
    reason: string | null;
    user: user.PublicUser;
  }

  export interface ClientStatus {
    desktop?: ActiveStatus;
    mobile?: ActiveStatus;
    web?: ActiveStatus;
  }

  export interface PresenceUpdateEvent {
    user: user.PublicUser;
    roles: Snowflake[];
    game: activity.Activity | null;
    guild_id: Snowflake;
    status: ActiveStatus | "offline";
    activities: activity.Activity[];
    client_status: ClientStatus;
    premium_since?: string | null;
    nick?: string | null;
  }

  export type ActiveStatus = "idle" | "dnd" | "online";

  export type Create =
    & Pick<Guild, "name">
    & Partial<
      NonNullable<
        Pick<
          Guild,
          | "region"
          | "icon"
          | "verification_level"
          | "default_message_notifications"
          | "explicit_content_filter"
          | "roles"
          | "channels"
          | "afk_channel_id"
          | "afk_timeout"
          | "system_channel_id"
        >
      >
    >;

  export type Modify =
    & Partial<Create>
    & Partial<
      NonNullable<
        Pick<
          Guild,
          | "owner_id"
          | "splash"
          | "banner"
          | "rules_channel_id"
          | "public_updates_channel_id"
          | "preferred_locale"
        >
      >
    >;

  export type BanDeleteMessageDays = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

  export interface CreateBan {
    delete_message_days?: BanDeleteMessageDays;
    reason?: string;
  }

  export interface PruneCount {
    days?: number;
    include_roles?: string;
  }

  export interface BeginPruneParams {
    days: number;
    compute_prune_count: boolean;
    include_roles?: Snowflake[];
  }

  export interface BeginPrune {
    pruned: number | null;
  }

  export type WidgetModify = Partial<Widget>;

  export interface WidgetEmbedStyle {
    style?: "shield" | "banner1" | "banner2" | "banner3" | "banner4";
  }

  export type UnavailableGuild = Pick<Guild, "id" | "unavailable">;

  export interface BanEvent {
    guild_id: Snowflake;
    user: user.PublicUser;
  }

  export interface EmojisUpdateEvent {
    guild_id: Snowflake;
    emojis: emoji.Emoji[];
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
  }

  export interface MembersChunkEvent {
    guild_id: Snowflake;
    members: guildMember.GuildMember[];
    chunk_index: number;
    chunk_count: number;
    not_found?: [];
    presences?: PresenceUpdateEvent[];
    nonce?: string;
  }
}

export namespace guildMember {
  export interface GuildMember {
    user?: user.PublicUser;
    nick: string | null;
    roles: Snowflake[];
    joined_at: ISO8601;
    premium_since?: ISO8601 | null;
    deaf: boolean;
    mute: boolean;
  }

  export interface List {
    limit?: number;
    after?: Snowflake;
  }

  export interface Add extends
    Partial<
      NonNullable<Pick<GuildMember, "nick" | "roles" | "mute" | "deaf">>
    > {
    access_token: string;
  }

  export interface ModifyCurrentNick {
    nick?: string | null;
  }

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
    syncing: boolean;
    role_id: Snowflake;
    enable_emoticons?: boolean;
    expire_behavior: 1 | 2;
    expire_grace_period: number;
    user: user.PublicUser;
    account: Account;
    synced_at: ISO8601;
  }

  export interface Account {
    id: string;
    name: string;
  }

  export type Create = Pick<Integration, "id" | "type">;

  export type Modify = Partial<
    Pick<
      Integration,
      "expire_behavior" | "expire_grace_period" | "enable_emoticons"
    >
  >;
}

export namespace invite {
  export interface Invite {
    code: string;
    guild?: Partial<guild.Guild>;
    channel: Partial<channel.Channel>;
    inviter?: user.PublicUser;
    target_user?: Partial<user.PublicUser>;
    target_user_type?: 1;
    approximate_presence_count?: number;
    approximate_member_count?: number;
  }

  export interface MetadataInvite extends Invite {
    uses: number;
    max_uses: number;
    max_age: number;
    temporary: boolean;
    created_at: ISO8601;
  }

  export interface Create extends
    Partial<
      Pick<
        MetadataInvite,
        "max_age" | "max_uses" | "temporary" | "target_user_type"
      >
    > {
    unique?: boolean;
    target_user?: Snowflake;
  }

  export type VanityURL = Pick<MetadataInvite, "code" | "uses">;

  export interface CreateEvent extends
    Pick<
      MetadataInvite,
      | "code"
      | "created_at"
      | "inviter"
      | "max_age"
      | "max_uses"
      | "target_user"
      | "target_user_type"
      | "temporary"
      | "uses"
    > {
    channel_id: Snowflake;
    guild_id: Snowflake;
  }

  export type DeleteEvent =
    & Pick<CreateEvent, "channel_id" | "code">
    & Partial<Pick<CreateEvent, "guild_id">>;
}

export namespace message {
  export interface Message {
    id: Snowflake;
    channel_id: Snowflake;
    guild_id?: Snowflake;
    author:
      | user.PublicUser
      | (Pick<user.PublicUser, "username" | "avatar"> & {
        webhook_id: Snowflake;
      });
    member?: Partial<guildMember.GuildMember>;
    content: string;
    timestamp: ISO8601;
    edited_timestamp: ISO8601 | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions:
      (user.PublicUser & { member: Partial<guildMember.GuildMember> })[];
    mention_roles: Snowflake[];
    mention_channels?: channel.Mention[];
    attachments: attachment.Attachment[];
    embeds: embed.Embed[];
    reactions?: reaction.Reaction[];
    nonce?: number | string;
    pinned: boolean;
    webhook_id?: Snowflake;
    type: Type;
    activity?: Activity;
    application?: Application;
    message_reference?: Reference;
    flags?: number;
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
    | 15;

  export interface Activity {
    type: 1 | 2 | 3 | 5;
    party_id?: string;
  }

  export interface Application {
    id: Snowflake;
    cover_image?: string;
    description: string;
    icon: string | null;
    name: string;
  }

  export interface AllowedMentions {
    parse: ("roles" | "users" | "everyone")[];
    roles: Snowflake[];
    users: Snowflake[];
  }

  export interface Reference {
    message_id?: Snowflake;
    channel_id: Snowflake;
    guild_id?: Snowflake;
  }

  export interface Create
    extends Partial<Pick<Message, "content" | "nonce" | "tts">> {
    file?: File;
    embed?: embed.Embed;
    payload_json?: string;
    allowed_mentions?: AllowedMentions;
  }

  export type Edit = Partial<
    Pick<Message, "content" | "flags"> & Pick<Create, "embed">
  >;

  export type DeleteEvent = Pick<Message, "id" | "channel_id" | "guild_id">;

  export interface ReactionAddEvent {
    user_id: Snowflake;
    channel_id: Snowflake;
    message_id: Snowflake;
    guild_id?: Snowflake;
    member?: guildMember.GuildMember;
    emoji: Partial<emoji.Emoji>;
  }

  export type ReactionRemoveEvent = Omit<ReactionAddEvent, "member">;

  export type ReactionRemoveAllEvent = Omit<
    ReactionRemoveEvent,
    "emoji" | "user_id"
  >;

  export type ReactionRemoveEmojiEvent = Omit<ReactionRemoveEvent, "user_id">;
}

export namespace reaction {
  export interface Reaction {
    count: number;
    me: boolean;
    emoji: Pick<emoji.Emoji, "id" | "name">;
  }
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
    permissions: number;
    permissions_new: string;
    managed: boolean;
    mentionable: boolean;
  }

  export interface Create
    extends Pick<Role, "name" | "color" | "hoist" | "mentionable"> {
    permissions: number | string;
  }

  export type ModifyPosition = Pick<Role, "id" | "position">;

  export type Modify = Partial<Create>;

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
    premium_type?: 0 | 1 | 2;
    public_flags?: number;
  }

  export interface PrivateUser extends PublicUser {
    mfa_enabled: boolean;
    locale: string;
    verified: boolean;
    email: string | null;
    flags?: number;
    phone?: string | null;
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

  export type Modify = Partial<
    NonNullable<Pick<PrivateUser, "username" | "avatar">>
  >;

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
    endpoint: string;
  }
}

export namespace webhook {
  export interface Webhook {
    id: Snowflake;
    type: 1 | 2;
    guild_id?: Snowflake;
    channel_id: Snowflake;
    user?: user.PublicUser;
    name?: string | null;
    avatar?: string | null;
    token?: string;
  }

  export type Create =
    & NonNullable<Pick<Webhook, "name">>
    & Required<Pick<Webhook, "name">>;

  export type Modify = Partial<
    NonNullable<Pick<Webhook, "name" | "avatar" | "channel_id">>
  >;

  export interface ExecuteParams {
    wait?: boolean;
  }

  export interface ExecuteBody extends Omit<message.Create, "embed" | "nonce"> {
    username?: string;
    avatar_url?: string;
    embeds?: embed.Embed[];
  }

  export type UpdateEvent = NonNullable<
    Pick<Webhook, "guild_id" | "channel_id">
  >;
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

  interface OpPayload<T extends keyof Ops> {
    op: T;
    d: Ops[T];
    s: null;
    t: null;
  }

  type SpecificOpPayload<T extends keyof Ops> = T extends keyof Ops
    ? OpPayload<T>
    : never;

  export type Payload =
    | SpecificEventPayload<keyof Events>
    | SpecificOpPayload<keyof Ops>;

  export interface Ops {
    1: number;
    7: undefined;
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

    CHANNEL_CREATE: channel.Channel;
    CHANNEL_UPDATE: channel.Channel;
    CHANNEL_DELETE: channel.Channel;
    CHANNEL_PINS_UPDATE: channel.PinsUpdateEvent;

    GUILD_CREATE: guild.Guild;
    GUILD_UPDATE: guild.Guild;
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

    INVITE_CREATE: invite.CreateEvent;
    INVITE_DELETE: invite.DeleteEvent;

    MESSAGE_CREATE: message.Message;
    MESSAGE_UPDATE: message.Message;
    MESSAGE_DELETE: message.DeleteEvent;
    MESSAGE_DELETE_BULK: channel.DeleteBulkEvent;
    MESSAGE_REACTION_ADD: message.ReactionAddEvent;
    MESSAGE_REACTION_REMOVE: message.ReactionRemoveEvent;
    MESSAGE_REACTION_REMOVE_ALL: message.ReactionRemoveAllEvent;
    MESSAGE_REACTION_REMOVE_EMOJI: message.ReactionRemoveEmojiEvent;

    PRESENCE_UPDATE: guild.PresenceUpdateEvent;
    TYPING_START: channel.TypingStartEvent;
    USER_UPDATE: user.PublicUser;

    VOICE_STATE_UPDATE: voice.State;
    VOICE_SERVER_UPDATE: voice.ServerUpdateEvent;

    WEBHOOKS_UPDATE: webhook.UpdateEvent;
  }

  export interface ReadyEvent {
    v: number;
    user: user.PrivateUser;
    private_channels: [];
    guilds: guild.UnavailableGuild[];
    session_id: string;
    shard?: [number, number];
  }

  export interface GuildRequestMembers {
    guild_id: Snowflake | Snowflake[];
    query?: string;
    limit: number;
    presences?: boolean;
    user_ids?: Snowflake | Snowflake[];
    nonce?: string;
  }

  export interface StatusUpdate {
    since: number | null;
    game: activity.Activity | null;
    status: string;
    afk: boolean;
  }
}
