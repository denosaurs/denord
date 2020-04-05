import {ISO8601, Snowflake} from "./generics.ts";
import {User} from "./user.ts";


/** types of channels */
export enum Type {
	/** a text channel within a server */
	GUILD_TEXT = 0,
	/** a direct message between users */
	DM = 1,
	/** a voice channel within a server */
	GUILD_VOICE = 2,
	/** a direct message between multiple users */
	GROUP_DM = 3,
	/** an organizational category that contains up to 50 channels */
	GUILD_CATEGORY = 4,
	/** a channel that users can follow and crosspost into their own server */
	GUILD_NEWS = 5,
	/** a channel in which game developers can sell their game on Discord */
	GUILD_STORE = 6
}


/** explicit permission overwrites for members and roles */
export interface Overwrite {
	/** role id or user id */
	id: Snowflake;
	/** what type of id you want to overwrite */
	type: "role" | "member";
	/** permission bit set */
	allow: number;
	/** permission bit set */
	deny: number;
}

/** a channel mention */
export interface Mention {
	/** id of the channel */
	id: Snowflake;
	/** id of the guild containing the channel */
	guild_id: Snowflake;
	/** the type of channel */
	type: Type;
	/** the name of the channel */
	name: string;
}


/** a channel */
export interface Channel {
	/** the id of this channel */
	id: Snowflake;
	/** the type of channel */
	type: Type;
	/** the id of the guild */
	guild_id?: Snowflake;
	/** sorting position of the channel */
	position?: number;
	/** explicit permission overwrites for members and roles */
	permission_overwrites?: Overwrite[];
	/** the name of the channel (2-100 characters) */
	name?: string;
	/** the channel topic (0-1024 characters) */
	topic?: string | null;
	/** whether the channel is nsfw */
	nsfw?: boolean;
	/** the id of the last message sent in this channel (may not point to an existing or valid message) */
	last_message_id?: Snowflake | null;
	/** the bitrate (in bits) of the voice channel */
	bitrate?: number;
	/** the user limit of the voice channel */
	user_limit?: number;
	/** amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected */
	rate_limit_per_user?: number;
	/** the recipients of the DM */
	recipients?: User[];
	/** icon hash */
	icon?: string | null;
	/** id of the DM creator */
	owner_id?: Snowflake;
	/** application id of the group DM creator if it is bot-created */
	application_id?: Snowflake;
	/** id of the parent category for a channel (each parent category can contain up to 50 channels) */
	parent_id?: Snowflake | null;
	/** when the last pinned message was pinned */
	last_pin_timestamp?: ISO8601;
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
	permission_overwrites?: Overwrite[];
	parent_id?: Snowflake;
	nsfw?: boolean;
}

//type x = Pick<Channel, "name" | "type" | "topic" | "bitrate" | "user_limit" | "rate_limit_per_user" | "position" | "permission_overwrites" | "parent_id" | "nsfw">;

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
	nicks: { [key: string]: string }
}
