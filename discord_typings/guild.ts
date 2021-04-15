import type { ISO8601, Snowflake } from "./common.ts";
import type { Role } from "./role.ts";
import type { GuildEmoji } from "./emoji.ts";
import type { State as VoiceState } from "./voice.ts";
import type { GuildMember } from "./guildMember.ts";
import type { Presence } from "./presence.ts";
import type { PublicUser } from "./user.ts";
import type { GuildChannels } from "./channel.ts";

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
  roles: Role[];
  emojis: GuildEmoji[];
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
  nsfw: boolean;
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
  voice_states: Omit<VoiceState, "guild_id">[];
  members: GuildMember[];
  channels: GuildChannels[];
  presences: Presence[];
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
  user: PublicUser;
}

export interface Create {
  name: string;
  region?: string;
  icon?: string;
  verification_level?: VerificationLevel;
  default_message_notifications?: DefaultMessageNotifications;
  explicit_content_filter?: ExplicitContentFilter;
  roles?: Role[];
  channels?: (Partial<GuildChannels> & Pick<GuildChannels, "name">)[];
  afk_channel_id?: Snowflake;
  afk_timeout?: number;
  system_channel_id?: Snowflake;
  system_channel_flags?: number;
}

export interface Modify {
  name?: string;
  region?: string | null;
  verification_level?: VerificationLevel | null;
  default_message_notifications?: DefaultMessageNotifications | null;
  explicit_content_filter?: ExplicitContentFilter | null;
  afk_channel_id?: Snowflake | null;
  afk_timeout?: number;
  icon?: string | null;
  owner_id?: Snowflake;
  splash?: string | null;
  discovery_splash?: string | null;
  banner?: string | null;
  system_channel_id?: Snowflake | null;
  system_channel_flags?: number;
  rules_channel_id?: Snowflake | null;
  public_updates_channel_id?: Snowflake | null;
  preferred_locale?: string | null;
  features?: Features[];
  description?: string;
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
  user: PublicUser;
}

export interface EmojisUpdateEvent {
  guild_id: Snowflake;
  emojis: GuildEmoji[];
}

export interface IntegrationsUpdateEvent {
  guild_id: Snowflake;
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
