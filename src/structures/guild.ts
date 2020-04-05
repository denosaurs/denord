import {ISO8601, Snowflake} from "./generics.ts";
import {Activity} from "./activity.ts";
import {Channel} from "./channel.ts";
import {GuildMember} from "./guildMember.ts";
import {User} from "./user.ts";
import {VoiceState} from "./voice.ts";
import {Role} from "./role.ts";
import {Emoji} from "./emoji.ts";


/** a guild embed */
export interface Embed {
	/** whether the embed is enabled */
	enabled: boolean;
	/** the embed channel id */
	channel_id: Snowflake | null;
}

/** a guild ban */
export interface Ban {
	/** the reason for the ban */
	reason: string | null;
	/** the banned user */
	user: User;
}

/** a user's status. active sessions are indicated with an "online", "idle", or "dnd" string per platform. If a user is offline or invisible, the corresponding field is not present. */
export interface ClientStatus {
	/** the user's status set for an active desktop (Windows, Linux, Mac) application session */
	desktop?: ActiveStatus;
	/** the user's status set for an active mobile (iOS, Android) application session */
	mobile?: ActiveStatus;
	/** the user's status set for an active web (browser, bot account) application session */
	web?: ActiveStatus;
}

/** A user's presence is their current state on a guild. This event is sent when a user's presence or info, such as name or avatar, is updated. */
export interface PresenceUpdateEvent {
	/** the user presence is being updated for */
	user: User;
	/** roles this user is in */
	roles: Snowflake[];
	/** null, or the user's current activity */
	game: Activity | null;
	/** id of the guild */
	guild_id: Snowflake;
	/** the status of the user */
	status: ActiveStatus | "offline";
	/** user's current activities */
	activities: Activity[];
	/** user's platform-dependent status */
	client_status: ClientStatus;
	/** when the user started boosting the guild */
	premium_since?: string | null;
	/** this users guild nickname (if one is set) */
	nick?: string | null;
}


/** a user's active activity status */
export type ActiveStatus = "idle" | "dnd" | "online";


/** possible guild features */
export enum Feature {
	/** guild has access to set an invite splash background */
	INVITE_SPLASH = "INVITE_SPLASH",
	/** guild has access to set 384kbps bitrate in voice (previously VIP voice servers) */
	VIP_REGIONS = "VIP_REGIONS",
	/** guild has access to set a vanity URL */
	VANITY_URL = "VANITY_URL",
	/** guild is verified */
	VERIFIED = "VERIFIED",
	/** guild is partnered */
	PARTNERED = "PARTNERED",
	/** guild is public */
	PUBLIC = "PUBLIC",
	/** guild has access to use commerce features (i.e. create store channels) */
	COMMERCE = "COMMERCE",
	/** guild has access to create news channels */
	NEWS = "NEWS",
	/** guild is able to be discovered in the directory */
	DISCOVERABLE = "DISCOVERABLE",
	/** guild is able to be featured in the directory */
	FEATURABLE = "FEATURABLE",
	/** guild has access to set an animated guild icon */
	ANIMATED_ICON = "ANIMATED_ICON",
	/** guild has access to set a guild banner image */
	BANNER = "BANNER",
	/** guild cannot be public */
	PUBLIC_DISABLED = "PUBLIC_DISABLED"
}

/** the verification level a user needs to have to send messages */
export enum VerificationLevel {
	/** unrestricted */
	NONE = 0,
	/** must have verified email on account */
	LOW = 1,
	/** must be registered on Discord for longer than 5 minutes */
	MEDIUM = 2,
	/** must be a member of the server for longer than 10 minutes */
	HIGH = 3,
	/** must have a verified phone number */
	VERY_HIGH = 4
}

/** whether users will get notifications for all messages or only mentions */
export enum DefaultMessageNotificationLevel {
	/** notifications for all messages */
	ALL_MESSAGES = 0,
	/** notifications only for mentions */
	ONLY_MENTIONS = 1
}

/** scan media and tries to delete explicit content */
export enum ExplicitContentFilterLevel {
	/** don't scan media */
	DISABLED = 0,
	/** scan media from users without roles */
	MEMBERS_WITHOUT_ROLES = 1,
	/** scan media from all users */
	ALL_MEMBERS = 2
}

/** required two-factor authentication level for moderators */
export enum MFALevel {
	/** 2FA requirement disabled */
	NONE = 0,
	/** 2FA requirement enabled */
	ELEVATED = 1
}

/** flags for the system channel */
export enum SystemChannelFlags {
	/** suppress member join notifications */
	SUPPRESS_JOIN_NOTIFICATIONS = 1 << 0,
	/** Suppress server boost notifications */
	SUPPRESS_PREMIUM_SUBSCRIPTIONS = 1 << 1
}

