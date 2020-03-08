import {Snowflake} from "../utils/mod.ts";

import Attachment from "./Attachment.ts";
import {Mention as ChannelMention} from "./Channel.ts";
import Embed from "./Embed.ts";
import GuildMember from "./GuildMember.ts";
import Reaction from "./Reaction.ts";
import User from "./User.ts";


export enum Type {
	DEFAULT = 0,
	RECIPIENT_ADD = 1,
	RECIPIENT_REMOVE = 2,
	CALL = 3,
	CHANNEL_NAME_CHANGE = 4,
	CHANNEL_ICON_CHANGE = 5,
	CHANNEL_PINNED_MESSAGE = 6,
	GUILD_MEMBER_JOIN = 7,
	USER_PREMIUM_GUILD_SUBSCRIPTION = 8,
	USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1 = 9,
	USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2 = 10,
	USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3 = 11,
	CHANNEL_FOLLOW_ADD = 12,
	GUILD_DISCOVERY_DISQUALIFIED = 14,
	GUILD_DISCOVERY_REQUALIFIED = 15
}

export enum ActivityType {
	JOIN = 1,
	SPECTATE = 2,
	LISTEN = 3,
	JOIN_REQUEST = 5
}

export enum Flags {
	CROSSPOSTED = 1 << 0,
	IS_CROSSPOST = 1 << 1,
	SUPPRESS_EMBEDS = 1 << 2,
	SOURCE_MESSAGE_DELETED = 1 << 3,
	URGENT = 1 << 4
}


export interface Activity {
	type: ActivityType,
	party_id?: string
}

export interface Application {
	id: Snowflake,
	cover_image?: string,
	description: string,
	icon: string | null,
	name: string
}

export interface Reference {
	message_id?: Snowflake,
	channel_id: Snowflake,
	guild_id?: Snowflake
}


export class Message {
	id: Snowflake;
	channel_id: Snowflake;
	guild_id?: Snowflake;
	author: User | Pick<User, "webhook_id" | "username" | "avatar">;
	member?: Partial<GuildMember>;
	content: string;
	timestamp: string;
	edited_timestamp: string | null;
	tts: boolean;
	mention_everyone: boolean;
	mentions: (User & { member: Partial<GuildMember> })[];
	mention_roles: Snowflake[];
	mention_channels?: ChannelMention;
	attachments: Attachment[];
	embeds: Embed[];
	reactions?: Reaction[];
	nonce?: number | string;
	pinned: boolean;
	webhook_id?: Snowflake;
	type: Type;
	activity?: Activity;
	application?: Application;
	message_reference?: Reference;
	flags?: Flags;
}
