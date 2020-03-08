import {Snowflake} from "../utils/mod.ts";

import Activity from "./Activity.ts";
import Channel from "./Channel.ts";
import Emoji from "./Emoji.ts";
import GuildMember from "./GuildMember.ts";
import Role from "./Role.ts";
import User from "./User.ts";
import VoiceState from "./VoiceState.ts";


export interface Embed {
	enabled: boolean,
	channel_id: Snowflake | null
}

export interface Ban {
	reason: string | null,
	user: User
}

export interface ClientStatus {
	desktop?: ActiveStatus,
	mobile?: ActiveStatus,
	web?: ActiveStatus
}

export interface PresenceUpdateEvent {
	user: User,
	roles: Snowflake[],
	game: Activity | null,
	guild_id: Snowflake,
	status: ActiveStatus | "offline",
	activities: Activity[],
	client_status: ClientStatus,
	premium_since?: string | null,
	nick?: string | null
}


export type ActiveStatus = "idle" | "dnd" | "online";

export type Feature =
	"INVITE_SPLASH"
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


export enum VerificationLevel {
	NONE = 0,
	LOW = 1,
	MEDIUM = 2,
	HIGH = 3,
	VERY_HIGH = 4
}

export enum DefaultMessageNotificationLevel {
	ALL_MESSAGES = 0,
	ONLY_MENTIONS = 1
}

export enum ExplicitContentFilterLevel {
	DISABLED = 0,
	MEMBERS_WITHOUT_ROLES = 1,
	ALL_MEMBERS = 2
}

export enum MFALevel {
	NONE = 0,
	ELEVATED = 1
}

export enum SystemChannelFlags {
	SUPPRESS_JOIN_NOTIFICATIONS = 1 << 0,
	SUPPRESS_PREMIUM_SUBSCRIPTIONS = 1 << 1
}

export enum PremiumTier {
	NONE = 0,
	TIER_1 = 1,
	TIER_2 = 2,
	TIER_3 = 3
}


export default class Guild {
	id: Snowflake;
	name: string;
	icon: string | null;
	splash: string | null;
	discovery_splash: string | null;
	owner?: boolean;
	owner_id: Snowflake;
	permissions?: number;
	region: string;
	afk_channel_id: Snowflake | null;
	afk_timeout: number;
	embed_enabled?: boolean;
	embed_channel_id?: Snowflake | null;
	verification_level: VerificationLevel;
	default_message_notifications: DefaultMessageNotificationLevel;
	explicit_content_filter: ExplicitContentFilterLevel;
	roles: Role[];
	emojis: Emoji[];
	features: Feature[];
	mfa_level: MFALevel;
	application_id: Snowflake | null;
	widget_enabled?: boolean;
	widget_channel_id?: Snowflake | null;
	system_channel_id: Snowflake | null;
	system_channel_flags: SystemChannelFlags;
	rules_channel_id: Snowflake | null;
	joined_at?: string;
	large?: boolean;
	unavailable: boolean;
	member_count?: number;
	voice_states?: Partial<Omit<VoiceState, "guild_id">>[];
	members?: GuildMember[];
	channels?: Channel[];
	presences?: Partial<PresenceUpdateEvent>[];
	max_presences?: number | null;
	max_members?: number;
	vanity_url_code: string | null;
	description: string | null;
	banner: string | null;
	premium_tier: PremiumTier;
	premium_subscription_count?: number;
	preferred_locale: string;
	public_updates_channel_id: Snowflake | null;
}