/** guild boost level */
export enum PremiumTier {
	NONE = 0,
	TIER_1 = 1,
	TIER_2 = 2,
	TIER_3 = 3
}


/** a guild */
export interface Guild {
	/** guild id */
	id: Snowflake;
	/** guild name (2-100 characters) */
	name: string;
	/** icon hash */
	icon: string | null;
	/** splash hash */
	splash: string | null;
	/** discovery splash hash */
	discovery_splash: string | null;
	/** whether or not the user is the owner of the guild */
	owner?: boolean;
	/** id of owner */
	owner_id: Snowflake;
	/** total permissions for the user in the guild (does not include channel overrides) */
	permissions?: number;
	/** voice region id for the guild */
	region: string;
	/** id of afk channel */
	afk_channel_id: Snowflake | null;
	/** afk timeout in seconds */
	afk_timeout: number;
	/** whether this guild is embeddable (e.g. widget) */
	embed_enabled?: boolean;
	/** if not null, the channel id that the widget will generate an invite to */
	embed_channel_id?: Snowflake | null;
	/** verification level required for the guild */
	verification_level: VerificationLevel;
	/** default message notifications level */
	default_message_notifications: DefaultMessageNotificationLevel;
	/** explicit content filter level */
	explicit_content_filter: ExplicitContentFilterLevel;
	/** roles in the guild */
	roles: Role[];
	/** custom guild emojis */
	emojis: Emoji[];
	/** enabled guild features */
	features: Feature[];
	/** required MFA level for moderators */
	mfa_level: MFALevel;
	/** application id of the guild creator if it is bot-created */
	application_id: Snowflake | null;
	/** whether or not the server widget is enabled */
	widget_enabled?: boolean;
	/** the channel id for the server widget */
	widget_channel_id?: Snowflake | null;
	/** the id of the channel where guild notices such as welcome messages and boost events are posted */
	system_channel_id: Snowflake | null;
	/** system channel flags */
	system_channel_flags: SystemChannelFlags;
	/** the id of the channel where "PUBLIC" guilds display rules and/or guidelines */
	rules_channel_id: Snowflake | null;
	/** when this guild was joined at */
	joined_at?: ISO8601;
	/** whether this is considered a large guild */
	large?: boolean;
	/** whether this guild is unavailable */
	unavailable: boolean;
	/** total number of members in this guild */
	member_count?: number;
	/** an array of partial voice state objects */
	voice_states?: Partial<Omit<VoiceState, "guild_id">>[];
	/** users in the guild */
	members?: GuildMember[];
	/** channels in the guild */
	channels?: Channel[];
	/** presences of the users in the guild */
	presences?: Partial<PresenceUpdateEvent>[];
	/** the maximum amount of presences for the guild (the default value, currently 5000, is in effect when null is returned) */
	max_presences?: number | null;
	/** the maximum amount of members for the guild */
	max_members?: number;
	/** the vanity url code for the guild */
	vanity_url_code: string | null;
	/** the description for the guild */
	description: string | null;
	/** banner hash */
	banner: string | null;
	/** server boost level */
	premium_tier: PremiumTier;
	/** the number of boosts this server currently has */
	premium_subscription_count?: number;
	/** the preferred locale of a "PUBLIC" guild used in server discovery and notices from Discord; defaults to "en-US" */
	preferred_locale: string;
	/** the id of the channel where admins and moderators of "PUBLIC" guilds receive notices from Discord */
	public_updates_channel_id: Snowflake | null;
}


export interface Create {
	name: string;
	region?: string;
	icon?: string;
	verification_level?: VerificationLevel;
	default_message_notifications?: DefaultMessageNotificationLevel;
	explicit_content_filter?: ExplicitContentFilterLevel;
	roles?: Role[];
	channels?: Partial<Channel>[];
	afk_channel_id?: Snowflake;
	afk_timeout?: number;
	system_channel_id?: Snowflake;
}

export interface Modify extends Partial<Create> {
	owner_id?: Snowflake;
	splash?: string;
	banner?: string;
	rules_channel_id?: Snowflake;
	public_updates_channel_id?: Snowflake;
	preferred_locale?: string;
}

export interface CreateBan {
	"delete-message-days"?: number;
	reason?: string;
}

export interface PruneCount {
	days?: number;
}

export interface BeginPrune {
	days: number;
	compute_prune_count: boolean;
}

export type EmbedModify = Partial<Embed>;

export interface WidgetEmbedStyle {
	style?: "shield" | "banner1" | "banner2" | "banner3" | "banner4"
}
